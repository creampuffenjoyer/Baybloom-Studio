import assert from "node:assert/strict";
import { test } from "node:test";
import { chromium } from "playwright-core";
const base = process.env.PREVIEW_BASE ?? "http://localhost:3000";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname)) throw new Error("Local test server required");
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aL8AAAAASUVORK5CYII=", "base64");
for (const [slug, title, slot, pages, field] of [["harbor-house", "Harbor House", "lighthouse", ["home", "lighthouse-room"], "housePhotoAlt"], ["coral-cove", "Coral Cove", "reef-fish", ["experiences", "offers"], "coralPhotoAlt"], ["harbor-house", "Harbor House", "room-white", ["rooms", "lighthouse-room"], "housePhotoAlt"], ["coral-cove", "Coral Cove", "overwater-row", ["villas", "overwater-villa"], "coralPhotoAlt"]]) test(`${title} ${slot} library photo previews, saves and restores`, { timeout: 90000 }, async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } }); let saved; let hasPhoto = false;
    const imageUrl = `/api/personalization/${slug}/photos/${slot}/image`;
    await page.route(`**/api/personalization/${slug}`, async route => { if (route.request().method() === "PUT") { saved = route.request().postDataJSON(); await route.fulfill({ json: { updatedAt: "2026-11-10T00:00:00Z" } }); } else await route.fulfill({ json: { draft: saved?.draft ?? null, photos: hasPhoto ? [{ slot, updatedAt: "2026-11-10T00:00:00Z" }] : [] } }); });
    await page.route(`**${imageUrl}*`, async route => { if (route.request().method() === "GET") await route.fulfill({ contentType: "image/png", body: png }); else { hasPhoto = route.request().method() === "PUT"; await route.fulfill({ json: { updatedAt: "2026-11-10T00:00:00Z" } }); } });
    await page.goto(`${base}/personalize/${slug}`, { waitUntil: "domcontentloaded" });
    const controls = page.locator("details").filter({ has: page.locator("summary").filter({ hasText: /^Website photos$/ }) });
    await controls.locator("summary").click();
    await controls.getByLabel("Website photo", { exact: true }).selectOption(slot);
    await controls.getByLabel("Photo description").fill("Our replacement photo");
    await controls.getByLabel("Replace website photo").setInputFiles({ name: "photo.png", mimeType: "image/png", buffer: png });
    const preview = page.frameLocator(`iframe[title="${title} home page preview"]`);
    for (const previewPage of pages) { await page.getByLabel("Preview page").selectOption(previewPage); const img = preview.getByAltText("Our replacement photo").first(); await img.waitFor(); assert.match(await img.getAttribute("src"), /^blob:/); }
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await page.getByRole("status").getByText("Draft saved. Save each changed website photo separately.").waitFor();
    assert.equal(saved.draft[field][slot], "Our replacement photo");
    await controls.getByRole("button", { name: "Save website photo", exact: true }).click();
    await page.getByRole("status").getByText("Website photo saved. Text changes still need Save draft.").waitFor();
    await page.getByRole("button", { name: "Reset changes", exact: true }).click();
    await page.getByRole("button", { name: "Load saved draft", exact: true }).click();
    await page.getByRole("status").getByText("Saved draft and photo loaded.").waitFor();
    await page.getByLabel("Preview page").selectOption(pages[0]);
    assert.match(await preview.getByAltText("Our replacement photo").first().getAttribute("src"), /^\/api\/personalization\//);
    await controls.getByRole("button", { name: "Use original website photo", exact: true }).click();
    await controls.getByRole("button", { name: "Save website photo", exact: true }).click();
    await page.getByRole("status").getByText("Website photo saved. Text changes still need Save draft.").waitFor();
    assert.match(await preview.getByAltText("Our replacement photo").first().getAttribute("src"), /^\/(_next\/image|templates\/)/);
  } finally { await browser.close(); }
});
