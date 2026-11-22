import assert from "node:assert/strict";
import { test } from "node:test";
import { chromium } from "playwright-core";

// Run against a local production build: node --test tests/harbor-preview.browser.mjs
const base = process.env.PREVIEW_BASE ?? "http://localhost:3100";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname)) {
  throw new Error("Preview browser checks must target a local server");
}

test("Harbor House preview navigation, device state, and mobile layout", { timeout: 90_000 }, async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.setDefaultTimeout(15_000);
    await page.goto(`${base}/preview/harbor-house?page=%2Fbook&device=mobile`, { waitUntil: "domcontentloaded" });
    const frame = page.frameLocator("iframe");
    await frame.getByRole("heading", { name: "Book a room", exact: true }).waitFor();
    assert.equal(Math.round((await page.locator("iframe").boundingBox()).width), 390);
    assert.equal(await frame.getByRole("complementary", { name: "Template preview controls" }).count(), 0);

    // Reproduces the stale src bug: internal navigation leaves src unchanged.
    await frame.getByRole("link", { name: "Harbor House", exact: true }).first().click();
    await page.waitForFunction(() => new URL(location.href).searchParams.get("page") === "", null, { timeout: 15_000 });
    await page.getByLabel("Preview page").selectOption("/book");
    await frame.getByRole("heading", { name: "Book a room", exact: true }).waitFor();

    // Resizing should keep the iframe document and its current interaction state.
    await frame.locator("body").evaluate((body) => { body.dataset.previewCheck = "retained"; });
    await page.getByRole("button", { name: "desktop", exact: true }).click();
    assert.equal(await frame.locator("body").getAttribute("data-preview-check"), "retained");
    await page.getByRole("button", { name: "mobile", exact: true }).click();
    await page.reload({ waitUntil: "domcontentloaded" });
    await frame.getByRole("heading", { name: "Book a room", exact: true }).waitFor();
    assert.equal(await page.getByLabel("Preview page").inputValue(), "/book");
    assert.equal(Math.round((await page.locator("iframe").boundingBox()).width), 390);

    for (const width of [390, 360]) {
      await page.setViewportSize({ width, height: 844 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.equal(Math.round((await page.locator("iframe").boundingBox()).width), width);
      const toolbar = await page.locator("main > header").boundingBox();
      const content = await page.locator("iframe").boundingBox();
      assert.ok(content.y >= toolbar.y + toolbar.height, "Toolbar must reserve space above preview");
    }

    // Parent-window messages cannot impersonate navigation from the frame.
    await page.evaluate(() => window.postMessage({ type: "harbor-preview-page", path: "/demo/harbor-house/guide" }, location.origin));
    assert.equal(await page.getByLabel("Preview page").inputValue(), "/book");

    await page.goto(`${base}/demo/harbor-house/book`, { waitUntil: "domcontentloaded" });
    await page.getByRole("complementary", { name: "Template preview controls" }).waitFor();
    assert.equal(await page.getByRole("region", { name: "Baybloom template demo" }).count(), 0);
    await page.goto(`${base}/preview/harbor-house?page=https://example.com`, { waitUntil: "domcontentloaded" });
    await page.locator("iframe").waitFor();
    assert.equal(await page.locator("iframe").getAttribute("src"), "/demo/harbor-house?lang=en");
  } finally {
    await browser.close();
  }
});
