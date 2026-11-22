import assert from "node:assert/strict";
import { test } from "node:test";
import { chromium } from "playwright-core";

const base = process.env.PREVIEW_BASE ?? "http://localhost:3198";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname)) throw new Error("Use a local server");

test("Isla preview supports languages and preserves the room handoff across device changes", { timeout: 90_000 }, async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    page.setDefaultTimeout(15_000);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${base}/preview/isla-verde-boutique?page=/story&lang=unsupported`);
    assert.equal(await page.getByRole("combobox", { name: "Preview language" }).inputValue(), "en");
    assert.equal(await page.getByRole("combobox", { name: "Preview language" }).locator("option").count(), 3);
    const frame = page.frameLocator("iframe");
    const finder = frame.getByRole("region", { name: "Find your place in the house" });
    await finder.getByRole("combobox", { name: "Guests", exact: true }).selectOption("4");
    await finder.getByRole("combobox", { name: "Your preferred setting", exact: true }).selectOption("Private pool");
    await finder.getByText("No room fits both choices.", { exact: false }).waitFor();
    await finder.getByRole("combobox", { name: "Your preferred setting", exact: true }).selectOption("Historic street");
    assert.equal(await finder.getByRole("listitem").count(), 1);
    const book = finder.getByRole("link", { name: "Plan a sample stay" });
    const target = new URL(await book.getAttribute("href"), base);
    assert.equal(target.searchParams.get("room"), "mansion-suite");
    assert.equal(target.searchParams.get("guests"), "4");
    await book.click();
    await page.waitForFunction(() => document.querySelector('[aria-label="Preview page"]').value === "/book");
    await page.getByRole("button", { name: "mobile", exact: true }).click();
    assert.equal(await page.locator("iframe").evaluate((element) => Math.round(element.getBoundingClientRect().width)), 390);
    assert.equal(await frame.getByRole("combobox", { name: "Guests", exact: true }).inputValue(), "4");
    await page.getByRole("combobox", { name: "Preview page" }).selectOption("/rooms");
    await frame.getByRole("heading", { name: "Rooms and suites", exact: true }).waitFor();
    await page.getByRole("combobox", { name: "Preview language" }).selectOption("tl");
    await frame.getByRole("heading", { name: "Mga silid at maluluwang na tuluyan", exact: true }).waitFor();
    await page.setViewportSize({ width: 360, height: 800 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.goto(`${base}/preview/isla-verde-boutique?page=https://example.com`);
    assert.equal(await page.locator("iframe").getAttribute("src"), "/demo/isla-verde-boutique?lang=en");
    await page.goto(`${base}/preview/coral-cove?lang=tl`);
    assert.equal(await page.getByRole("combobox", { name: "Preview language" }).inputValue(), "tl");
    assert.equal(await page.getByRole("combobox", { name: "Preview language" }).locator("option").count(), 3);
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
});
