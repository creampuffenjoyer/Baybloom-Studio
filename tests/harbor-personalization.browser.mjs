import assert from "node:assert/strict";
import { test } from "node:test";
import { chromium } from "playwright-core";

const base = process.env.PREVIEW_BASE ?? "http://localhost:3000";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname)) throw new Error("Browser checks must target a local server");

test("Harbor personalization edits, resets, and handles save and load", { timeout: 180_000 }, async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on("dialog", dialog => dialog.accept());
    let saved;
    let photoSaved = false;
    const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aL8AAAAASUVORK5CYII=", "base64");
    // Let the real editor and iframe hydrate before request interception.
    await page.goto(`${base}/personalize/harbor-house`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => [...document.querySelectorAll("button")].some(button => button.textContent === "Load saved draft" && !button.disabled), null, { timeout: 90_000 });
    await page.route("**/api/personalization/harbor-house/placements/home.hero/image*", async route => {
      if (route.request().method() === "GET") await route.fulfill({ contentType: "image/png", body: png });
      else { photoSaved = route.request().method() === "PUT"; await route.fulfill({ json: { updatedAt: new Date().toISOString() } }); }
    });
    await page.route("**/api/personalization/harbor-house", async (route) => {
      if (route.request().method() === "PUT") {
        saved = route.request().postDataJSON();
        await route.fulfill({ json: { updatedAt: new Date().toISOString() } });
      } else {
        await route.fulfill({ json: { draft: saved?.draft ?? null, hasPhoto: false, updatedAt: new Date().toISOString(), placementPhotos: photoSaved ? [{ slot: "home.hero", updatedAt: new Date().toISOString() }] : [] } });
      }
    });
    await page.getByLabel("Business name").fill("Test Bay");
    await page.getByLabel("Home page headline").fill("Our seaside escape");
    await page.getByLabel("Email", { exact: true }).fill("hello@test.example");
    const preview = page.frameLocator('iframe[title="Harbor House home page preview"]');
    await preview.getByRole("heading", { name: "Our seaside escape" }).waitFor();
    assert.equal(await preview.getByText("Test Bay", { exact: true }).count(), 2);
    await preview.getByText("hello@test.example").waitFor();
    await page.locator("#harbor-photo-panel > div").first().getByLabel("Replace photo", { exact: true }).setInputFiles({ name: "sample.png", mimeType: "image/png", buffer: png });
    await preview.locator('img[data-harbor-photo="home.hero"][src^="blob:"]').waitFor();
    await page.getByRole("button", { name: "Save changes", exact: true }).click();
    await page.getByText("All text and photo changes saved.", { exact: true }).waitFor();
    assert.equal(saved.draft.business.name, "Test Bay");
    assert.equal(saved.photo.action, "keep");
    assert.equal(photoSaved, true);
    await page.getByRole("button", { name: "mobile", exact: true }).click();
    assert.equal(Math.round((await page.locator('iframe[title="Harbor House home page preview"]').boundingBox()).width), 390);
    assert.equal(await preview.locator("body").evaluate(() => innerWidth), 390);
    await preview.getByRole("heading", { name: "Our seaside escape" }).waitFor();
    await page.getByRole("button", { name: "Reset changes" }).click();
    assert.equal(await page.getByLabel("Business name").inputValue(), "");
    await page.getByRole("button", { name: "Load saved draft" }).click();
    await preview.getByRole("heading", { name: "Our seaside escape" }).waitFor();
    assert.equal(await page.getByLabel("Business name").inputValue(), "Test Bay");
    await page.setViewportSize({ width: 360, height: 800 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  } finally { await browser.close(); }
});
