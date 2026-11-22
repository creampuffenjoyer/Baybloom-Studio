import assert from "node:assert/strict";
import { test } from "node:test";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import sharp from "sharp";
import { chromium } from "playwright-core";
import { PrismaClient } from "@prisma/client";
import { strFromU8, unzipSync } from "fflate";
import { testDatabaseConfig } from "../scripts/personalization-test-config.mjs";
import { emptyDraft } from "../src/lib/personalization/harbor-draft.ts";
import { registerTemplateRelease } from "../src/lib/personalization/purchases.ts";
import { CORAL_PHOTO_PLACEMENTS } from "../src/templates/coral-cove/photo-placements.ts";

test("Coral direct photo editing, page picker, reliable saving and purchased export", { timeout: 600_000 }, async () => {
  const { target, direct } = testDatabaseConfig();
  const db = new PrismaClient({ datasources: { db: { url: target } } });
  const prefix = `photo-editor-${randomUUID()}`, users = [`${prefix}-owner`, `${prefix}-other`];
  const emails = users.map(id => `${id}@example.test`), password = randomBytes(24).toString("base64url");
  const testIp = `198.18.${randomBytes(1)[0]}.${randomBytes(1)[0]}`;
  const previousEnv = await readFile("next-env.d.ts", "utf8");
  const previous = await db.activeTemplateRelease.findUnique({ where: { template: "coral-cove" } });
  const archive = await readFile("storage/photo-selection/release/deliverables/coral-cove/coral-cove-source.zip");
  const digest = createHash("sha256").update(archive).digest("hex");
  const releaseExisted = !!await db.templateRelease.findUnique({ where: { sha256: digest }, select: { sha256: true } });
  const coupon = `PHOTOS-${randomUUID().slice(0, 10)}`.toUpperCase();
  const secret = randomBytes(32).toString("base64url");
  let server, browser, createdDesign, page;
  const diagnostics = [];
  const errors = [];
  try {
    await db.user.createMany({ data: users.map((id, index) => ({ id, email: emails[index], emailVerified: new Date(), name: "Photo buyer", passwordHash: bcrypt.hashSync(password, 10) })) });
    await registerTemplateRelease("coral-cove", archive, db);
    await mkdir(".next/personalization-e2e-config", { recursive: true });
    await writeFile(".next/personalization-e2e-config/tsconfig.json", JSON.stringify({ extends: "../../tsconfig.json", include: ["../../next-env.d.ts", "../../src/**/*.ts", "../../src/**/*.tsx", "../personalization-e2e/dev/types/**/*.ts"], exclude: ["../../node_modules"] }));
    const socket = createServer(); await new Promise(r => socket.listen(0, "127.0.0.1", r)); const port = socket.address().port; await new Promise(r => socket.close(r));
    const base = `http://127.0.0.1:${port}`;
    server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", String(port)], { windowsHide: true, stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, BAYBLOOM_PERSONALIZATION_TEST: "1", DATABASE_URL: target, DIRECT_URL: direct, AUTH_SECRET: randomBytes(32).toString("hex"), AUTH_URL: base, NEXT_PUBLIC_SITE_URL: base, AUTH_GOOGLE_ID: "", AUTH_GOOGLE_SECRET: "", STRIPE_SECRET_KEY: "", STRIPE_WEBHOOK_SECRET: "", RESEND_API_KEY: "", S3_ENDPOINT: "", S3_BUCKET: "", S3_ACCESS_KEY: "", S3_SECRET_KEY: "", MAINTENANCE_SECRET: secret, NEXT_TELEMETRY_DISABLED: "1" } });
    for (const stream of [server.stdout, server.stderr]) stream.on("data", chunk => { for (const line of String(chunk).split(/\r?\n/)) if (/error|failed/i.test(line) && !/postgres|secret|token|password|email|cookie|authorization/i.test(line)) diagnostics.push(line.slice(0, 250)); });
    const deadline = Date.now() + 120000;
    while (true) {
      if (server.exitCode !== null) throw Error("Isolated preview exited");
      try { if ((await fetch(base + "/api/auth/csrf", { signal: AbortSignal.timeout(15000) })).ok) break; } catch {}
      if (Date.now() > deadline) throw Error("Isolated preview did not start");
      await new Promise(r => setTimeout(r, 500));
    }
    browser = await chromium.launch({ channel: "chrome", headless: true });
    const owner = await browser.newContext({ viewport: { width: 1440, height: 1000 }, extraHTTPHeaders: { "x-forwarded-for": testIp } });
    const other = await browser.newContext({ extraHTTPHeaders: { "x-forwarded-for": testIp } });
    for (const [index, context] of [owner, other].entries()) {
      const { csrfToken } = await (await context.request.get(base + "/api/auth/csrf")).json();
      await context.request.post(base + "/api/auth/callback/credentials", { form: { csrfToken, email: emails[index], password, json: "true" } });
      assert.equal((await (await context.request.get(base + "/api/auth/session")).json()).user.email, emails[index]);
    }
    const png = await sharp({ create: { width: 480, height: 320, channels: 3, background: "#24557f" } }).png().toBuffer();
    const legacyPng = await sharp({ create: { width: 480, height: 320, channels: 3, background: "#c7802f" } }).png().toBuffer();
    for (const context of [owner, other]) assert.equal((await context.request.put(base + "/api/personalization/coral-cove", { headers: { origin: base }, data: { draft: emptyDraft("coral-cove"), photo: { action: "keep" } } })).status(), 200);
    assert.equal((await owner.request.put(base + "/api/personalization/coral-cove/photos/snorkeler/image", { headers: { origin: base, "content-type": "image/png" }, data: legacyPng })).status(), 200);
    page = await owner.newPage(); page.on("pageerror", e => errors.push(e.message)); page.on("dialog", dialog => dialog.accept());
    page.on("requestfailed", request => { const url = new URL(request.url()); if (url.pathname.startsWith("/_next/")) diagnostics.push(`${url.pathname}: ${request.failure()?.errorText}`); });
    await page.goto(base + "/personalize/coral-cove", { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.getByRole("button", { name: "Load saved draft", exact: true }).waitFor({ state: "visible", timeout: 90000 });
    await page.getByRole("button", { name: "Load saved draft", exact: true }).click({ timeout: 120000 });
    await page.getByText("Saved draft and photo loaded.", { exact: true }).waitFor();
    const panel = page.locator("#coral-photo-panel > div").first();
    const preview = page.frameLocator("iframe");
    async function select(id) { const item = CORAL_PHOTO_PLACEMENTS.find(item => item.id === id); await panel.getByRole("combobox", { name: "Photo page", exact: true }).selectOption(item.page); await panel.getByRole("combobox", { name: "Photo location", exact: true }).selectOption(id); }
    async function uploaded(id) { await preview.locator(`img[data-coral-photo='${id}']`).waitFor(); await page.waitForFunction(({ id }) => document.querySelector("iframe")?.contentDocument?.querySelector(`img[data-coral-photo='${id}']`)?.getAttribute("src")?.startsWith(`/api/personalization/coral-cove/placements/${id}/image?`), { id }); await preview.locator(`img[data-coral-photo='${id}']`).evaluate(image => image.decode()); }
    await preview.locator("img[data-coral-photo='home.reef']").scrollIntoViewIfNeeded();
    await preview.getByRole("button", { name: "Change photo: Home — Reef section", exact: true }).click();
    assert.equal(await panel.getByRole("combobox", { name: "Photo location", exact: true }).inputValue(), "home.reef");
    await panel.getByLabel("Photo description", { exact: true }).fill("Our private reef photo");
    const attempts = new Map(); page.on("request", request => { if (request.method() === "PUT" && request.url().includes("/placements/")) { const pathname = new URL(request.url()).pathname; attempts.set(pathname, (attempts.get(pathname) ?? 0) + 1); } });
    let fail = true;
    await page.route("**/placements/home.reef/image", async route => { if (fail && route.request().method() === "PUT") { fail = false; await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Test upload interruption" }) }); } else await route.continue(); });
    await panel.getByLabel("Replace photo", { exact: true }).setInputFiles({ name: "reef.png", mimeType: "image/png", buffer: png });
    await select("home.offer");
    await panel.getByLabel("Replace photo", { exact: true }).setInputFiles({ name: "offer.png", mimeType: "image/png", buffer: png });
    await page.getByRole("button", { name: "Save changes", exact: true }).click();
    await page.getByText("Your text was saved, but some photos failed. Check the photo status and retry Save changes.", { exact: true }).waitFor();
    await select("home.reef"); await panel.getByText("Failed", { exact: true }).waitFor();
    await page.getByRole("button", { name: "Save changes", exact: true }).click();
    await page.getByText("All text and photo changes saved.", { exact: true }).waitFor();
    assert.equal(attempts.get("/api/personalization/coral-cove/placements/home.reef/image"), 2);
    assert.equal(attempts.get("/api/personalization/coral-cove/placements/home.offer/image"), 1);
    await uploaded("home.reef");
    await select("gallery.snorkeler");
    assert.match(await preview.locator("img[data-coral-photo='gallery.snorkeler']").getAttribute("src"), /^\/api\/personalization\/coral-cove\/photos\/snorkeler\/image/);
    await select("home.reef");
    await panel.getByRole("button", { name: "Restore original", exact: true }).click();
    await page.waitForFunction(() => document.querySelector("iframe")?.contentDocument?.querySelector("img[data-coral-photo='home.reef']")?.getAttribute("src")?.includes("snorkeler.webp"));
    await panel.getByRole("button", { name: "Discard pending change", exact: true }).click(); await uploaded("home.reef");
    await panel.getByRole("button", { name: "Restore original", exact: true }).click();
    await page.getByRole("button", { name: "Save changes", exact: true }).click(); await page.getByText("All text and photo changes saved.", { exact: true }).waitFor();
    assert.equal((await owner.request.get(base + "/api/personalization/coral-cove/placements/home.reef/image")).status(), 404);
    await panel.getByLabel("Replace photo", { exact: true }).setInputFiles({ name: "reef-again.png", mimeType: "image/png", buffer: png });
    await select("home.offer");
    await panel.getByText("Use the next replacement in other locations", { exact: true }).click();
    const extra = CORAL_PHOTO_PLACEMENTS.find(item => item.page === "offers" && item.photo === CORAL_PHOTO_PLACEMENTS.find(item => item.id === "home.offer").photo);
    await panel.getByLabel(`${extra.pageName} · ${extra.name}`, { exact: true }).check();
    await panel.getByLabel("Replace photo", { exact: true }).setInputFiles({ name: "shared-offer.png", mimeType: "image/png", buffer: legacyPng });
    await page.getByRole("button", { name: "Save changes", exact: true }).click(); await page.getByText("All text and photo changes saved.", { exact: true }).waitFor();
    const endpoint = base + "/api/personalization/coral-cove/placements/home.reef/image";
    assert.equal((await fetch(endpoint)).status, 401); assert.equal((await other.request.get(endpoint)).status(), 404);
    assert.equal((await other.request.delete(endpoint, { headers: { origin: base } })).status(), 200); assert.equal((await owner.request.get(endpoint)).status(), 200);
    assert.equal((await owner.request.put(endpoint, { headers: { origin: "https://foreign.example", "content-type": "image/png" }, data: png })).status(), 403);
    assert.equal((await owner.request.put(endpoint, { headers: { origin: base, "content-type": "image/png" }, data: Buffer.from("bad") })).status(), 400);
    assert.equal((await owner.request.put(base + "/api/personalization/coral-cove/placements/not-a-location/image", { headers: { origin: base, "content-type": "image/png" }, data: png })).status(), 404);
    await page.reload({ waitUntil: "networkidle" }); await page.getByRole("button", { name: "Load saved draft", exact: true }).click(); await page.getByText("Saved draft and photo loaded.", { exact: true }).waitFor();
    await select("home.reef"); await uploaded("home.reef");
    assert.equal(await panel.getByLabel("Photo description", { exact: true }).inputValue(), "Our private reef photo");
    await mkdir("storage/photo-selection/screenshots", { recursive: true }); await page.screenshot({ path: "storage/photo-selection/screenshots/editor-desktop.png" });
    await page.getByRole("button", { name: "Browse preview", exact: true }).click();
    await preview.getByRole("navigation", { name: "Main", exact: true }).getByRole("link", { name: "Villas", exact: true }).click();
    await page.waitForFunction(() => document.querySelector("select[aria-label='Preview page']")?.value === "villas");
    await page.getByRole("button", { name: "Edit photos", exact: true }).click();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("combobox", { name: "Preview page", exact: true }).selectOption("home");
    await page.locator("iframe").scrollIntoViewIfNeeded();
    await preview.locator("img[data-coral-photo='home.hero']").scrollIntoViewIfNeeded();
    await preview.getByRole("button", { name: "Change photo: Home — Main banner", exact: true }).click();
    const drawer = page.getByRole("dialog", { name: "Photo controls", exact: true }); await drawer.waitFor();
    assert.equal(await drawer.getByRole("combobox", { name: "Photo location", exact: true }).inputValue(), "home.hero");
    await drawer.getByLabel("Replace photo", { exact: true }).setInputFiles({ name: "mobile-banner.png", mimeType: "image/png", buffer: png });
    const expiredSession = route => route.request().method() === "PUT" ? route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "Sign in to save your draft." }) }) : route.continue();
    await page.route("**/api/personalization/coral-cove", expiredSession);
    await drawer.getByRole("button", { name: "Save changes", exact: true }).click();
    await drawer.getByText("Sign in to save your draft.", { exact: true }).waitFor();
    assert.equal(await drawer.getByRole("link", { name: "Sign in in a new tab", exact: true }).isVisible(), true);
    await page.unroute("**/api/personalization/coral-cove", expiredSession);
    await drawer.getByRole("button", { name: "Save changes", exact: true }).click();
    await drawer.getByText("All changes saved.", { exact: true }).waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: "storage/photo-selection/screenshots/editor-mobile.png" }); await page.keyboard.press("Escape"); assert.equal(await drawer.isVisible(), false);
    assert.deepEqual(errors, []);
    console.log("Direct selection, picker, isolated replacements, save retries, restoration, ownership and mobile drawer passed.");
    // Freeze the saved location assets through the actual zero-total checkout path.
    await db.category.create({ data: { id: prefix, slug: prefix, name: prefix } });
    let design = await db.design.findUnique({ where: { slug: "coral-cove" }, include: { tiers: true } });
    if (!design) { design = await db.design.create({ data: { slug: "coral-cove", title: "Coral Cove", summary: "Test", description: "Test", status: "PUBLISHED", categoryId: prefix, heroImage: "/templates/coral-cove/hero.webp", deliverables: [], tiers: { create: { level: "STARTER", name: "Starter", priceCents: 10000, inclusions: [] } } }, include: { tiers: true } }); createdDesign = design.id; }
    await db.coupon.create({ data: { code: coupon, percentOff: 100, maxRedemptions: 2 } });
    assert.equal((await owner.request.post(base + "/api/cart", { headers: { origin: base }, data: { designId: design.id, tierId: design.tiers[0].id } })).status(), 201);
    assert.equal((await owner.request.post(base + "/api/cart/coupon", { headers: { origin: base }, data: { code: coupon } })).status(), 200);
    assert.equal((await owner.request.post(base + "/api/checkout", { headers: { origin: base, "idempotency-key": randomUUID() }, data: { savedDraftTemplates: ["coral-cove"], imageRightsConfirmed: true } })).status(), 200);
    const item = await db.orderItem.findFirstOrThrow({ where: { order: { userId: users[0], status: "PAID" } }, include: { personalization: { include: { images: true } } } });
    assert.equal(item.personalization.sourceReleaseId, digest); assert.equal(item.personalization.images.filter(image => image.slot.startsWith("placement:")).length, 4);
    await db.personalizationDraft.deleteMany({ where: { userId: users[0] } });
    const maintenance = await owner.request.post(base + "/api/jobs/maintenance", { headers: { authorization: `Bearer ${secret}` }, timeout: 150000 }); assert.equal(maintenance.status(), 200); assert.equal((await maintenance.json()).purchases.ready, 1);
    const download = await owner.request.get(`${base}/api/downloads/${item.id}?file=purchased-source`, { timeout: 120000 }); assert.equal(download.status(), 200);
    const purchased = await download.body(); await writeFile("storage/photo-selection/coral-cove-purchased.zip", purchased);
    const files = unzipSync(purchased); const value = JSON.parse(strFromU8(files["coral-cove/src/app/personalized.json"]));
    assert.equal(value.photoPlacements["home.reef"].alt, "Our private reef photo"); assert.equal(value.placementPhotos["home.reef"], "/personalized/placements/home.reef.webp");
    for (const key of ["home.reef", "home.offer", extra.id, "home.hero"]) assert.ok(files[`coral-cove/public/personalized/placements/${key}.webp`]);
    const out = path.resolve("storage/photo-selection/purchased");
    for (const [name, bytes] of Object.entries(files)) { const file = path.resolve(out, name); if (!file.startsWith(out + path.sep)) throw Error("Unsafe extraction"); await mkdir(path.dirname(file), { recursive: true }); await writeFile(file, bytes); }
    console.log("Checkout snapshot and purchased ZIP retain the selected photos after draft deletion.");
  } catch (error) {
    if (page) { await mkdir("storage/photo-selection/screenshots", { recursive: true }); await page.screenshot({ path: "storage/photo-selection/screenshots/failure.png" }).catch(() => {}); }
    if (diagnostics.length) console.error("Isolated preview diagnostics:", diagnostics.slice(-5));
    if (errors.length) console.error("Browser exceptions:", errors);
    if (error.message?.includes("Call log:")) { const message = error.message.split("Call log:")[0].trim(); const frames = error.stack?.split("\n").filter(line => /^\s+at /.test(line)) ?? []; throw Object.assign(Error(message), { stack: [`Error: ${message}`, ...frames].join("\n") }); } throw error;
  } finally {
    await browser?.close(); if (server?.pid) spawnSync("taskkill", ["/PID", String(server.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
    try {
      await db.checkoutRequest.deleteMany({ where: { userId: { in: users } } }); await db.order.deleteMany({ where: { userId: { in: users } } }); await db.user.deleteMany({ where: { id: { in: users } } });
      if (createdDesign) await db.design.deleteMany({ where: { id: createdDesign } }); await db.category.deleteMany({ where: { id: prefix } }); await db.coupon.deleteMany({ where: { code: coupon } });
      if (previous) await db.activeTemplateRelease.upsert({ where: { template: "coral-cove" }, create: previous, update: { releaseId: previous.releaseId } }); else await db.activeTemplateRelease.deleteMany({ where: { template: "coral-cove" } });
      if (!releaseExisted) await db.templateRelease.deleteMany({ where: { sha256: digest, purchases: { none: {} }, active: { none: {} } } });
      const keys = [`login:ip:${testIp}`, ...emails.map(email => `login:email:${email}`), ...users.flatMap(id => [`personalization:${id}`, `personalization-coral-photo:${id}`, `personalization-coral-placement:${id}`, `checkout:${id}`, `coupon:${id}`, `download:${id}`])].map(key => createHash("sha256").update(key).digest("hex"));
      await db.rateLimitBucket.deleteMany({ where: { key: { in: keys } } });
    } finally { await db.$disconnect(); }
    const current = await readFile("next-env.d.ts", "utf8"); if (current !== previousEnv && current.includes("personalization-e2e")) await writeFile("next-env.d.ts", previousEnv);
  }
  await writeFile("storage/photo-selection/editor-verification.json", JSON.stringify({ verifiedAt: new Date().toISOString(), database: "isolated test database", checks: ["click selection and page/location picker", "location-specific replacement", "partial failure and retry", "restore original and discard", "explicit reuse", "authenticated owner isolation", "reload saved draft", "mobile replacement and save", "checkout and download after draft deletion", "test fixtures cleaned up"] }, null, 2));
});
