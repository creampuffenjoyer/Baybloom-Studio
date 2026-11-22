import assert from "node:assert/strict";
import { test } from "node:test";
import { chromium } from "playwright-core";

const base = process.env.PREVIEW_BASE ?? "http://localhost:3000";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname)) throw new Error("Browser checks must target a local server");

test("Bloomfield Gardens editor previews changes and saves its own draft", { timeout: 90_000 }, async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    let saved;
    await page.route("**/api/personalization/bloomfield-gardens", async (route) => {
      if (route.request().method() === "PUT") {
        saved = route.request().postDataJSON();
        await route.fulfill({ json: { updatedAt: new Date().toISOString() } });
      } else await route.fulfill({ json: { draft: saved?.draft ?? null, hasPhoto: false, updatedAt: new Date().toISOString() } });
    });
    await page.goto(`${base}/personalize/bloomfield-gardens`, { waitUntil: "domcontentloaded" });
    await page.getByLabel("Business name").fill("Lake Haven");
    await page.getByLabel("Home page headline").fill("Find your calm");
    await page.getByLabel("Email", { exact: true }).fill("hello@lake.example");
    const preview = page.frameLocator('iframe[title="Bloomfield Gardens home page preview"]');
    await preview.getByRole("heading", { name: "Find your calm" }).waitFor();
    await preview.getByText("hello@lake.example").waitFor();
    await page.locator("summary").filter({ hasText: /^Venue spaces$/ }).click();
    await page.getByLabel("Space name", { exact: true }).fill("Garden Lawn");
    await page.getByLabel("Ceremony capacity").fill("120");
    await page.getByRole("button", { name: "Preview space", exact: true }).click();
    await preview.getByRole("heading", { name: "Garden Lawn", exact: true }).waitFor();
    await page.getByLabel("Preview page").selectOption("spaces");
    await preview.getByLabel("Guests", { exact: true }).fill("140");
    await preview.getByRole("status").filter({ hasText: "No space matches" }).waitFor();
    await page.locator("summary").filter({ hasText: /^Wedding packages$/ }).click();
    await page.getByLabel("Package name", { exact: true }).fill("Garden celebration");
    await page.getByLabel("Package price (PHP)").fill("125000");
    await page.getByRole("button", { name: "Preview packages", exact: true }).click();
    await preview.getByRole("heading", { name: "Garden celebration", exact: true }).waitFor();
    await page.getByLabel("Preview page").selectOption("inquire");
    await preview.getByLabel(/flexible on the date/).check();
    await preview.getByRole("button", { name: "Continue", exact: true }).click();
    await preview.getByRole("checkbox", { name: /Garden Lawn/ }).waitFor();
    await preview.getByRole("option", { name: "Garden celebration", exact: true }).waitFor({ state: "attached" });
    await page.locator("summary").filter({ hasText: /^Planning questions$/ }).click();
    await page.getByLabel("Answer", { exact: true }).fill("Please contact us to arrange a viewing.");
    await page.getByRole("button", { name: "Preview planning", exact: true }).click();
    await preview.locator("summary").first().click();
    await preview.getByText("Please contact us to arrange a viewing.", { exact: true }).waitFor();
    await page.locator("summary").filter({ hasText: /^More website wording$/ }).click();
    await page.getByLabel("Original wording").selectOption("Planning your day");
    await page.getByLabel("Replacement wording").fill("Plan your celebration");
    await preview.getByRole("heading", { name: "Plan your celebration", exact: true }).waitFor();
    await page.locator("summary").filter({ hasText: /^Website photos$/ }).click();
    await page.getByLabel("Website photo", { exact: true }).selectOption("lawn");
    await page.getByLabel("Photo description").fill("Our garden lawn");
    await page.getByLabel("Replace website photo").setInputFiles({ name: "lawn.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aL8AAAAASUVORK5CYII=", "base64") });
    await page.getByLabel("Preview page").selectOption("the-lawn");
    await preview.getByAltText("Our garden lawn").first().waitFor();
    await page.getByLabel("Preview page").selectOption("home");
    await page.getByLabel("Home page photo").setInputFiles({ name: "sample.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aL8AAAAASUVORK5CYII=", "base64") });
    await preview.locator('img[alt="Your selected hero image"]').waitFor();
    await page.getByRole("button", { name: "mobile", exact: true }).click();
    assert.equal(await preview.locator("body").evaluate(() => innerWidth), 390);
    await page.getByRole("button", { name: "Save draft" }).click();
    await page.getByRole("status").getByText("Draft saved. Save each changed website photo separately.").waitFor();
    assert.equal(saved.draft.template, "bloomfield-gardens");
    assert.equal(saved.photo.action, "replace");
    assert.equal(saved.draft.bloomSpaces["the-lawn"].name, "Garden Lawn");
    assert.equal(saved.draft.bloomPackages.first.price, 125000);
    assert.equal(saved.draft.bloomCopy["Planning your day"], "Plan your celebration");
    assert.equal(saved.draft.bloomPhotoAlt.lawn, "Our garden lawn");
    await page.getByRole("button", { name: "Reset changes" }).click();
    await page.getByRole("button", { name: "Load saved draft" }).click();
    await preview.getByRole("heading", { name: "Find your calm" }).waitFor();
  } finally { await browser.close(); }
});
