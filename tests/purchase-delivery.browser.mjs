import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { test } from "node:test";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { chromium } from "playwright-core";
import sharp from "sharp";
import { strFromU8, unzipSync } from "fflate";
import { testDatabaseConfig } from "../scripts/personalization-test-config.mjs";
import { registerTemplateRelease } from "../src/lib/personalization/purchases.ts";
import { emptyDraft } from "../src/lib/personalization/harbor-draft.ts";
import { markOrderRefunded } from "../src/lib/orders.ts";
import { phase3Exports } from "./helpers/phase3-exports.mjs";

const phase3 = process.env.BAYBLOOM_PURCHASE_PHASE === "3";
const scenarios = phase3 ? phase3Exports : [
  { template: "harbor-house", title: "Harbor House", photo: "lighthouse" },
  { template: "bloomfield-gardens", title: "Bloomfield Gardens", photo: "lawn" },
];
const output = phase3 ? "storage/phase3/purchases" : "storage/phase2";
test(`purchaser checkout, package preparation and authenticated downloads for ${phase3 ? "all six Phase 3 templates" : "both pilots"}`, { timeout: 720_000 }, async () => {
  const { target, direct } = testDatabaseConfig();
  const db = new PrismaClient({ datasources: { db: { url: target } } });
  const prefix = `delivery-${randomUUID()}`;
  const ids = [`${prefix}-alice`, `${prefix}-bob`];
  const emails = ids.map(id => `${id}@example.test`);
  const password = randomBytes(24).toString("base64url");
  const templates = scenarios.map(item => item.template);
  const createdDesigns = [];
  const releases = [];
  const previousActive = await db.activeTemplateRelease.findMany({ where: { template: { in: templates } } });
  const coupon = `DELIVERY-${randomUUID().slice(0, 12)}`.toUpperCase();
  const testIp = `198.18.${randomBytes(1)[0]}.${randomBytes(1)[0]}`;
  const maintenanceSecret = randomBytes(32).toString("base64url");
  let browser;
  let server;
  let verificationCode;
  const diagnostics = [];
  try {
    await db.category.create({ data: { id: prefix, slug: prefix, name: prefix } });
    const passwordHash = await bcrypt.hash(password, 10);
    await db.user.createMany({ data: ids.map((id, index) => ({ id, email: emails[index], name: "Delivery Buyer", passwordHash, emailVerified: new Date() })) });
    await db.coupon.create({ data: { code: coupon, percentOff: 100, maxRedemptions: 10 } });
    const catalog = [];
    for (const template of templates) {
      const scenario = scenarios.find(item => item.template === template);
      // Only use the actual locked releases from independent production builds.
      const archive = await readFile(`storage/${phase3 ? "phase3" : "phase1"}/release/deliverables/${template}/${template}-source.zip`);
      const digest = createHash("sha256").update(archive).digest("hex");
      const existed = await db.templateRelease.findUnique({ where: { sha256: digest }, select: { sha256: true } });
      await registerTemplateRelease(template, archive, db);
      if (!existed) releases.push(digest);
      let design = await db.design.findUnique({ where: { slug: template }, include: { tiers: true } });
      if (!design) {
        design = await db.design.create({ data: { slug: template, title: scenario.title,
          summary: "Test", description: "Test", status: "PUBLISHED", categoryId: prefix,
          heroImage: `/templates/${template}/${scenario.photo}.webp`, deliverables: [],
          tiers: { create: { level: "STARTER", name: "Starter", priceCents: 10000, inclusions: [] } },
        }, include: { tiers: true } });
        createdDesigns.push(design.id);
      }
      catalog.push(design);
    }
    const socket = createServer();
    await new Promise(resolve => socket.listen(0, "127.0.0.1", resolve));
    const port = socket.address().port;
    await new Promise(resolve => socket.close(resolve));
    const base = `http://127.0.0.1:${port}`;
    await mkdir(".next/personalization-e2e-config", { recursive: true });
    await writeFile(".next/personalization-e2e-config/tsconfig.json", JSON.stringify({ extends: "../../tsconfig.json",
      include: ["../../next-env.d.ts", "../../src/**/*.ts", "../../src/**/*.tsx", "../personalization-e2e/types/**/*.ts", "../personalization-e2e/dev/types/**/*.ts"], exclude: ["../../node_modules"],
    }));
    server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", String(port)], {
      env: { ...process.env, BAYBLOOM_PERSONALIZATION_TEST: "1", DATABASE_URL: target, DIRECT_URL: direct,
        AUTH_SECRET: randomBytes(32).toString("base64url"), AUTH_URL: base, NEXT_PUBLIC_SITE_URL: base,
        AUTH_GOOGLE_ID: "", AUTH_GOOGLE_SECRET: "", RESEND_API_KEY: "", EMAIL_FROM: "",
        STRIPE_SECRET_KEY: "", STRIPE_WEBHOOK_SECRET: "", NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "", PAYMONGO_GCASH_ENABLED: "false",
        S3_ENDPOINT: "", S3_BUCKET: "", S3_ACCESS_KEY: "", S3_SECRET_KEY: "", MAINTENANCE_SECRET: maintenanceSecret,
      }, windowsHide: true, stdio: ["ignore", "pipe", "pipe"],
    });
    for (const stream of [server.stdout, server.stderr]) stream.on("data", chunk => {
      const output = String(chunk);
      verificationCode = output.match(/Your Baybloom checkout code is (\d{6})\./)?.[1] ?? verificationCode;
      for (const line of output.split(/\r?\n/)) if (/error|failed|reload|restart/i.test(line) && !/postgres|secret|token|password|email|cookie|authorization/i.test(line)) diagnostics.push(line.slice(0, 300));
    });
    const deadline = Date.now() + 120_000;
    while (true) {
      if (server.exitCode !== null) throw new Error("Isolated test server exited");
      try { if ((await fetch(`${base}/api/auth/csrf`)).ok) break; } catch { /* starting */ }
      if (Date.now() > deadline) throw new Error("Isolated test server did not start");
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    browser = await chromium.launch({ channel: "chrome", headless: true });
    const buyer = await browser.newContext({ viewport: { width: 1440, height: 1000 }, extraHTTPHeaders: { "x-forwarded-for": testIp } });
    const other = await browser.newContext({ extraHTTPHeaders: { "x-forwarded-for": testIp } });
    async function signIn(context, email) {
      const { csrfToken } = await (await context.request.get(`${base}/api/auth/csrf`)).json();
      assert.equal((await context.request.post(`${base}/api/auth/callback/credentials`, { form: { csrfToken, email, password, json: "true" } })).ok(), true);
      assert.equal((await (await context.request.get(`${base}/api/auth/session`)).json()).user.email, email);
    }
    await signIn(buyer, emails[0]);
    await signIn(other, emails[1]);
    const png = await sharp({ create: { width: 24, height: 24, channels: 3, background: "#325778" } }).png().toBuffer();
    for (const design of catalog) {
      assert.equal((await buyer.request.post(`${base}/api/cart`, { headers: { origin: base }, data: { designId: design.id, tierId: design.tiers[0].id } })).status(), 201);
      const scenario = scenarios.find(item => item.template === design.slug);
      const draft = { ...emptyDraft(design.slug), ...(scenario.overrides ?? {}), business: { name: `Purchased ${design.slug}` }, home: { headline: `Delivery proof ${design.slug}` } };
      assert.equal((await buyer.request.put(`${base}/api/personalization/${design.slug}`, { headers: { origin: base },
        data: { draft, photo: { action: "replace", base64: png.toString("base64") } },
      })).status(), 200);
      if (phase3) {
        const photo = await buyer.request.put(`${base}/api/personalization/${design.slug}/photos/${scenario.photo}/image`, {
          headers: { origin: base, "content-type": "image/png" }, data: png,
        });
        assert.equal(photo.status(), 200);
        if (design.slug === "coral-cove") for (const endpoint of ["villas/overwater-villa/photo", "gallery/snorkeler/photo"]) {
          assert.equal((await buyer.request.put(`${base}/api/personalization/coral-cove/${endpoint}`, {
            headers: { origin: base, "content-type": "image/png" }, data: png,
          })).status(), 200);
        }
      }
    }
    assert.equal((await buyer.request.post(`${base}/api/cart/coupon`, { headers: { origin: base }, data: { code: coupon } })).status(), 200);
    const invalid = (data, origin = base) => buyer.request.post(`${base}/api/checkout`, { headers: { origin, "idempotency-key": randomUUID() }, data });
    assert.equal((await invalid({}, "https://foreign.example")).status(), 403);
    assert.equal((await invalid({ savedDraftTemplates: [templates[0]] })).status(), 400);
    assert.equal((await invalid({ savedDraftTemplates: ["unknown-template"], imageRightsConfirmed: true })).status(), 400);
    assert.equal(await db.order.count({ where: { userId: ids[0] } }), 0);

    const page = await buyer.newPage();
    const browserErrors = [];
    page.on("pageerror", error => browserErrors.push(error.message));
    await page.goto(`${base}/checkout`, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "Choose your website content" }).waitFor();
    const deliveryEmail = `alternate-${prefix}@example.com`;
    const recipientInput = page.getByRole("textbox", { name: "Delivery email" });
    assert.equal(await recipientInput.inputValue(), emails[0]);
    assert.equal(await page.getByRole("link", { name: "Call +63 966 922 1451" }).getAttribute("href"), "tel:+639669221451");
    assert.equal(await page.getByRole("link", { name: "baybloom.studios@gmail.com" }).getAttribute("href"), "mailto:baybloom.studios@gmail.com");
    await page.getByRole("button", { name: /Ask Bloom|Need any help\?/ }).click();
    const guide = page.getByRole("dialog", { name: "Bloom" });
    await guide.getByRole("button", { name: "Order with the owner" }).click();
    assert.equal(await guide.getByRole("link", { name: "baybloom.studios@gmail.com" }).getAttribute("href"), "mailto:baybloom.studios@gmail.com");
    assert.equal(await guide.getByRole("link", { name: "Call +63 966 922 1451" }).getAttribute("href"), "tel:+639669221451");
    await guide.getByRole("button", { name: "Minimize Bloom" }).click();
    await recipientInput.fill(deliveryEmail);
    await page.getByRole("button", { name: "Send verification code" }).click();
    await page.getByText("Check this inbox for a six-digit code.").waitFor();
    assert.match(verificationCode, /^\d{6}$/);
    await page.getByRole("textbox", { name: "Verification code" }).fill(verificationCode);
    await page.getByRole("button", { name: "Verify email" }).click();
    await page.getByText("Delivery email verified.").waitFor();
    for (const fieldset of await page.locator("fieldset").all()) await fieldset.getByLabel("My saved content and photos").check();
    assert.equal(await page.getByRole("button", { name: "Complete order" }).isDisabled(), true);
    await page.getByLabel("I have permission to use the photos").check();
    await page.evaluate(() => window.scrollTo(0, 0));
    await mkdir(`${output}/screenshots`, { recursive: true });
    await page.screenshot({ path: `${output}/screenshots/checkout-desktop.png`, fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: `${output}/screenshots/checkout-mobile.png`, fullPage: true });
    const checkoutRequest = page.waitForRequest(request => request.url() === `${base}/api/checkout` && request.method() === "POST");
    await page.getByRole("button", { name: "Complete order" }).click();
    const submitted = await checkoutRequest;
    await page.waitForURL("**/checkout/success?order=**", { timeout: 90_000 });
    const order = await db.order.findFirstOrThrow({ where: { userId: ids[0], status: "PAID" }, include: { items: { include: { personalization: true } } } });
    assert.equal(order.items.length, templates.length);
    assert.equal(order.deliveryEmail, deliveryEmail);
    assert.equal((await db.coupon.findUniqueOrThrow({ where: { code: coupon } })).redemptions, 1);
    await db.personalizationDraft.deleteMany({ where: { userId: ids[0] } });
    const retry = await buyer.request.post(`${base}/api/checkout`, { headers: { origin: base, "idempotency-key": submitted.headers()["idempotency-key"] }, data: submitted.postDataJSON() });
    assert.equal(retry.status(), 200);
    assert.equal(await db.order.count({ where: { userId: ids[0] } }), 1);
    for (const item of order.items) {
      const downloadUrl = `${base}/api/downloads/${item.id}?file=purchased-source`;
      assert.equal((await buyer.request.get(downloadUrl)).status(), 503);
      assert.equal((await other.request.get(downloadUrl)).status(), 404);
      assert.equal((await fetch(downloadUrl)).status, 401);
    }
    await page.goto(`${base}/account/orders/${order.id}`, { waitUntil: "networkidle" });
    assert.equal(await page.getByText("Preparing your saved package.", { exact: false }).count(), templates.length);
    assert.equal((await buyer.request.post(`${base}/api/jobs/maintenance`)).status(), 401);
    for (let i = 0; i < templates.length; i++) {
      const run = await buyer.request.post(`${base}/api/jobs/maintenance`, { headers: { authorization: `Bearer ${maintenanceSecret}` }, timeout: 150_000 });
      assert.equal(run.status(), 200);
      assert.equal((await run.json()).purchases.ready, 1);
    }
    await page.reload({ waitUntil: "networkidle" });
    for (const item of order.items) {
      const response = await buyer.request.get(`${base}/api/downloads/${item.id}?file=purchased-source`, { timeout: 120_000 });
      assert.equal(response.status(), 200);
      assert.match(response.headers()["cache-control"], /private, no-store/);
      assert.match(response.headers()["content-disposition"], /attachment/);
      const bytes = await response.body();
      const job = await db.orderDelivery.findUniqueOrThrow({ where: { orderItemId: item.id } });
      assert.ok(job.emailSentAt);
      assert.equal(job.emailPayload.to, deliveryEmail);
      const emailedUrl = job.emailPayload.text.match(/https?:\/\/\S+\/api\/project-delivery\/\S+/)?.[0];
      assert.ok(emailedUrl);
      const emailedDownload = await fetch(emailedUrl);
      assert.equal(emailedDownload.status, 200);
      assert.deepEqual(Buffer.from(await emailedDownload.arrayBuffer()), bytes);
      await writeFile(`${output}/${item.personalization.template}-purchased.zip`, bytes);
      const files = unzipSync(bytes);
      const template = item.personalization.template;
      const content = JSON.parse(strFromU8(files[`${template}/src/app/personalized.json`]));
      assert.equal(content.home.headline, `Delivery proof ${template}`);
      assert.ok(files[`${template}/public/personalized/hero.webp`]);
      if (phase3) {
        const scenario = phase3Exports.find(item => item.template === template);
        for (const [field, value] of Object.entries(scenario.overrides)) assert.deepEqual(content[field], value);
        assert.equal(content[scenario.property][scenario.photo], `/personalized/photos/${scenario.photo}.webp`);
        assert.ok(files[`${template}/public/personalized/photos/${scenario.photo}.webp`]);
        if (template === "coral-cove") {
          assert.ok(files[`${template}/public/personalized/villas/overwater-villa.webp`]);
          assert.ok(files[`${template}/public/personalized/gallery/snorkeler.webp`]);
        }
      }
      assert.equal(await page.getByRole("link", { name: `${template}-personalized.zip` }).count(), 1);
    }
    await page.screenshot({ path: `${output}/screenshots/order-mobile.png`, fullPage: true });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({ path: `${output}/screenshots/order-desktop.png`, fullPage: true });
    assert.deepEqual(browserErrors, []);
    await markOrderRefunded(order.id, db);
    for (const item of order.items) assert.equal((await buyer.request.get(`${base}/api/downloads/${item.id}?file=purchased-source`)).status(), 404);
    assert.equal((await db.order.findUniqueOrThrow({ where: { id: order.id } })).status, "REFUNDED");
  } catch (error) {
    if (diagnostics.length) console.error("Isolated server diagnostics:", diagnostics.slice(-12));
    // Playwright request failures include all request headers. Keep generated
    // test session cookies and maintenance credentials out of test reports.
    if (error.message?.includes("Call log:")) throw new Error(error.message.split("Call log:")[0].trim());
    throw error;
  } finally {
    await browser?.close();
    if (server?.pid && server.exitCode === null) {
      if (process.platform === "win32") spawnSync("taskkill", ["/PID", String(server.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
      else server.kill("SIGTERM");
    }
    const keys = [`login:ip:${testIp}`, ...emails.map(email => `login:email:${email}`), ...ids.flatMap(id => [
      `personalization:${id}`, `checkout:${id}`, `coupon:${id}`, `download:${id}`, `personalization-villa-photo:${id}`, `personalization-gallery-photo:${id}`,
      ...["coral", "pine", "lumen", "isla", "ember", "spa"].map(template => `personalization-${template}-photo:${id}`),
    ])].map(key => createHash("sha256").update(key).digest("hex"));
    try {
      await db.checkoutRequest.deleteMany({ where: { userId: { in: ids } } });
      await db.order.deleteMany({ where: { userId: { in: ids } } });
      await db.user.deleteMany({ where: { id: { in: ids } } });
      await db.design.deleteMany({ where: { id: { in: createdDesigns } } });
      await db.category.deleteMany({ where: { id: prefix } });
      await db.coupon.deleteMany({ where: { code: coupon } });
      await db.rateLimitBucket.deleteMany({ where: { key: { in: keys } } });
      for (const template of templates) {
        const previous = previousActive.find(row => row.template === template);
        if (previous) await db.activeTemplateRelease.upsert({ where: { template }, create: previous, update: { releaseId: previous.releaseId } });
        else await db.activeTemplateRelease.deleteMany({ where: { template } });
      }
      await db.templateRelease.deleteMany({ where: { sha256: { in: releases }, purchases: { none: {} }, active: { none: {} } } });
    } finally { await db.$disconnect(); }
  }
});
