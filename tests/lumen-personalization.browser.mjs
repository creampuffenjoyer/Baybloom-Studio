import assert from "node:assert/strict";
import { test } from "node:test";
import { chromium } from "playwright-core";

const base = process.env.PREVIEW_BASE ?? "http://localhost:3000";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname)) throw new Error("Browser checks must target a local server");

test("Lumen editor previews changes and saves its own draft", { timeout: 90_000 }, async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    let saved;
    await page.route("**/api/personalization/lumen-lake-villas", async (route) => {
      if (route.request().method() === "PUT") {
        saved = route.request().postDataJSON();
        await route.fulfill({ json: { updatedAt: new Date().toISOString() } });
      } else await route.fulfill({ json: { draft: saved?.draft ?? null, hasPhoto: false, updatedAt: new Date().toISOString() } });
    });
    await page.goto(`${base}/personalize/lumen-lake-villas`, { waitUntil: "domcontentloaded" });
    await page.getByLabel("Business name").fill("Lake Haven");
    await page.getByLabel("Home page headline").fill("Find your calm");
    await page.getByLabel("Email", { exact: true }).fill("hello@lake.example");
    const preview = page.frameLocator('iframe[title="Lumen Lake Villas home page preview"]');
    await preview.getByRole("heading", { name: "Find your calm" }).waitFor();
    await preview.getByText("hello@lake.example").waitFor();
    await page.getByText("More website wording", { exact: true }).click();
    await page.getByLabel("Find wording").fill("Compare the villas");
    await page.getByLabel("Replacement wording").fill("Explore the stays");
    await preview.getByText("Explore the stays", { exact: true }).waitFor();
    await page.getByText("Villa content", { exact: true }).click();
    await page.getByLabel("Villa name").fill("Lake Suite");
    await page.getByLabel("Nightly price (SEK)").fill("4500");
    await page.getByRole("button", { name: "Preview villa" }).click();
    await preview.getByRole("heading", { name: "Lake Suite", exact: true }).waitFor();
    await page.getByText("Website photos", { exact: true }).click();
    await page.getByLabel("Website photo", { exact: true }).selectOption("villas");
    await page.getByLabel("Photo description").fill("Our lake villa");
    await page.getByLabel("Replace website photo").setInputFiles({ name: "villa.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aL8AAAAASUVORK5CYII=", "base64") });
    await preview.getByAltText("Our lake villa").first().waitFor();
    await page.getByText("Experiences content", { exact: true }).click();
    await page.getByLabel("Experience name").fill("Morning paddle");
    await page.getByRole("button", { name: "Preview experiences" }).click();
    await preview.getByText("Morning paddle", { exact: true }).waitFor();
    await page.getByText("Sample booking extras", { exact: true }).click();
    await page.getByLabel("Extra price (SEK)").fill("300");
    await page.getByText("Stay times and tour", { exact: true }).click();
    await page.getByLabel("Jetty scene name").fill("Lakeside jetty");
    await page.getByRole("button", { name: "Preview virtual tour" }).click();
    await preview.getByText("Lakeside jetty", { exact: true }).first().waitFor();
    await page.getByLabel("Preview page").selectOption("home");
    await page.getByLabel("Home page photo").setInputFiles({ name: "sample.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aL8AAAAASUVORK5CYII=", "base64") });
    await preview.locator('img[alt="Your selected hero image"]').waitFor();
    await page.getByRole("button", { name: "mobile", exact: true }).click();
    assert.equal(await preview.locator("body").evaluate(() => innerWidth), 390);
    await page.getByRole("button", { name: "Save draft" }).click();
    await page.getByRole("status").getByText("Draft saved. Save each changed website photo separately.").waitFor();
    assert.equal(saved.draft.template, "lumen-lake-villas");
    assert.equal(saved.photo.action, "replace");
    assert.equal(saved.draft.lumenVillas["shore-villa"].price, 4500);
    assert.equal(saved.draft.lumenExperiences.kayak.name, "Morning paddle");
    assert.equal(saved.draft.lumenPhotoAlt.villas, "Our lake villa");
    assert.equal(saved.draft.lumenTour.jetty, "Lakeside jetty");
    assert.equal(saved.draft.lumenExtras.breakfast.price, 300);
    await page.getByRole("button", { name: "Reset changes" }).click();
    await page.getByRole("button", { name: "Load saved draft" }).click();
    await preview.getByRole("heading", { name: "Find your calm" }).waitFor();
  } finally { await browser.close(); }
});
