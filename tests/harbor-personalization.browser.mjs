import assert from "node:assert/strict";
import { test } from "node:test";
import { chromium } from "playwright-core";

const base = process.env.PREVIEW_BASE ?? "http://localhost:3000";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname)) throw new Error("Browser checks must target a local server");

test("Harbor personalization edits, resets, and handles save and load", { timeout: 90_000 }, async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    let saved;
    await page.route("**/api/personalization/harbor-house", async (route) => {
      if (route.request().method() === "PUT") {
        saved = route.request().postDataJSON();
        await route.fulfill({ json: { updatedAt: new Date().toISOString() } });
      } else {
        await route.fulfill({ json: { draft: saved?.draft ?? null, hasPhoto: false, updatedAt: new Date().toISOString() } });
      }
    });
    await page.goto(`${base}/personalize/harbor-house`, { waitUntil: "domcontentloaded" });
    await page.getByLabel("Business name").fill("Test Bay");
    await page.getByLabel("Home page headline").fill("Our seaside escape");
    const preview = page.getByRole("region", { name: "Home page preview" });
    await preview.getByRole("heading", { name: "Our seaside escape" }).waitFor();
    assert.equal(await preview.getByText("Test Bay", { exact: true }).count(), 2);
    await page.getByRole("button", { name: "Save draft" }).click();
    await page.getByRole("status").getByText("Draft and photo changes saved to your account.").waitFor();
    assert.equal(saved.draft.business.name, "Test Bay");
    assert.equal(saved.photo.action, "keep");
    await page.getByRole("button", { name: "Reset changes" }).click();
    assert.equal(await page.getByLabel("Business name").inputValue(), "");
    await page.getByRole("button", { name: "Load saved draft" }).click();
    await preview.getByRole("heading", { name: "Our seaside escape" }).waitFor();
    assert.equal(await page.getByLabel("Business name").inputValue(), "Test Bay");
    await page.setViewportSize({ width: 360, height: 800 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  } finally { await browser.close(); }
});
