import assert from "node:assert/strict";
import { test } from "node:test";
import { chromium } from "playwright-core";

const base = process.env.PREVIEW_BASE ?? "http://localhost:3000";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname)) throw new Error("Browser checks must target a local server");

test("Isla Verde editor previews changes and saves its own draft", { timeout: 90_000 }, async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    let saved;
    await page.route("**/api/personalization/isla-verde-boutique", async (route) => {
      if (route.request().method() === "PUT") {
        saved = route.request().postDataJSON();
        await route.fulfill({ json: { updatedAt: new Date().toISOString() } });
      } else await route.fulfill({ json: { draft: saved?.draft ?? null, hasPhoto: false, updatedAt: new Date().toISOString() } });
    });
    await page.goto(`${base}/personalize/isla-verde-boutique`, { waitUntil: "domcontentloaded" });
    await page.getByLabel("Business name").fill("Lake Haven");
    await page.getByLabel("Home page headline").fill("Find your calm");
    await page.getByLabel("Email", { exact: true }).fill("hello@lake.example");
    const preview = page.frameLocator('iframe[title="Isla Verde home page preview"]');
    await preview.getByRole("heading", { name: "Find your calm" }).waitFor();
    await preview.getByText("hello@lake.example").waitFor();
    await page.getByText("Room content", { exact: true }).click();
    await page.getByLabel("Room name").fill("Garden Room");
    await page.getByLabel("Nightly price (PHP)").fill("8500");
    await page.getByRole("button", { name: "Preview room" }).click();
    await preview.getByRole("heading", { name: "Garden Room", exact: true }).waitFor();
    await page.getByText("Website photos", { exact: true }).click();
    await page.getByLabel("Website photo", { exact: true }).selectOption("carved-bed");
    await page.getByLabel("Photo description").fill("Garden bedroom");
    await page.getByLabel("Replace website photo").setInputFiles({ name: "room.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aL8AAAAASUVORK5CYII=", "base64") });
    await preview.getByAltText("Garden bedroom").first().waitFor();
    await page.getByText("Dining highlights", { exact: true }).click();
    await page.getByLabel("Dish name").fill("Breakfast plate");
    await page.getByRole("button", { name: "Preview dining" }).click();
    await preview.getByText("Breakfast plate", { exact: true }).waitFor();
    await page.getByText("Event spaces", { exact: true }).click();
    await page.getByLabel("Space name").fill("Garden Hall");
    await page.getByRole("button", { name: "Preview events" }).click();
    await preview.getByText("Garden Hall", { exact: true }).waitFor();
    await page.getByText("Journal content", { exact: true }).click();
    await page.getByLabel("Article title").fill("A quiet morning");
    await page.getByRole("button", { name: "Preview article" }).click();
    await preview.getByRole("heading", { name: "A quiet morning", exact: true }).waitFor();
    await page.getByText("House story", { exact: true }).click();
    await page.getByLabel("Timeline year").fill("1920");
    await page.getByLabel("Timeline description").fill("Our story begins.");
    await page.getByRole("button", { name: "Preview story" }).click();
    await preview.getByText("Our story begins.", { exact: true }).waitFor();
    await page.getByText("More website wording", { exact: true }).click();
    await page.getByLabel("Find wording").fill("The story of the house");
    await page.getByLabel("Original wording").selectOption({ label: "The story of the house" });
    await page.getByLabel("Replacement wording").fill("The story of our home");
    await preview.getByRole("heading", { name: "The story of our home", exact: true }).waitFor();
    await page.getByLabel("Preview page").selectOption("home");
    await page.getByLabel("Home page photo").setInputFiles({ name: "sample.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aL8AAAAASUVORK5CYII=", "base64") });
    await preview.locator('img[alt="Your selected hero image"]').waitFor();
    await page.getByRole("button", { name: "mobile", exact: true }).click();
    assert.equal(await preview.locator("body").evaluate(() => innerWidth), 390);
    await page.getByRole("button", { name: "Save draft" }).click();
    await page.getByRole("status").getByText("Draft saved. Save each changed website photo separately.").waitFor();
    assert.equal(saved.draft.template, "isla-verde-boutique");
    assert.equal(saved.photo.action, "replace");
    assert.equal(saved.draft.islaRooms["casa-room"].price, 8500);
    assert.equal(saved.draft.islaMenu.first.name, "Breakfast plate");
    assert.equal(saved.draft.islaSpaces.first.name, "Garden Hall");
    assert.equal(saved.draft.islaPosts["a-morning-on-calle-crisologo"].title, "A quiet morning");
    assert.equal(saved.draft.islaStory.chapters.first.year, "1920");
    assert.equal(saved.draft.islaCopy["The story of the house"], "The story of our home");
    assert.equal(saved.draft.islaPhotoAlt["carved-bed"], "Garden bedroom");
    await page.getByRole("button", { name: "Reset changes" }).click();
    await page.getByRole("button", { name: "Load saved draft" }).click();
    await preview.getByRole("heading", { name: "Find your calm" }).waitFor();
  } finally { await browser.close(); }
});
