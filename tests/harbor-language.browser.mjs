import assert from "node:assert/strict";
import { test } from "node:test";
import { chromium } from "playwright-core";

const base = process.env.PREVIEW_BASE ?? "http://localhost:3100";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname)) throw new Error("Use a local server");

test("Harbor House language variants cover every page and preserve navigation/form state", { timeout: 120_000 }, async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    page.setDefaultTimeout(15_000);
    const cases = [
      ["", "Tuloy sa daungan. Almusal na lutong-bahay.", "Room sa daungan. Breakfast na lutong-bahay."],
      ["/rooms", "Ang aming mga kuwarto", "Ang aming rooms"],
      ["/rooms/lighthouse-room", "Ang Kuwarto ng Parola", "The Lighthouse Room"],
      ["/rooms/captains-room", "Ang Kuwarto ng Kapitan", "The Captain’s Room"],
      ["/rooms/rose-room", "Ang Kuwarto ng Rosas", "The Rose Room"],
      ["/rooms/attic-twin", "Ang Dalawahang Kuwarto sa Kisame", "The Attic Twin"],
      ["/breakfast", "Almusal", "Breakfast"],
      ["/guide", "Sa paligid ng Basco", "Around Basco"],
      ["/guestbook", "Mga mensahe ng aming mga panauhin", "Ang guestbook"],
      ["/contact", "Kumustahin kami", "Say hello"],
      ["/credits", "Pagkilala sa mga litratista", "Photo credits"],
      ["/book", "Magpareserba ng kuwarto", "Mag-book ng room"],
    ];
    for (const [index, language] of ["tl", "taglish"].entries()) {
      for (const [path, ...headings] of cases) {
        await page.goto(`${base}/demo/harbor-house${path}?lang=${language}`, { waitUntil: "domcontentloaded" });
        await page.locator('[data-template="harbor-house"]').getByRole("heading", { level: 1, name: headings[index], exact: true }).waitFor();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${language} ${path} overflows`);
        const links = await page.locator('[data-template="harbor-house"] a[href^="/demo/harbor-house"]').evaluateAll((nodes) => nodes.map((node) => node.href));
        assert.ok(links.every((link) => new URL(link).searchParams.get("lang") === language), `${path}: language lost in links`);
      }
    }

    await page.goto(`${base}/demo/harbor-house/contact?lang=tl`, { waitUntil: "domcontentloaded" });
    const form = page.locator('[data-template="harbor-house"] form');
    await form.locator('[name="name"]').fill("Sample Guest");
    await form.locator('[name="email"]').fill("invalid");
    await form.locator('[name="message"]').fill("Sample only");
    await form.getByRole("button", { name: "Subukan ang mensahe" }).click();
    assert.equal(await form.locator('[name="email"]').evaluate((field) => field.validationMessage), "Pakilagay ang wastong impormasyon.");
    await page.getByLabel("Wika", { exact: true }).selectOption("taglish");
    assert.equal(await form.locator('[name="name"]').inputValue(), "Sample Guest");
    await form.locator('[name="email"]').fill("sample@example.com");
    await form.getByRole("button", { name: "Try sending a message" }).click();
    await page.getByRole("status").filter({ hasText: "Done na ang sample message. Walang na-send." }).waitFor();

    await page.goto(`${base}/demo/harbor-house/book?lang=tl&checkin=2027-05-03&checkout=2027-05-04`, { waitUntil: "domcontentloaded" });
    await page.locator('label').filter({ has: page.locator('input[name="room"]:not(:disabled)') }).first().click();
    await page.getByRole("button", { name: "Magpatuloy", exact: true }).click();
    await page.locator('input[name="name"]').fill("Sample Guest");
    await page.getByLabel("Wika", { exact: true }).selectOption("taglish");
    assert.equal(await page.locator('input[name="name"]').inputValue(), "Sample Guest");
    await page.locator('input[name="phone"]').fill("09000000000");
    await page.locator('input[name="email"]').fill("sample@example.com");
    await page.getByRole("button", { name: "Complete sample booking", exact: true }).click();
    await page.getByRole("status").filter({ hasText: "Complete na ang sample booking" }).waitFor();
    await page.getByLabel("Language", { exact: true }).selectOption("tl");
    await page.getByRole("status").filter({ hasText: "Tapos na ang halimbawang pagpapareserba" }).waitFor();

    await page.goto(`${base}/preview/harbor-house?page=%2Fbook&lang=tl`, { waitUntil: "domcontentloaded" });
    const frame = page.frameLocator("iframe");
    await frame.getByRole("heading", { name: "Magpareserba ng kuwarto", exact: true }).waitFor();
    await frame.locator("body").evaluate((body) => { body.dataset.languageTest = "retained"; });
    await page.getByLabel("Preview language").selectOption("taglish");
    await frame.getByRole("heading", { name: "Mag-book ng room", exact: true }).waitFor();
    assert.equal(await frame.locator("body").getAttribute("data-language-test"), "retained");
    await frame.getByRole("link", { name: "Harbor House", exact: true }).first().click();
    await page.waitForFunction(() => new URL(location.href).searchParams.get("page") === "" && new URL(location.href).searchParams.get("lang") === "taglish", null, { timeout: 15_000 });
    await page.reload({ waitUntil: "domcontentloaded" });
    await frame.getByRole("heading", { name: cases[0][2], exact: true }).waitFor();
  } finally { await browser.close(); }
});
