import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import { test } from "node:test";
import { chromium } from "playwright-core";

function load(file) {
  if (file.endsWith(".json")) return JSON.parse(readFileSync(file, "utf8"));
  const ctx = { exports: {}, require: (name) => load(path.resolve(path.dirname(file), name.endsWith(".json") ? name : `${name}.ts`)) };
  vm.runInNewContext(ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText, ctx);
  return ctx.exports;
}
const { copy } = load("src/templates/isla-verde-boutique/translations.ts");
const { rooms, posts } = load("src/templates/isla-verde-boutique/content.ts");
const { isStayAvailable } = load("src/templates/_kit/availability.ts");
const { addDays, toDay } = load("src/templates/_kit/dates.ts");
const t = (key, lang) => lang === "en" ? key : copy[key][lang === "tl" ? 0 : 1];
const base = process.env.PREVIEW_BASE ?? "http://127.0.0.1:3198";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname)) throw new Error("Use a local server");
const demo = `${base}/demo/isla-verde-boutique`;

test("Isla language variants cover every route and preserve inquiries and bookings", { timeout: 240_000 }, async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 360, height: 800 } });
    page.setDefaultTimeout(15_000);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const routes = [["", "A house with a long memory."], ["/rooms", "Rooms and suites"], ["/story", "The story of the house"], ["/dining", "Comedor"], ["/events", "Weddings and gatherings"], ["/journal", "Journal"], ["/contact", "Write to us"], ["/book", "Reserve your stay"], ["/credits", "Photo credits"], ...rooms.map((r) => [`/rooms/${r.slug}`, r.name]), ...posts.map((p) => [`/journal/${p.slug}`, p.title])];
    for (const language of ["en", "tl", "taglish"]) for (const [route, title] of routes) {
      await page.goto(`${demo}${route}?lang=${language}`);
      await page.getByRole("heading", { level: 1, name: t(title, language), exact: true }).waitFor();
      await page.waitForFunction((lang) => document.documentElement.lang === lang, language === "en" ? "en" : "fil");
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `Overflow: ${route} ${language}`);
      if (language !== "en") {
        const body = (await page.locator('[data-template="isla-verde-boutique"]').innerText()).replace(/\s+/g, " ");
        const leaked = Object.keys(copy).filter((key) => key.length > 45 && t(key, language) !== key && body.includes(key));
        assert.deepEqual(leaked, [], `Untranslated copy: ${route} ${language}`);
      }
    }
    await page.goto(`${demo}/contact?lang=en`);
    await page.locator('input[name="name"]').fill("Sample Visitor");
    await page.locator('input[name="email"]').fill("guest@example.test");
    await page.locator('select[name="subject"]').selectOption("An event");
    await page.locator('textarea[name="message"]').fill("Sample inquiry only");
    for (const language of ["tl", "taglish", "en"]) {
      await page.locator('header select[aria-label]').selectOption(language);
      await page.getByRole("heading", { name: t("Write to us", language), exact: true }).waitFor();
      assert.equal(await page.locator('input[name="name"]').inputValue(), "Sample Visitor");
      assert.equal(await page.locator('select[name="subject"]').inputValue(), "An event");
      assert.equal(await page.locator('textarea[name="message"]').inputValue(), "Sample inquiry only");
    }
    await page.locator('header select[aria-label]').selectOption("tl");
    await page.getByRole("button", { name: t("Send message", "tl"), exact: true }).click();
    await page.getByText(t("Sample request complete", "tl"), { exact: true }).waitFor();
    await page.locator('header select[aria-label]').selectOption("taglish");
    await page.getByText(t("Sample request complete", "taglish"), { exact: true }).waitFor();

    let checkin = addDays(toDay(new Date()), 14);
    while (!isStayAvailable("casa-room", checkin, 1)) checkin = addDays(checkin, 1);
    const checkout = addDays(checkin, 1);
    await page.goto(`${demo}/book?room=casa-room&guests=2&checkin=${checkin}&checkout=${checkout}&lang=en`);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.locator('input[name="name"]').fill("Sample Guest");
    await page.locator('input[name="email"]').fill("sample@example.test");
    await page.locator('input[name="phone"]').fill("09170000000");
    await page.locator('select[name="arrival"]').selectOption("morning");
    await page.locator('fieldset input[type="checkbox"]').first().check();
    for (const language of ["tl", "taglish", "en"]) {
      await page.locator('header select[aria-label]').selectOption(language);
      await page.getByRole("heading", { level: 1, name: t("Reserve your stay", language), exact: true }).waitFor();
      assert.equal(await page.locator('input[name="name"]').inputValue(), "Sample Guest");
      assert.equal(await page.locator('input[name="email"]').inputValue(), "sample@example.test");
      assert.equal(await page.locator('select[name="arrival"]').inputValue(), "morning");
      assert.equal(await page.locator('fieldset input[type="checkbox"]').first().isChecked(), true);
      assert.equal(new URL(page.url()).searchParams.get("checkin"), checkin);
    }
    await page.locator('header select[aria-label]').selectOption("tl");
    await page.getByRole("button", { name: t("Review your stay", "tl"), exact: true }).click();
    await page.locator('form input[type="checkbox"]').check();
    await page.getByRole("button", { name: t("Confirm reservation", "tl"), exact: true }).click();
    await page.getByText(t("Your sample stay.", "tl"), { exact: true }).waitFor();
    await page.locator('header select[aria-label]').selectOption("taglish");
    await page.getByText(t("Your sample stay.", "taglish"), { exact: true }).waitFor();
    await page.getByRole("link", { name: t("Read about Vigan while you wait", "taglish"), exact: true }).click();
    await page.getByRole("heading", { level: 1, name: "Journal", exact: true }).waitFor();
    assert.equal(new URL(page.url()).searchParams.get("lang"), "taglish");
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
});
