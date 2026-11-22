import assert from "node:assert/strict";
import { test } from "node:test";
import { chromium } from "playwright-core";

const base = process.env.PREVIEW_BASE ?? "http://localhost:3000";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname)) throw new Error("Browser checks must target a local server");

test("Still Water Spa editor previews changes and saves its own draft", { timeout: 90_000 }, async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    let saved;
    await page.route("**/api/personalization/still-water-spa", async (route) => {
      if (route.request().method() === "PUT") {
        saved = route.request().postDataJSON();
        await route.fulfill({ json: { updatedAt: new Date().toISOString() } });
      } else await route.fulfill({ json: { draft: saved?.draft ?? null, hasPhoto: false, updatedAt: new Date().toISOString() } });
    });
    await page.goto(`${base}/personalize/still-water-spa`, { waitUntil: "domcontentloaded" });
    await page.getByLabel("Business name").fill("Lake Haven");
    await page.getByLabel("Home page headline").fill("Find your calm");
    await page.getByLabel("Email", { exact: true }).fill("hello@lake.example");
    const preview = page.frameLocator('iframe[title="Still Water Spa home page preview"]');
    await preview.getByRole("heading", { name: "Find your calm" }).waitFor();
    await preview.getByText("hello@lake.example").waitFor();
    await page.locator("summary").filter({ hasText: /^Treatments$/ }).click();
    await page.getByLabel("Treatment name").fill("Garden massage");
    await page.getByLabel("Treatment summary").fill("A relaxing garden ritual");
    await page.getByLabel("60-minute price (PHP)").fill("2800");
    await page.getByRole("button", { name: "Preview treatment" }).click();
    await preview.getByRole("heading", { name: "Garden massage" }).waitFor();
    await preview.getByText("₱2,800").first().waitFor();
    await page.locator("summary").filter({ hasText: /^Packages$/ }).click();
    await page.getByLabel("Package name").fill("Garden afternoon");
    await page.getByRole("button", { name: "Preview packages" }).click();
    await preview.getByRole("heading", { name: "Garden afternoon" }).waitFor();
    await page.getByText("Therapists", { exact: true }).first().click();
    await page.getByLabel("Therapist name").fill("Alex");
    await page.getByRole("button", { name: "Preview therapists" }).click();
    await preview.getByRole("heading", { name: "Alex", exact: true }).waitFor();
    await page.getByText("More website wording", { exact: true }).click();
    await page.getByLabel("Original wording").selectOption("Rest is a practice.");
    await page.getByLabel("Replacement wording").fill("Rest with us.");
    await preview.getByRole("heading", { name: "Rest with us." }).waitFor();
    await page.getByText("Website photos", { exact: true }).click();
    await page.getByLabel("Website photo", { exact: true }).selectOption("reception");
    await page.getByLabel("Photo description").fill("Our spa reception");
    await page.getByLabel("Replace website photo").setInputFiles({ name: "room.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aL8AAAAASUVORK5CYII=", "base64") });
    await preview.getByAltText("Our spa reception").waitFor();
    await page.getByText("Guest reviews", { exact: true }).first().click();
    await page.getByLabel("Review text").fill("A wonderful visit.");
    await page.getByRole("button", { name: "Preview reviews" }).click();
    await preview.getByText("A wonderful visit.", { exact: false }).waitFor();
    await page.getByLabel("Preview page").selectOption("home");
    await page.getByLabel("Home page photo").setInputFiles({ name: "sample.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aL8AAAAASUVORK5CYII=", "base64") });
    await preview.locator('img[alt="Your selected hero image"]').waitFor();
    await page.getByRole("button", { name: "mobile", exact: true }).click();
    assert.equal(await preview.locator("body").evaluate(() => innerWidth), 390);
    await page.getByRole("button", { name: "Save draft" }).click();
    await page.getByRole("status").getByText("Draft saved. Save each changed website photo separately.").waitFor();
    assert.equal(saved.draft.template, "still-water-spa");
    assert.equal(saved.photo.action, "replace");
    assert.equal(saved.draft.spaTreatments.hilot.name, "Garden massage");
    assert.equal(saved.draft.spaTreatments.hilot.prices.first, 2800);
    assert.equal(saved.draft.spaPackages.first.name, "Garden afternoon");
    assert.equal(saved.draft.spaTherapists.first.name, "Alex");
    assert.equal(saved.draft.spaReviews.first.quote, "A wonderful visit.");
    assert.equal(saved.draft.spaCopy["Rest is a practice."], "Rest with us.");
    assert.equal(saved.draft.spaPhotoAlt.reception, "Our spa reception");
    await page.getByRole("button", { name: "Reset changes" }).click();
    await page.getByRole("button", { name: "Load saved draft" }).click();
    await preview.getByRole("heading", { name: "Find your calm" }).waitFor();
  } finally { await browser.close(); }
});
