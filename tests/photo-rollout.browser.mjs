import assert from "node:assert/strict";
import { test, after } from "node:test";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import sharp from "sharp";
import { chromium } from "playwright-core";
import { PrismaClient } from "@prisma/client";
import { unzipSync, strFromU8 } from "fflate";
import { testDatabaseConfig } from "../scripts/personalization-test-config.mjs";
import { emptyDraft } from "../src/lib/personalization/harbor-draft.ts";
import { registerTemplateRelease } from "../src/lib/personalization/purchases.ts";
import { selectedPhotoCases, pilotPhotoCases } from "./helpers/photo-rollout.mjs";

let sharedServer, sharedBase;
const sharedSecret = randomBytes(32).toString("hex"), serverDiagnostics = [];
const originalNextEnv = await readFile("next-env.d.ts", "utf8");
async function ensurePreview(target, direct) {
  if (!sharedServer) {
      await mkdir(".next/personalization-e2e-config", { recursive: true });
      await writeFile(".next/personalization-e2e-config/tsconfig.json", JSON.stringify({ extends: "../../tsconfig.json", include: ["../../next-env.d.ts", "../../src/**/*.ts", "../../src/**/*.tsx", "../personalization-e2e/dev/types/**/*.ts"], exclude: ["../../node_modules"] }));
      const socket = createServer(); await new Promise(r => socket.listen(0, "127.0.0.1", r)); const port = socket.address().port; await new Promise(r => socket.close(r));
      sharedBase = `http://127.0.0.1:${port}`;
      const base = sharedBase;
      sharedServer = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", String(port)], { windowsHide: true, stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, BAYBLOOM_PERSONALIZATION_TEST: "1", DATABASE_URL: target, DIRECT_URL: direct, AUTH_SECRET: sharedSecret, AUTH_URL: base, NEXT_PUBLIC_SITE_URL: base, AUTH_GOOGLE_ID: "", AUTH_GOOGLE_SECRET: "", STRIPE_SECRET_KEY: "", STRIPE_WEBHOOK_SECRET: "", RESEND_API_KEY: "", S3_ENDPOINT: "", S3_BUCKET: "", S3_ACCESS_KEY: "", S3_SECRET_KEY: "", MAINTENANCE_SECRET: sharedSecret, NEXT_TELEMETRY_DISABLED: "1" } });
      for (const stream of [sharedServer.stdout, sharedServer.stderr]) stream.on("data", chunk => { for (const line of String(chunk).split(/\r?\n/)) if (/error|failed/i.test(line) && !/postgres|secret|token|password|email|cookie|authorization/i.test(line)) serverDiagnostics.push(line.slice(0, 250)); });
      const deadline = Date.now() + 120000;
      while (true) { try { if ((await fetch(base + "/api/auth/csrf", { signal: AbortSignal.timeout(10000) })).ok) break; } catch {} if (sharedServer.exitCode !== null || Date.now() > deadline) throw Error("Preview did not start"); await new Promise(r => setTimeout(r, 500)); }

  }
  return sharedBase;
}
after(async () => {
  if (sharedServer?.pid) spawnSync("taskkill", ["/PID", String(sharedServer.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
  const current = await readFile("next-env.d.ts", "utf8"); if (current !== originalNextEnv && current.includes("personalization-e2e")) await writeFile("next-env.d.ts", originalNextEnv);
});

const cases = process.env.PHOTO_INCLUDE_PILOTS === "1" ? pilotPhotoCases : selectedPhotoCases();
if (process.env.PHOTO_TEMPLATE && !cases.some(item => item.template === process.env.PHOTO_TEMPLATE)) throw Error("Unknown PHOTO_TEMPLATE");
for (const config of cases.filter(item => !process.env.PHOTO_TEMPLATE || item.template === process.env.PHOTO_TEMPLATE)) {
  test(`${config.template}: clickable locations, mobile, reliable saving and purchased export`, { timeout: 900_000 }, async () => {
    const { template, registry, primary, shared, secondary, hero } = config;
    const { target, direct } = testDatabaseConfig(), db = new PrismaClient({ datasources: { db: { url: target } } });
    const prefix = `photo-${randomUUID()}`, users = [`${prefix}-owner`, `${prefix}-other`], emails = users.map(id => `${id}@example.test`);
    const password = randomBytes(24).toString("base64url"), secret = sharedSecret, testIp = `198.18.${randomBytes(1)[0]}.${randomBytes(1)[0]}`;
    for (let attempt = 0; ; attempt++) {
      try { await db.$queryRaw`SELECT 1`; break; }
      catch (error) { await db.$disconnect(); if (attempt === 2) throw error; await new Promise(resolve => setTimeout(resolve, 1000)); }
    }
    const previous = await db.activeTemplateRelease.findUnique({ where: { template } });
    const archive = await readFile(`storage/photo-selection/release/deliverables/${template}/${template}-source.zip`), digest = createHash("sha256").update(archive).digest("hex");
    const existed = !!await db.templateRelease.findUnique({ where: { sha256: digest } });
    const coupon = `PHOTO-${randomUUID().slice(0, 20)}`.toUpperCase(), root = `storage/photo-selection/${template}`;
    let browser, page, createdDesign;
    const errors = [];
    try {
      await mkdir(`${root}/screenshots`, { recursive: true });
      await db.user.createMany({ data: users.map((id, index) => ({ id, email: emails[index], emailVerified: new Date(), name: "Photo buyer", passwordHash: bcrypt.hashSync(password, 10) })) });
      await registerTemplateRelease(template, archive, db);
      const base = await ensurePreview(target, direct);
      browser = await chromium.launch({ channel: "chrome", headless: true });
      const owner = await browser.newContext({ viewport: { width: 1440, height: 1000 }, extraHTTPHeaders: { "x-forwarded-for": testIp } }), other = await browser.newContext({ extraHTTPHeaders: { "x-forwarded-for": testIp } });
      for (const [index, context] of [owner, other].entries()) {
        const { csrfToken } = await (await context.request.get(base + "/api/auth/csrf")).json();
        await context.request.post(base + "/api/auth/callback/credentials", { form: { csrfToken, email: emails[index], password, json: "true" } });
        assert.equal((await (await context.request.get(base + "/api/auth/session")).json()).user.email, emails[index]);
        assert.equal((await context.request.put(`${base}/api/personalization/${template}`, { headers: { origin: base }, data: { draft: emptyDraft(template), photo: { action: "keep" } } })).status(), 200);
      }
      const png = await sharp({ create: { width: 480, height: 320, channels: 3, background: "#24557f" } }).png().toBuffer();
      const legacy = await sharp({ create: { width: 480, height: 320, channels: 3, background: "#c7802f" } }).png().toBuffer();
      assert.equal((await owner.request.put(`${base}/api/personalization/${template}/photos/${primary.photo}/image`, { headers: { origin: base, "content-type": "image/png" }, data: legacy })).status(), 200);
      page = await owner.newPage(); page.on("pageerror", e => errors.push(e.message)); page.on("dialog", dialog => dialog.accept());
      await page.goto(`${base}/personalize/${template}`, { waitUntil: "domcontentloaded", timeout: 90000 });
      await page.waitForFunction(() => [...document.querySelectorAll("button")].some(b => b.textContent === "Load saved draft" && !b.disabled), null, { timeout: 120000 });
      await page.getByRole("button", { name: "Load saved draft", exact: true }).click({ timeout: 120000 }); await page.getByText("Saved draft and photo loaded.", { exact: true }).waitFor();
      const panel = page.locator("[id$='-photo-panel'] > div").first(), preview = page.frameLocator("iframe");
      const attribute = template === "coral-cove" ? "data-coral-photo" : template === "harbor-house" ? "data-harbor-photo" : "data-location-photo";
      const image = id => preview.locator(`img[${attribute}='${id}']`);
      async function select(id) { const item = registry.get(id); await panel.getByRole("combobox", { name: "Photo page", exact: true }).selectOption(item.page); await panel.getByRole("combobox", { name: "Photo location", exact: true }).selectOption(id); }
      async function save() { await page.getByRole("button", { name: "Save changes", exact: true }).click(); await page.getByText("All text and photo changes saved.", { exact: true }).waitFor(); }
      await select(primary.id); await image(primary.id).scrollIntoViewIfNeeded();
      await preview.getByRole("button", { name: `Change photo: ${primary.pageName} — ${primary.name}`, exact: true }).click();
      assert.equal(await panel.getByLabel("Photo location", { exact: true }).inputValue(), primary.id);
      const alt = `Our ${template} photo`; await panel.getByLabel("Photo description", { exact: true }).fill(alt);
      let fail = true; const attempts = new Map();
      page.on("request", request => { if (request.method() === "PUT" && request.url().includes("/placements/")) { const p = new URL(request.url()).pathname; attempts.set(p, (attempts.get(p) ?? 0) + 1); } });
      await page.route(`**/placements/${primary.id}/image`, route => { if (fail && route.request().method() === "PUT") { fail = false; return route.fulfill({ status: 503, json: { error: "Test interruption" } }); } return route.continue(); });
      await panel.getByLabel("Replace photo", { exact: true }).setInputFiles({ name: "primary.png", mimeType: "image/png", buffer: png });
      await select(secondary.id); await panel.getByLabel("Replace photo", { exact: true }).setInputFiles({ name: "secondary.png", mimeType: "image/png", buffer: png });
      await page.getByRole("button", { name: "Save changes", exact: true }).click(); await page.getByText("Your text was saved, but some photos failed. Check the photo status and retry Save changes.", { exact: true }).waitFor();
      await save(); assert.equal(attempts.get(`/api/personalization/${template}/placements/${primary.id}/image`), 2); assert.equal(attempts.get(`/api/personalization/${template}/placements/${secondary.id}/image`), 1);
      await select(shared.id); assert.ok((await image(shared.id).getAttribute("src")).startsWith(`/api/personalization/${template}/photos/${primary.photo}/image`));
      await select(primary.id); await panel.getByRole("button", { name: "Restore original", exact: true }).click(); await save();
      assert.equal((await owner.request.get(`${base}/api/personalization/${template}/placements/${primary.id}/image`)).status(), 404);
      assert.equal(await image(primary.id).getAttribute("src").then(src => decodeURIComponent(src).includes(registry.original(primary.id).src)), true);
      await panel.getByText("Use the next replacement in other locations", { exact: true }).click();
      await panel.getByLabel(`${shared.pageName} · ${shared.name}`, { exact: true }).check();
      await panel.getByLabel("Replace photo", { exact: true }).setInputFiles({ name: "reused.png", mimeType: "image/png", buffer: png }); await save();
      const endpoint = `${base}/api/personalization/${template}/placements/${primary.id}/image`;
      assert.equal((await fetch(endpoint)).status, 401); assert.equal((await other.request.get(endpoint)).status(), 404);
      assert.equal((await other.request.delete(endpoint, { headers: { origin: base } })).status(), 200); assert.equal((await owner.request.get(endpoint)).status(), 200);
      assert.equal((await owner.request.put(endpoint, { headers: { origin: "https://foreign.example", "content-type": "image/png" }, data: png })).status(), 403);
      assert.equal((await owner.request.put(endpoint, { headers: { origin: base, "content-type": "image/png" }, data: Buffer.from("invalid") })).status(), 400);
      assert.equal((await owner.request.get(`${base}/api/personalization/${template}/placements/unknown/image`)).status(), 404);
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.waitForFunction(() => [...document.querySelectorAll("button")].some(b => b.textContent === "Load saved draft" && !b.disabled), null, { timeout: 120000 });
      await page.getByRole("button", { name: "Load saved draft", exact: true }).click({ timeout: 120000 }); await page.getByText("Saved draft and photo loaded.", { exact: true }).waitFor();
      await select(primary.id); assert.equal(await panel.getByLabel("Photo description", { exact: true }).inputValue(), alt);
      await image(primary.id).evaluate(el => el.decode()); await page.screenshot({ path: `${root}/screenshots/editor-desktop.png` });
      for (const item of registry.placements) { await select(item.id); await image(item.id).scrollIntoViewIfNeeded(); await image(item.id).waitFor({ state: "visible" }); assert.ok(await image(item.id).evaluate(el => el.getBoundingClientRect().height > 0)); }
      console.log(`${template}: all ${registry.placements.length} locations reachable`);
      if (template === "bloomfield-gardens") {
        await select(shared.id); await page.getByRole("button", { name: "Browse preview", exact: true }).click(); await image(shared.id).click();
        const viewer = preview.getByRole("dialog", { name: "Photo viewer", exact: true }); await viewer.waitFor();
        assert.ok((await viewer.locator("img").getAttribute("src")).includes(`/placements/${shared.id}/image`));
        await viewer.getByRole("button", { name: "Close", exact: true }).click(); await page.getByRole("button", { name: "Edit photos", exact: true }).click();
      }
      await select(primary.id); await page.getByRole("button", { name: "Browse preview", exact: true }).click();
      const link = preview.locator(`a[href='/demo/${template}/${shared.page}']`).first();
      if (await link.count()) { await link.click(); await page.waitForFunction(expected => document.querySelector("select[aria-label='Preview page']")?.value === expected, shared.page); }
      await page.getByRole("button", { name: "Edit photos", exact: true }).click(); await select(hero.id); await page.setViewportSize({ width: 390, height: 844 });
      await page.locator("iframe").scrollIntoViewIfNeeded(); await image(hero.id).scrollIntoViewIfNeeded();
      await preview.getByRole("button", { name: `Change photo: ${hero.pageName} — ${hero.name}`, exact: true }).click();
      const drawer = page.getByRole("dialog", { name: "Photo controls", exact: true }); await drawer.waitFor();
      await drawer.getByLabel("Replace photo", { exact: true }).setInputFiles({ name: "mobile.png", mimeType: "image/png", buffer: png });
      await drawer.getByRole("button", { name: "Save changes", exact: true }).click(); await drawer.getByText("All changes saved.", { exact: true }).waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false); await page.screenshot({ path: `${root}/screenshots/editor-mobile.png` }); await page.keyboard.press("Escape"); assert.equal(await drawer.isVisible(), false);
      assert.deepEqual(errors, []);
      await db.category.create({ data: { id: prefix, slug: prefix, name: prefix } });
      let design = await db.design.findUnique({ where: { slug: template }, include: { tiers: true } });
      if (!design) { design = await db.design.create({ data: { slug: template, title: template, summary: "Test", description: "Test", status: "PUBLISHED", categoryId: prefix, heroImage: `/templates/${template}/hero.webp`, deliverables: [], tiers: { create: { level: "STARTER", name: "Starter", priceCents: 10000, inclusions: [] } } }, include: { tiers: true } }); createdDesign = design.id; }
      await db.coupon.create({ data: { code: coupon, percentOff: 100, maxRedemptions: 2 } });
      assert.equal((await owner.request.post(base + "/api/cart", { headers: { origin: base }, data: { designId: design.id, tierId: design.tiers[0].id } })).status(), 201);
      assert.equal((await owner.request.post(base + "/api/cart/coupon", { headers: { origin: base }, data: { code: coupon } })).status(), 200);
      assert.equal((await owner.request.post(base + "/api/checkout", { headers: { origin: base, "idempotency-key": randomUUID() }, data: { savedDraftTemplates: [template], imageRightsConfirmed: true } })).status(), 200);
      const item = await db.orderItem.findFirstOrThrow({ where: { order: { userId: users[0], status: "PAID" } }, include: { personalization: { include: { images: true } } } }); assert.equal(item.personalization.sourceReleaseId, digest); assert.equal(item.personalization.images.filter(i => i.slot.startsWith("placement:")).length, 4);
      await db.personalizationDraft.deleteMany({ where: { userId: users[0] } });
      const maintenance = await owner.request.post(base + "/api/jobs/maintenance", { headers: { authorization: `Bearer ${secret}` }, timeout: 150000 }); assert.equal(maintenance.status(), 200); assert.equal((await maintenance.json()).purchases.ready, 1);
      const download = await owner.request.get(`${base}/api/downloads/${item.id}?file=purchased-source`, { timeout: 120000 }); assert.equal(download.status(), 200);
      const purchased = await download.body(), files = unzipSync(purchased); await writeFile(`${root}/${template}-purchased.zip`, purchased);
      const value = JSON.parse(strFromU8(files[`${template}/src/app/personalized.json`])); assert.equal(value.photoPlacements[primary.id].alt, alt);
      for (const id of [primary.id, shared.id, secondary.id, hero.id]) assert.ok(files[`${template}/public/personalized/placements/${id}.webp`]);
      const out = path.resolve(`${root}/purchased`); for (const [name, bytes] of Object.entries(files)) { const file = path.resolve(out, name); if (!file.startsWith(out + path.sep)) throw Error("Unsafe extraction"); await mkdir(path.dirname(file), { recursive: true }); await writeFile(file, bytes); }
      await writeFile(`${root}/editor-verification.json`, JSON.stringify({ verifiedAt: new Date().toISOString(), locations: registry.placements.length, checks: ["direct selection", "every location reachable", "independent replacement", "interrupted upload retry", "original restoration", "explicit reuse", "owner isolation", "saved reload", "mobile saving", "purchase delivery after draft deletion"] }, null, 2));
      console.log(`${template}: photo editing and purchased download passed`);
    } catch (error) {
      console.error(`${template}: ${error.message?.split("Call log:")[0]?.trim()}`);
      if (page) await page.screenshot({ path: `${root}/screenshots/failure.png` }).catch(() => {});
      if (serverDiagnostics.length) console.error("Preview diagnostics:", serverDiagnostics.slice(-5)); if (errors.length) console.error("Browser exceptions:", errors);
      if (error.message?.includes("Call log:")) { const message = error.message.split("Call log:")[0].trim(); const frames = error.stack?.split("\n").filter(line => /^\s+at /.test(line)) ?? []; throw Object.assign(Error(message), { stack: [`Error: ${message}`, ...frames].join("\n") }); } throw error;
    } finally {
      await browser?.close();
      try {
        await db.checkoutRequest.deleteMany({ where: { userId: { in: users } } }); await db.order.deleteMany({ where: { userId: { in: users } } }); await db.user.deleteMany({ where: { id: { in: users } } });
        if (createdDesign) await db.design.deleteMany({ where: { id: createdDesign } }); await db.category.deleteMany({ where: { id: prefix } }); await db.coupon.deleteMany({ where: { code: coupon } });
        if (previous) await db.activeTemplateRelease.upsert({ where: { template }, create: previous, update: { releaseId: previous.releaseId } }); else await db.activeTemplateRelease.deleteMany({ where: { template } });
        if (!existed) await db.templateRelease.deleteMany({ where: { sha256: digest, purchases: { none: {} }, active: { none: {} } } });
        const rateNames = ["personalization", "checkout", "coupon", "download", "personalization-coral-photo", "personalization-house-photo", "personalization-coral-placement", "personalization-harbor-placement", ...["pine", "lumen", "isla", "ember", "spa", "bloom"].map(p => `personalization-${p}-photo`), `personalization-${template}-placement`];
        const keys = [`login:ip:${testIp}`, ...emails.map(email => `login:email:${email}`), ...users.flatMap(id => rateNames.map(name => `${name}:${id}`))].map(key => createHash("sha256").update(key).digest("hex")); await db.rateLimitBucket.deleteMany({ where: { key: { in: keys } } });
      } finally { await db.$disconnect(); }

    }
  });
}
