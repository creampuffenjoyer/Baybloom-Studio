import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { test } from "node:test";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { chromium } from "playwright-core";
import sharp from "sharp";
import { testDatabaseConfig } from "../scripts/personalization-test-config.mjs";

async function freePort() {
  const server = createServer();
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  const { port } = server.address();
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return port;
}

async function waitForServer(server, base) {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`Test server exited with code ${server.exitCode}`);
    try { if ((await fetch(`${base}/api/auth/csrf`)).ok) return; } catch { /* starting */ }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Test server did not become ready.");
}

test("signed-in editor saves a private draft and photo to the isolated database", { timeout: 240_000 }, async () => {
  const { target, direct } = testDatabaseConfig();
  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  const db = new PrismaClient({ datasources: { db: { url: target } } });
  const ids = [randomUUID(), randomUUID()];
  const emails = ids.map((id) => `draft-${id}@example.test`);
  const password = randomBytes(24).toString("base64url");
  const testIp = `198.18.${randomBytes(1)[0]}.${randomBytes(1)[0]}`;
  const secret = randomBytes(32).toString("base64url");
  let server;
  let browser;
  const serverDiagnostics = [];

  try {
    await mkdir(".next/personalization-e2e-config", { recursive: true });
    await writeFile(".next/personalization-e2e-config/tsconfig.json", JSON.stringify({
      extends: "../../tsconfig.json",
      include: ["../../next-env.d.ts", "../../src/**/*.ts", "../../src/**/*.tsx", "../personalization-e2e/types/**/*.ts", "../personalization-e2e/dev/types/**/*.ts"],
      exclude: ["../../node_modules"],
    }, null, 2));
    const passwordHash = await bcrypt.hash(password, 10);
    await db.user.createMany({ data: ids.map((id, i) => ({ id, email: emails[i], passwordHash, emailVerified: new Date() })) });
    const env = {
      ...process.env,
      BAYBLOOM_PERSONALIZATION_TEST: "1", DATABASE_URL: target, DIRECT_URL: direct,
      AUTH_SECRET: secret, AUTH_URL: base, NEXT_PUBLIC_SITE_URL: base,
      AUTH_GOOGLE_ID: "", AUTH_GOOGLE_SECRET: "", RESEND_API_KEY: "", EMAIL_FROM: "",
      STRIPE_SECRET_KEY: "", STRIPE_WEBHOOK_SECRET: "", NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "",
      S3_ENDPOINT: "", S3_BUCKET: "", S3_ACCESS_KEY: "", S3_SECRET_KEY: "", MAINTENANCE_SECRET: "",
    };
    server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", String(port)], { env, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
    // Capture only non-sensitive development-server lifecycle diagnostics.
    for (const stream of [server.stdout, server.stderr]) stream.on("data", (chunk) => {
      for (const line of String(chunk).split(/\r?\n/)) {
        if (/reload|restart|changed|lockfile|conflict/i.test(line) && !/postgres|secret|token|password|email|cookie|authorization/i.test(line)) serverDiagnostics.push(line.slice(0, 300));
      }
    });
    await waitForServer(server, base);
    browser = await chromium.launch({ channel: "chrome", headless: true });
    const first = await browser.newContext({ extraHTTPHeaders: { "x-forwarded-for": testIp } });
    const page = await first.newPage();
    const anonymous = await page.request.get(`${base}/api/personalization/harbor-house`);
    assert.equal(anonymous.status(), 401);
    const anonymousPhoto = await page.request.get(`${base}/api/personalization/harbor-house/photo`);
    assert.equal(anonymousPhoto.status(), 401);
    assert.equal((await page.request.get(`${base}/api/personalization/coral-cove/villas/overwater-villa/photo`)).status(), 401);
    assert.equal((await page.request.get(`${base}/api/personalization/coral-cove/gallery/hero/photo`)).status(), 401);
    assert.equal((await page.request.get(`${base}/api/personalization/harbor-house/rooms/lighthouse-room/photo`)).status(), 401);

    async function signIn(browserPage, email) {
      // Authenticate through the real credentials endpoint. The request context
      // shares its cookie jar with the browser, without relying on dev-mode
      // hydration timing on the login form.
      const { csrfToken } = await (await browserPage.request.get(`${base}/api/auth/csrf`)).json();
      const response = await browserPage.request.post(`${base}/api/auth/callback/credentials`, {
        form: { csrfToken, email, password, callbackUrl: `${base}/personalize/harbor-house`, json: "true" },
      });
      assert.equal(response.ok(), true, "Credentials endpoint rejected the test account");
      const session = await (await browserPage.request.get(`${base}/api/auth/session`)).json();
      assert.equal(session.user?.email, email, "Credentials sign-in did not establish the expected session");
      await browserPage.goto(`${base}/personalize/harbor-house`, { waitUntil: "domcontentloaded" });
    }

    await signIn(page, emails[0]);
    await page.getByLabel("Business name").fill("Private Harbor");
    await page.getByLabel("Home page headline").fill("A saved seaside stay");
    await page.getByLabel("Address line 1").fill("12 Garden Lane");
    await page.getByText("Room content", { exact: true }).click();
    await page.getByLabel("Room name", { exact: true }).fill("Garden Room");
    await page.getByLabel("Short description").fill("A sunny retreat");
    await page.getByLabel("Room description").fill("A quiet room by the garden.");
    await page.getByLabel("Bed", { exact: true }).fill("King bed");
    await page.getByLabel("View", { exact: true }).fill("Garden view");
    await page.getByLabel("Room features").fill("Private balcony\nBreakfast included");
    await page.getByLabel("Nightly price (PHP)").fill("5800");
    await page.getByLabel("Maximum guests").fill("4");
    const roomPng = await sharp({ create: { width: 20, height: 20, channels: 3, background: "#839b52" } }).png().toBuffer();
    await page.getByLabel("Primary room photo").setInputFiles({ name: "room.png", mimeType: "image/png", buffer: roomPng });
    await page.getByRole("button", { name: "Save room photo" }).click();
    await page.getByRole("status").getByText("Save your draft before saving a room photo.").waitFor();
    await page.getByRole("button", { name: "Preview this room" }).click();
    let preview = page.frameLocator('iframe[title="Harbor House home page preview"]');
    await preview.getByRole("heading", { name: "Garden Room", exact: true }).waitFor();
    await preview.getByText("A quiet room by the garden.").waitFor();
    await preview.getByAltText("Garden Room room photo").waitFor();
    await preview.getByText("King bed", { exact: true }).waitFor();
    await preview.getByText("Private balcony", { exact: true }).waitFor();
    await preview.getByText(/5,800/).first().waitFor();
    await page.getByLabel("Preview page").selectOption("book");
    await preview.getByText(/no reservation or payment will be made/i).waitFor();
    await preview.getByLabel("Guests").waitFor();
    assert.equal(await preview.getByLabel("Guests").locator('option[value="4"]').count(), 1);
    await page.getByLabel("Preview page").selectOption("contact");
    await preview.getByText("12 Garden Lane").first().waitFor();
    await page.getByText("Breakfast content", { exact: true }).click();
    await page.getByLabel("Breakfast page heading").fill("Our breakfast table");
    await page.getByLabel("First menu heading").fill("Morning feast");
    await page.getByLabel("First menu items").fill("Fresh fruit\nWarm bread");
    await page.getByRole("button", { name: "Preview breakfast" }).click();
    await preview.getByRole("heading", { name: "Our breakfast table", exact: true }).waitFor();
    await preview.getByText("Warm bread", { exact: true }).waitFor();
    await page.getByText("Local guide content", { exact: true }).click();
    await page.getByLabel("Guide page heading").fill("Explore nearby");
    await page.getByLabel("Place name").fill("Garden lookout");
    await page.getByLabel("Distance or travel time").fill("A short walk");
    await page.getByLabel("Place description").fill("A quiet spot at sunset.");
    await page.getByRole("button", { name: "Preview local guide" }).click();
    await preview.getByRole("heading", { name: "Explore nearby", exact: true }).waitFor();
    await preview.getByText("Garden lookout", { exact: true }).waitFor();
    await page.getByLabel("Preview page").selectOption("home");
    await preview.getByText("Fresh fruit", { exact: true }).waitFor();
    await preview.getByText("Garden lookout", { exact: true }).waitFor();
    const png = await sharp({ create: { width: 16, height: 16, channels: 3, background: "#24557f" } }).png().toBuffer();
    await page.getByLabel("Home page photo").setInputFiles({ name: "test.png", mimeType: "image/png", buffer: png });
    const saveResponse = page.waitForResponse((response) => response.url() === `${base}/api/personalization/harbor-house` && response.request().method() === "PUT", { timeout: 30_000 });
    await page.getByRole("button", { name: "Save draft" }).click();
    const saved = await saveResponse;
    assert.equal(saved.status(), 200, `Draft save returned ${saved.status()}: ${await saved.text()}`);
    await page.getByRole("status").getByText("Draft saved. Save each changed room photo separately.").waitFor({ timeout: 30_000 });
    await page.getByRole("button", { name: "Save room photo" }).click();
    await page.getByRole("status").getByText("Room photo saved. Text changes still need Save draft.").waitFor({ timeout: 30_000 });
    const roomPhoto = await page.request.get(`${base}/api/personalization/harbor-house/rooms/lighthouse-room/photo`);
    assert.equal(roomPhoto.status(), 200);
    assert.equal((await sharp(await roomPhoto.body()).metadata()).format, "webp");
    const invalidPhoto = await page.request.put(`${base}/api/personalization/harbor-house/rooms/lighthouse-room/photo`, { headers: { origin: base, "content-type": "image/png" }, data: Buffer.from("not an image") });
    assert.equal(invalidPhoto.status(), 400);
    assert.deepEqual(await (await page.request.get(`${base}/api/personalization/harbor-house/rooms/lighthouse-room/photo`)).body(), await roomPhoto.body());
    assert.equal((await page.request.get(`${base}/api/personalization/harbor-house/rooms/unknown-room/photo`)).status(), 404);
    const roomPanel = page.locator("details").filter({ has: page.getByText("Room content", { exact: true }) });
    if (!(await roomPanel.evaluate((element) => element.open))) await roomPanel.locator("summary").click();
    await roomPanel.locator("select").selectOption("captains-room");
    await page.getByLabel("Primary room photo").setInputFiles({ name: "second-room.png", mimeType: "image/png", buffer: roomPng });
    await page.getByRole("button", { name: "Save room photo" }).click();
    await page.getByRole("status").getByText("Room photo saved. Text changes still need Save draft.").waitFor({ timeout: 30_000 });
    assert.equal((await page.request.get(`${base}/api/personalization/harbor-house/rooms/captains-room/photo`)).status(), 200);
    const photo = await page.request.get(`${base}/api/personalization/harbor-house/photo`);
    assert.equal(photo.status(), 200);
    assert.match(photo.headers()["content-type"], /image\/webp/);
    assert.equal((await sharp(await photo.body()).metadata()).format, "webp");
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Load saved draft" }).click();
    await page.getByRole("status").getByText("Saved draft and photo loaded.").waitFor({ timeout: 30_000 });
    assert.equal(await page.getByLabel("Business name").inputValue(), "Private Harbor");
    preview = page.frameLocator('iframe[title="Harbor House home page preview"]');
    await preview.getByRole("heading", { name: "A saved seaside stay" }).waitFor();
    await preview.locator('img[alt="Your selected hero image"]').waitFor();
    assert.equal(await page.getByLabel("Address line 1").inputValue(), "12 Garden Lane");
    await page.getByLabel("Preview page").selectOption("rooms");
    await preview.getByRole("heading", { name: "Garden Room", exact: true }).waitFor();
    await page.getByLabel("Preview page").selectOption("lighthouse-room");
    await preview.getByText("A quiet room by the garden.").waitFor();
    await preview.getByAltText("Garden Room room photo").waitFor();
    await preview.getByText("Private balcony", { exact: true }).waitFor();
    await preview.getByText(/5,800/).first().waitFor();
    await page.getByLabel("Preview page").selectOption("captains-room");
    await preview.getByAltText("The Captain’s Room room photo").waitFor();
    await page.getByLabel("Preview page").selectOption("breakfast");
    await preview.getByText("Warm bread", { exact: true }).waitFor();
    await page.getByLabel("Preview page").selectOption("guide");
    await preview.getByText("A quiet spot at sunset.").waitFor();

    const others = ["coral-cove", "pine-ridge-lodge", "lumen-lake-villas", "isla-verde-boutique", "ember-and-salt", "still-water-spa", "bloomfield-gardens"];
    const navigationPage = await first.newPage();
    for (const template of ["harbor-house", ...others]) {
      await navigationPage.goto(`${base}/preview/${template}`, { waitUntil: "domcontentloaded" });
      assert.equal(await navigationPage.getByRole("link", { name: "Personalize this template" }).getAttribute("href"), `/personalize/${template}`);
    }
    await navigationPage.getByRole("link", { name: "Personalize this template" }).click();
    await navigationPage.waitForURL("**/personalize/bloomfield-gardens");
    await navigationPage.close();
    for (const template of others) {
      const response = await page.request.put(`${base}/api/personalization/${template}`, {
        headers: { origin: base },
        data: { draft: { version: 1, template, business: { name: `Test ${template}` }, home: {}, theme: {} }, photo: { action: "keep" } },
      });
      assert.equal(response.status(), 200, `Could not save the ${template} draft`);
      const loaded = await (await page.request.get(`${base}/api/personalization/${template}`)).json();
      assert.equal(loaded.draft.business.name, `Test ${template}`);
    }
    const pineImage = `${base}/api/personalization/pine-ridge-lodge/photos/twin-room/image`;
    assert.equal((await page.request.put(pineImage, { headers: { origin: base, "content-type": "image/png" }, data: roomPng })).status(), 200);
    assert.equal((await page.request.get(pineImage)).status(), 200);
    const pineLoaded = await (await page.request.get(`${base}/api/personalization/pine-ridge-lodge`)).json();
    assert.ok(pineLoaded.photos.some((item) => item.slot === "twin-room"));
    assert.equal((await page.request.get(`${base}/api/personalization/pine-ridge-lodge/photos/invalid/image`)).status(), 404);
    assert.equal((await page.request.put(pineImage, { headers: { origin: base, "content-type": "image/png" }, data: Buffer.from("invalid") })).status(), 400);

    const coralPage = await first.newPage();
    await coralPage.goto(`${base}/personalize/coral-cove`, { waitUntil: "domcontentloaded" });
    await coralPage.getByText("Villa content", { exact: true }).click();
    await coralPage.getByLabel("Address line 1").fill("42 Test Island Road");
    await coralPage.getByText("Home page sections", { exact: true }).click();
    await coralPage.getByLabel("Travel step 1 title").fill("Arrive by ferry");
    await coralPage.getByLabel("Reef section heading").fill("Meet the sea");
    await coralPage.getByLabel("Villa name").fill("Reef Suite");
    await coralPage.getByLabel("Nightly price (PHP)").fill("12345");
    await coralPage.getByLabel("Villa amenities").fill("Private deck\nOcean view");
    await coralPage.getByLabel("Primary villa photo").setInputFiles({ name: "villa.png", mimeType: "image/png", buffer: roomPng });
    await coralPage.getByRole("button", { name: "Preview this villa" }).click();
    const coralPreview = coralPage.frameLocator('iframe[title="Coral Cove home page preview"]');
    await coralPreview.getByRole("heading", { name: "Reef Suite", exact: true }).waitFor();
    await coralPreview.getByText("Private deck", { exact: true }).waitFor();
    await coralPreview.locator('img[alt="Photo of Reef Suite"]').first().waitFor();
    await coralPage.getByText("Experiences content", { exact: true }).click();
    await coralPage.getByLabel("Experience name").fill("Reef Discovery");
    await coralPage.getByRole("button", { name: "Preview experiences" }).click();
    await coralPreview.getByRole("heading", { name: "Reef Discovery", exact: true }).waitFor();
    await coralPage.getByText("Offers content", { exact: true }).click();
    await coralPage.getByLabel("Offer headline").fill("Stay by the sea");
    await coralPage.getByLabel("Offer inclusions").fill("Breakfast\nIsland tour");
    await coralPage.getByRole("button", { name: "Preview offers" }).click();
    await coralPreview.getByRole("heading", { name: "Stay by the sea", exact: true }).waitFor();
    await coralPreview.getByText("Island tour", { exact: true }).waitFor();
    await coralPage.getByText("Gallery photos", { exact: true }).click();
    await coralPage.locator("details").filter({ has: coralPage.locator("summary").filter({ hasText: /^Gallery photos$/ }) }).getByLabel("Photo description").fill("Sunset over our island");
    await coralPage.getByLabel("Replace gallery photo").setInputFiles({ name: "gallery.png", mimeType: "image/png", buffer: roomPng });
    await coralPreview.getByAltText("Sunset over our island").waitFor();
    await coralPage.getByText("Contact questions", { exact: true }).click();
    await coralPage.getByLabel("Question topic").selectOption("cancellation");
    await coralPage.getByLabel("Question", { exact: true }).fill("Can I change my stay?");
    await coralPage.getByLabel("Answer", { exact: true }).fill("Please contact our team.");
    await coralPage.getByRole("button", { name: "Preview contact page" }).click();
    await coralPreview.locator("summary").filter({ hasText: "Can I change my stay?" }).click();
    await coralPreview.getByText("Please contact our team.", { exact: true }).waitFor();
    await coralPage.getByRole("button", { name: "Save draft" }).click();
    await coralPage.getByRole("status").getByText("Draft saved. Save each changed villa or gallery photo separately.").waitFor({ timeout: 30000 });
    await coralPage.getByRole("button", { name: "Save villa photo" }).click();
    await coralPage.getByRole("status").getByText("Villa photo saved. Text changes still need Save draft.").waitFor({ timeout: 30000 });
    await coralPage.getByRole("button", { name: "Save gallery photo" }).click();
    await coralPage.getByRole("status").getByText("Gallery photo saved. Text changes still need Save draft.").waitFor({ timeout: 30000 });
    const savedGalleryPhoto = await coralPage.request.get(`${base}/api/personalization/coral-cove/gallery/hero/photo`);
    assert.equal(savedGalleryPhoto.status(), 200);
    assert.equal((await coralPage.request.put(`${base}/api/personalization/coral-cove/gallery/hero/photo`, { headers: { origin: base, "content-type": "image/png" }, data: Buffer.from("invalid") })).status(), 400);
    assert.deepEqual(await (await coralPage.request.get(`${base}/api/personalization/coral-cove/gallery/hero/photo`)).body(), await savedGalleryPhoto.body());
    const savedVillaPhoto = await coralPage.request.get(`${base}/api/personalization/coral-cove/villas/overwater-villa/photo`);
    assert.equal(savedVillaPhoto.status(), 200);
    assert.equal((await coralPage.request.put(`${base}/api/personalization/coral-cove/villas/overwater-villa/photo`, { headers: { origin: base, "content-type": "image/png" }, data: Buffer.from("invalid") })).status(), 400);
    assert.deepEqual(await (await coralPage.request.get(`${base}/api/personalization/coral-cove/villas/overwater-villa/photo`)).body(), await savedVillaPhoto.body());
    assert.equal((await coralPage.request.get(`${base}/api/personalization/coral-cove/villas/unknown/photo`)).status(), 404);
    await coralPage.reload({ waitUntil: "domcontentloaded" });
    await coralPage.getByRole("button", { name: "Load saved draft" }).click();
    await coralPage.getByRole("status").getByText("Saved draft and photo loaded.").waitFor({ timeout: 30000 });
    assert.equal(await coralPage.getByLabel("Address line 1").inputValue(), "42 Test Island Road");
    await coralPage.getByText("Home page sections", { exact: true }).click();
    assert.equal(await coralPage.getByLabel("Travel step 1 title").inputValue(), "Arrive by ferry");
    await coralPage.getByText("Villa content", { exact: true }).click();
    assert.equal(await coralPage.getByLabel("Villa name").inputValue(), "Reef Suite");
    assert.equal(await coralPage.getByLabel("Nightly price (PHP)").inputValue(), "12345");
    await coralPage.getByRole("button", { name: "Preview this villa" }).click();
    await coralPreview.locator('img[alt="Photo of Reef Suite"]').first().waitFor();
    await coralPage.getByText("Experiences content", { exact: true }).click();
    assert.equal(await coralPage.getByLabel("Experience name").inputValue(), "Reef Discovery");
    await coralPage.getByText("Offers content", { exact: true }).click();
    assert.equal(await coralPage.getByLabel("Offer headline").inputValue(), "Stay by the sea");
    await coralPage.getByText("Gallery photos", { exact: true }).click();
    assert.equal(await coralPage.locator("details").filter({ has: coralPage.locator("summary").filter({ hasText: /^Gallery photos$/ }) }).getByLabel("Photo description").inputValue(), "Sunset over our island");
    await coralPage.getByRole("button", { name: "Preview gallery" }).click();
    await coralPreview.getByAltText("Sunset over our island").waitFor();
    await coralPage.getByText("Contact questions", { exact: true }).click();
    await coralPage.getByLabel("Question topic").selectOption("cancellation");
    assert.equal(await coralPage.locator("details").filter({ has: coralPage.getByText("Contact questions", { exact: true }) }).locator("textarea").inputValue(), "Please contact our team.");
    await coralPage.close();

    const second = await browser.newContext({ extraHTTPHeaders: { "x-forwarded-for": testIp } });
    const other = await second.newPage();
    await signIn(other, emails[1]);
    assert.equal((await other.request.get(`${base}/api/personalization/harbor-house/photo`)).status(), 404);
    assert.equal((await other.request.get(`${base}/api/personalization/harbor-house/rooms/lighthouse-room/photo`)).status(), 404);
    assert.equal((await other.request.get(`${base}/api/personalization/coral-cove/villas/overwater-villa/photo`)).status(), 404);
    assert.equal((await other.request.get(`${base}/api/personalization/coral-cove/gallery/hero/photo`)).status(), 404);
    assert.equal((await other.request.get(pineImage)).status(), 404);
    assert.equal((await (await other.request.get(`${base}/api/personalization/harbor-house`)).json()).draft, null);
    for (const template of others) assert.equal((await (await other.request.get(`${base}/api/personalization/${template}`)).json()).draft, null);
    const foreignOrigin = await other.request.put(`${base}/api/personalization/harbor-house`, { headers: { origin: "https://other.example" }, data: {} });
    assert.equal(foreignOrigin.status(), 403);
    const foreignPhoto = await other.request.put(`${base}/api/personalization/harbor-house/rooms/lighthouse-room/photo`, { headers: { origin: "https://other.example", "content-type": "image/png" }, data: roomPng });
    assert.equal(foreignPhoto.status(), 403);
    assert.equal((await other.request.put(`${base}/api/personalization/coral-cove/villas/overwater-villa/photo`, { headers: { origin: "https://other.example", "content-type": "image/png" }, data: roomPng })).status(), 403);
    assert.equal((await other.request.put(`${base}/api/personalization/coral-cove/gallery/hero/photo`, { headers: { origin: "https://other.example", "content-type": "image/png" }, data: roomPng })).status(), 403);
    assert.equal((await page.request.delete(`${base}/api/personalization/coral-cove/villas/overwater-villa/photo`, { headers: { origin: base } })).status(), 200);
    assert.equal((await page.request.get(`${base}/api/personalization/coral-cove/villas/overwater-villa/photo`)).status(), 404);
    assert.equal((await page.request.delete(`${base}/api/personalization/coral-cove/gallery/hero/photo`, { headers: { origin: base } })).status(), 200);
    assert.equal((await page.request.get(`${base}/api/personalization/coral-cove/gallery/hero/photo`)).status(), 404);
    assert.equal((await page.request.delete(pineImage, { headers: { origin: base } })).status(), 200);
    assert.equal((await page.request.get(pineImage)).status(), 404);
    await page.getByText("Room content", { exact: true }).click();
    await page.getByRole("button", { name: "Use template room photo" }).click();
    await page.getByRole("button", { name: "Save room photo" }).click();
    await page.getByRole("status").getByText("Room photo saved. Text changes still need Save draft.").waitFor({ timeout: 30_000 });
    assert.equal((await page.request.get(`${base}/api/personalization/harbor-house/rooms/lighthouse-room/photo`)).status(), 404);
    assert.equal((await page.request.get(`${base}/api/personalization/harbor-house/rooms/captains-room/photo`)).status(), 200);
    await first.close(); await second.close();
  } catch (error) {
    if (serverDiagnostics.length) console.error("Development server diagnostics:", serverDiagnostics.slice(-20).join(" | "));
    throw error;
  } finally {
    if (browser) await browser.close();
    if (server?.pid && server.exitCode === null) {
      if (process.platform === "win32") spawnSync("taskkill", ["/PID", String(server.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
      else server.kill("SIGTERM");
    }
    const keys = [`login:ip:${testIp}`, ...emails.map((email) => `login:email:${email}`), ...ids.flatMap((id) => [`personalization:${id}`, `personalization-room-photo:${id}`, `personalization-villa-photo:${id}`, `personalization-gallery-photo:${id}`, `personalization-pine-photo:${id}`])].map((key) => createHash("sha256").update(key).digest("hex"));
    try {
      await db.user.deleteMany({ where: { id: { in: ids } } });
      await db.rateLimitBucket.deleteMany({ where: { key: { in: keys } } });
    } finally { await db.$disconnect(); }
  }
});
