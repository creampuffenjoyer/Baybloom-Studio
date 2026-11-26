import assert from "node:assert/strict";
import { test } from "node:test";
import { spawn, spawnSync } from "node:child_process";
import { request as httpRequest } from "node:http";
import { createServer } from "node:https";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { createWriteStream, existsSync } from "node:fs";
import { setPriority, constants } from "node:os";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import sharp from "sharp";
import { chromium } from "playwright-core";
import { testDatabaseConfig } from "../scripts/personalization-test-config.mjs";
import { authenticatorCode } from "./helpers/totp.mjs";

test("web security: browser CSRF, XSS, injection, authentication and object authorization", { timeout: 600000 }, async (t) => {
  try { setPriority(0, constants.priority.PRIORITY_BELOW_NORMAL); } catch { /* best effort on the shared computer */ }
  const { target, direct } = testDatabaseConfig();
  const db = new PrismaClient({ datasources: { db: { url: target } } });
  const prefix = `security-${randomUUID()}`;
  const users = [`${prefix}-alice`, `${prefix}-bob`, `${prefix}-admin`];
  const emails = users.map((id) => `${id}@example.test`);
  const signupEmail = `${prefix}-signup@example.test`;
  const password = randomBytes(24).toString("base64url");
  const secret = randomBytes(32).toString("base64url");
  const ipBytes = randomBytes(2);
  const clientIp = `198.18.${ipBytes[0]}.${ipBytes[1]}`; // isolated limiter identity at the trusted loopback proxy
  const couponCode = `SEC${randomBytes(12).toString("hex").toUpperCase()}`;
  const base = "https://localhost:3322";
  const xss = '<img src=x onerror="window.__auditXss=1">';
  const fileKey = `security/${prefix}.txt`;
  const orderIds = [];
  let server, browser, attacker, tlsProxy;
  let serverLog;
  const errors = [];

  try {
    await mkdir("storage/security", { recursive: true });
    const keyPath = `storage/security/${prefix}-key.pem`, certPath = `storage/security/${prefix}-cert.pem`;
    const openssl = process.platform === "win32" ? [process.env.OPENSSL_BINARY, "C:/Program Files/Git/usr/bin/openssl.exe", "C:/Program Files/Git/mingw64/bin/openssl.exe"].find((path) => path && existsSync(path)) : "openssl";
    assert.ok(openssl, "OpenSSL is required for the local HTTPS fixture");
    const certificate = spawnSync(openssl, ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-keyout", keyPath, "-out", certPath, "-days", "1", "-subj", "/CN=localhost"], { windowsHide: true, stdio: "ignore", env: { ...process.env, MSYS_NO_PATHCONV: "1" } });
    assert.equal(certificate.status, 0, "Ephemeral loopback certificate generated");
    const tls = { key: await readFile(keyPath), cert: await readFile(certPath) };
    await writeFile(`storage/${fileKey}`, "Owner-only audit fixture");
    await db.user.createMany({ data: users.map((id, index) => ({ id, email: emails[index], name: index ? "Other account" : xss, role: index === 2 ? "ADMIN" : "CLIENT", emailVerified: new Date(), passwordHash: bcrypt.hashSync(password, 12) })) });
    await db.category.create({ data: { id: prefix, slug: prefix, name: "Security fixture" } });
    const design = await db.design.create({ data: {
      id: prefix, slug: prefix, title: "Audit website", summary: "</script><script>window.__auditJsonLd=1</script>", description: "Fixture", status: "PUBLISHED", categoryId: prefix,
      heroImage: "/images/designs/harbor-house/cover.webp", heroAlt: "Audit preview", deliverables: [],
      tiers: { create: [{ id: `${prefix}-starter`, level: "STARTER", name: "Starter", priceCents: 10000, inclusions: ["Source"] }, { id: `${prefix}-premium`, level: "PREMIUM", name: "Premium", priceCents: 20000, inclusions: ["Source", "Guide"] }] },
    }, include: { tiers: true } });
    const starter = design.tiers.find((tier) => tier.level === "STARTER");
    const premium = design.tiers.find((tier) => tier.level === "PREMIUM");
    await db.deliverableFile.createMany({ data: [{ id: `${prefix}-file`, designId: design.id, minTierId: starter.id, name: "Audit.txt", storageKey: fileKey }, { id: `${prefix}-premium-file`, designId: design.id, minTierId: premium.id, name: "Premium.txt", storageKey: fileKey }] });
    const paid = await db.order.create({ data: { userId: users[0], status: "PAID", subtotalCents: 10000, totalCents: 10000, currency: "PHP", confirmationSentAt: new Date(), items: { create: { designId: design.id, tierId: starter.id, designTitle: design.title, tierName: "Starter", priceCents: 10000 } } }, include: { items: true } });
    orderIds.push(paid.id);
    const pending = await db.order.create({ data: { userId: users[1], status: "PENDING", subtotalCents: 10000, totalCents: 10000, currency: "PHP", items: { create: { designId: design.id, tierId: starter.id, designTitle: design.title, tierName: "Starter", priceCents: 10000 } } }, include: { items: true } });
    orderIds.push(pending.id);
    const otherCart = await db.cartItem.create({ data: { userId: users[1], designId: design.id, tierId: starter.id, addonIds: [] } });
    await db.coupon.create({ data: { code: couponCode, percentOff: 100, maxRedemptions: 3 } });

    await mkdir(".next/personalization-e2e-config", { recursive: true });
    await writeFile(".next/personalization-e2e-config/tsconfig.json", JSON.stringify({ extends: "../../tsconfig.json", include: ["../../next-env.d.ts", "../../src/**/*.ts", "../../src/**/*.tsx", "../personalization-e2e/types/**/*.ts", "../personalization-e2e/dev/types/**/*.ts"], exclude: ["../../node_modules"] }));
    const isolatedEnv = {
      ...process.env, NODE_OPTIONS: `--import=${pathToFileURL(resolve("tests/helpers/pwned-passwords-fixture.mjs")).href}`, RAYON_NUM_THREADS: "2", UV_THREADPOOL_SIZE: "2", BAYBLOOM_PERSONALIZATION_TEST: "1", DATABASE_URL: target, DIRECT_URL: direct,
      AUTH_SECRET: secret, MFA_ENCRYPTION_KEY: randomBytes(32).toString("base64"), AUTH_URL: "", NEXTAUTH_URL: "", AUTH_TRUST_HOST: "", RAILWAY_PUBLIC_DOMAIN: new URL(base).host, NEXT_PUBLIC_SITE_URL: "", AUTH_GOOGLE_ID: "", AUTH_GOOGLE_SECRET: "", RESEND_API_KEY: "", EMAIL_FROM: "",
      ONLINE_CHECKOUT_ENABLED: "true", STRIPE_SECRET_KEY: "", STRIPE_WEBHOOK_SECRET: "", NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "", S3_ENDPOINT: "", S3_BUCKET: "", S3_ACCESS_KEY: "", S3_SECRET_KEY: "", MAINTENANCE_SECRET: secret,
    };
    serverLog = createWriteStream("storage/security/browser-server.log");
    const build = spawn(process.execPath, ["node_modules/next/dist/bin/next", "build"], { windowsHide: true, stdio: ["ignore", "pipe", "pipe"], env: isolatedEnv });
    for (const stream of [build.stdout, build.stderr]) stream.on("data", (chunk) => serverLog.write(chunk));
    const buildStatus = await new Promise((resolve, reject) => { build.once("error", reject); build.once("exit", resolve); });
    assert.equal(buildStatus, 0, "Isolated production build passes; diagnostics in storage/security/browser-server.log");
    t.diagnostic("Isolated production build passed");
    server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "3321"], { windowsHide: true, stdio: ["ignore", "pipe", "pipe"], env: isolatedEnv });
    for (const stream of [server.stdout, server.stderr]) stream.on("data", (chunk) => serverLog.write(chunk));
    tlsProxy = createServer(tls, (incoming, outgoing) => {
      const upstream = httpRequest({ hostname: "127.0.0.1", port: 3321, path: incoming.url, method: incoming.method,
        headers: { ...incoming.headers, host: new URL(base).host, "x-forwarded-proto": "https", "x-forwarded-for": clientIp },
      }, (response) => { outgoing.writeHead(response.statusCode, response.headers); response.pipe(outgoing); });
      upstream.on("error", () => { if (!outgoing.headersSent) outgoing.writeHead(502); outgoing.end(); });
      incoming.pipe(upstream);
    });
    await new Promise((resolve) => tlsProxy.listen(3322, "127.0.0.1", resolve));
    const deadline = Date.now() + 120000;
    while (true) {
      if (server.exitCode !== null) throw new Error("Isolated test server exited");
      let ready = false;
      try { ready = (await fetch("http://127.0.0.1:3321/api/auth/csrf", { signal: AbortSignal.timeout(10000) })).ok; } catch { /* cold startup */ }
      if (ready) break;
      assert.ok(Date.now() < deadline, "Isolated server starts");
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    browser = await chromium.launch({ channel: "chrome", headless: true });
    const contexts = await Promise.all([0, 1, 2].map(() => browser.newContext({ reducedMotion: "reduce", ignoreHTTPSErrors: true })));
    const [owner, other, anonymous] = contexts;
    const signedOutSession = await anonymous.request.get(`${base}/api/auth/session`);
    assert.equal(signedOutSession.status(), 200);
    assert.equal(await signedOutSession.json(), null);
    const providers = await anonymous.request.get(`${base}/api/auth/providers`);
    assert.equal(providers.status(), 200);
    assert.equal((await providers.json()).credentials.callbackUrl, `${base}/api/auth/callback/credentials`);
    const robots = await anonymous.request.get(`${base}/robots.txt`);
    assert.ok((await robots.text()).includes(`Sitemap: ${base}/sitemap.xml`));

    async function login(context, index = 0, value = password, code = "") {
      const { csrfToken } = await (await context.request.get(`${base}/api/auth/csrf`)).json();
      await context.request.post(`${base}/api/auth/callback/credentials`, { form: { csrfToken, email: emails[index], password: value, code, json: "true" } });
      assert.equal((await (await context.request.get(`${base}/api/auth/session`)).json()).user?.email, emails[index]);
    }
    await login(owner); await login(other, 1);
    let page = await owner.newPage();
    page.setDefaultNavigationTimeout(90000);
    page.setDefaultTimeout(60000);
    page.on("pageerror", (error) => errors.push(error.message));
    const json = { origin: base, "content-type": "application/json" };
    const routes = [["POST", "/api/favorites"], ["DELETE", `/api/favorites/${design.id}`], ["POST", "/api/cart"], ["DELETE", `/api/cart/${otherCart.id}`], ["POST", "/api/cart/coupon"], ["DELETE", "/api/cart/coupon"], ["POST", "/api/account/password"], ["POST", "/api/checkout"]];

    await t.test("unverified accounts cannot save drafts or upload through any photo path", async () => {
      await db.user.update({ where: { id: users[0] }, data: { emailVerified: null } });
      for (const template of ["harbor-house", "coral-cove", "pine-ridge-lodge", "lumen-lake-villas", "isla-verde-boutique", "ember-and-salt", "still-water-spa", "bloomfield-gardens"]) {
        for (const path of [`/api/personalization/${template}`, `/api/personalization/${template}/photos/unknown/image`, `/api/personalization/${template}/placements/unknown/image`]) {
          const response = await owner.request.put(base + path, { headers: json, data: {} });
          assert.equal(response.status(), 403, path);
          assert.equal((await response.json()).code, "EMAIL_VERIFICATION_REQUIRED");
        }
      }
      for (const path of ["/api/personalization/harbor-house/rooms/unknown/photo", "/api/personalization/coral-cove/villas/unknown/photo", "/api/personalization/coral-cove/gallery/unknown/photo"]) {
        assert.equal((await owner.request.put(base + path, { headers: json, data: {} })).status(), 403);
      }
      assert.equal((await owner.request.get(base + "/api/personalization/harbor-house")).status(), 200);
      assert.equal(await db.personalizationDraft.count({ where: { userId: users[0] } }), 0);
      await db.user.update({ where: { id: users[0] }, data: { emailVerified: new Date() } });
    });

    await t.test("registration rejects breached passwords and enforces per-email limits", async () => {
      const registration = await anonymous.newPage();
      await registration.goto(base + "/register", { waitUntil: "domcontentloaded" });
      await registration.getByLabel("Full name", { exact: true }).fill("Security fixture");
      await registration.getByLabel("Email", { exact: true }).fill(`${prefix}-registration@example.test`);
      await registration.getByLabel("Password", { exact: true }).fill("passwordpassword");
      const submit = async () => {
        await Promise.all([
          registration.waitForResponse(response => response.request().method() === "POST" && new URL(response.url()).pathname === "/register"),
          registration.getByRole("button", { name: "Create account", exact: true }).click(),
        ]);
        await registration.getByRole("button", { name: "Create account", exact: true }).waitFor({ state: "visible" });
      };
      await submit();
      await registration.getByText("This password appears in known data breaches. Choose a different passphrase.", { exact: true }).waitFor();
      assert.equal(await db.user.count({ where: { email: `${prefix}-registration@example.test` } }), 0);
      for (let attempt = 0; attempt < 3; attempt++) {
        await registration.getByLabel("Password", { exact: true }).fill("passwordpassword");
        await submit();
        if (attempt < 2) await registration.getByText("This password appears in known data breaches. Choose a different passphrase.", { exact: true }).waitFor();
      }
      await registration.getByText("Too many sign-up attempts. Please try again later.", { exact: true }).waitFor();
      await registration.close();
    });

    await t.test("registration and login forms create a session and honor the requested page", async () => {
      const signup = await browser.newContext({ ignoreHTTPSErrors: true });
      try {
        const form = await signup.newPage();
        const callback = "?callbackUrl=%2Faccount";
        await form.goto(`${base}/register${callback}`);
        await form.getByLabel("Full name", { exact: true }).fill("Security fixture");
        await form.getByLabel("Email", { exact: true }).fill(signupEmail);
        await form.getByLabel("Password", { exact: true }).fill(password);
        await form.getByRole("button", { name: "Create account", exact: true }).click();
        await form.waitForURL(`${base}/account`);
        assert.equal((await (await signup.request.get(`${base}/api/auth/session`)).json()).user?.email, signupEmail);

        await signup.clearCookies();
        await form.goto(`${base}/login${callback}`);
        await form.getByLabel("Email", { exact: true }).fill(signupEmail);
        await form.getByLabel("Password", { exact: true }).fill(password);
        await form.getByRole("button", { name: "Log in", exact: true }).click();
        await form.waitForURL(`${base}/account`);
        assert.equal((await (await signup.request.get(`${base}/api/auth/session`)).json()).user?.email, signupEmail);
      } finally {
        await signup.close();
      }
    });

    await t.test("every browser write rejects foreign origins and JSON lookalikes", async () => {
      for (const [method, path] of routes) {
        for (const origin of ["https://attacker.example", "https://localhost:3323", "null"]) assert.equal((await owner.request.fetch(base + path, { method, headers: { ...json, origin }, data: {} })).status(), 403, `${method} ${path}`);
        assert.equal((await owner.request.fetch(base + path, { method, data: {} })).status(), 403);
        if (method === "POST") for (const contentType of ["text/plain", "application/jsonp"]) assert.equal((await owner.request.fetch(base + path, { method, headers: { ...json, "content-type": contentType }, data: "{}" })).status(), 415);
      }
      assert.equal((await owner.request.post(base + "/api/favorites", { headers: json, data: "x".repeat(4097) })).status(), 413);
      assert.equal((await owner.request.post(base + "/api/favorites", { headers: json, data: "{" })).status(), 400);
    });

    await t.test("a real cross-origin simple browser POST cannot mutate favorites", async () => {
      attacker = createServer(tls, (_request, response) => {
        response.setHeader("Content-Type", "text/html");
        response.end(`<script>fetch(${JSON.stringify(base + "/api/favorites")},{method:"POST",mode:"no-cors",credentials:"include",headers:{"Content-Type":"text/plain"},body:${JSON.stringify(JSON.stringify({ designId: design.id }))}}).then(()=>window.complete=true)</script>`);
      });
      await new Promise((resolve) => attacker.listen(0, "127.0.0.1", resolve));
      await page.goto(`https://127.0.0.1:${attacker.address().port}`);
      await page.waitForFunction(() => window.complete);
      assert.equal(await db.favorite.count({ where: { userId: users[0] } }), 0);
    });

    await t.test("session ownership defeats IDOR and user-id/role mass assignment", async () => {
      assert.equal((await anonymous.request.get(base + "/api/cart")).status(), 401);
      assert.equal((await owner.request.post(base + "/api/favorites", { headers: json, data: { designId: design.id, userId: users[1], role: "ADMIN" } })).status(), 201);
      assert.equal(await db.favorite.count({ where: { userId: users[0], designId: design.id } }), 1);
      assert.equal(await db.favorite.count({ where: { userId: users[1], designId: design.id } }), 0);
      assert.equal((await db.user.findUniqueOrThrow({ where: { id: users[0] } })).role, "CLIENT");
      assert.equal((await owner.request.delete(`${base}/api/cart/${otherCart.id}`, { headers: { origin: base } })).status(), 200);
      assert.ok(await db.cartItem.findUnique({ where: { id: otherCart.id } }));
      const download = `${base}/api/downloads/${paid.items[0].id}?file=${prefix}-file&format=json`;
      assert.equal((await other.request.get(download)).status(), 404);
      assert.equal((await anonymous.request.get(download)).status(), 401);
      assert.equal((await owner.request.get(`${base}/api/downloads/${paid.items[0].id}?file=${prefix}-premium-file`)).status(), 404);
      assert.equal((await other.request.get(`${base}/api/downloads/${pending.items[0].id}?file=${prefix}-file`)).status(), 404);
      const result = await owner.request.get(download);
      assert.equal(result.status(), 200);
      assert.match(result.headers()["cache-control"], /private.*no-store/);
      const link = new URL((await result.json()).url, base);
      assert.equal(await (await owner.request.get(link.href)).text(), "Owner-only audit fixture");
      link.searchParams.set("key", "../package.json");
      assert.equal((await owner.request.get(link.href)).status(), 403);
      await db.order.update({ where: { id: paid.id }, data: { status: "REFUNDED" } });
      assert.equal((await owner.request.get(download)).status(), 404);
      await page.goto(`${base}/account/orders/${pending.id}`, { waitUntil: "commit" });
      // Streamed App Router responses can send 200 before notFound() resolves.
      await page.getByRole("heading", { name: "We couldn’t find that page" }).waitFor();
      assert.equal(await page.getByRole("link", { name: /Receipt & downloads/ }).count(), 0);
    });

    await t.test("SQL metacharacters and prototype-property query names remain data", async () => {
      const probe = "' OR 1=1; SELECT pg_sleep(1)--";
      const result = await anonymous.request.get(`${base}/api/designs?q=${encodeURIComponent(probe)}`);
      assert.equal(result.status(), 200);
      assert.equal((await result.json()).items.length, 0);
      assert.equal((await anonymous.request.get(`${base}/api/designs?__proto__=x&constructor=y&toString=z`)).status(), 200);
      assert.equal((await owner.request.get(`${base}/api/downloads/${encodeURIComponent(probe)}?file=${prefix}-file`)).status(), 404);
      const publicDetail = await anonymous.request.get(`${base}/api/designs/${design.slug}`);
      assert.equal(publicDetail.status(), 200);
      assert.equal((await publicDetail.json()).pricing, undefined);
      assert.match(publicDetail.headers()["cache-control"], /private.*no-store/);
      assert.ok((await (await owner.request.get(`${base}/api/designs/${design.slug}`)).json()).pricing);
    });

    await t.test("stored/reflected markup is escaped and internal previews remain usable", async () => {
      await page.close();
      page = await owner.newPage();
      page.on("pageerror", (error) => errors.push(error.message));
      page.setDefaultNavigationTimeout(90000);
      page.setDefaultTimeout(60000);
      await page.goto(`${base}/account`, { waitUntil: "commit" });
      await page.getByLabel("Full name", { exact: true }).waitFor();
      assert.equal(await page.getByLabel("Full name", { exact: true }).inputValue(), xss);
      assert.equal(await page.locator('img[src="x"]').count(), 0);
      assert.equal(await page.evaluate(() => window.__auditXss), undefined);
      await page.goto(`${base}/designs/${design.slug}`, { waitUntil: "commit" });
      await page.getByRole("heading", { name: "Audit website", exact: true }).waitFor();
      assert.equal(await page.evaluate(() => window.__auditJsonLd), undefined);
      const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
      assert.equal(JSON.parse(jsonLd).description, design.summary);
      await page.goto(`${base}/designs?q=${encodeURIComponent(xss)}`, { waitUntil: "commit" });
      await page.getByText("No designs match just yet").waitFor();
      assert.equal(await page.locator('img[src="x"]').count(), 0);
      assert.equal(await page.evaluate(() => window.__auditXss), undefined);
      const draft = { version: 1, template: "harbor-house", business: { name: xss }, home: { headline: xss }, theme: {} };
      assert.equal((await owner.request.put(`${base}/api/personalization/harbor-house`, { headers: json, data: { draft, photo: { action: "keep" }, userId: users[1] } })).status(), 400);
      assert.equal((await owner.request.put(`${base}/api/personalization/harbor-house`, { headers: json, data: { draft, photo: { action: "keep" } } })).status(), 200);
      assert.equal((await (await other.request.get(`${base}/api/personalization/harbor-house`)).json()).draft, null);
      await page.goto(`${base}/personalize/harbor-house`, { waitUntil: "commit" });
      await page.getByRole("button", { name: "Load saved draft", exact: true }).click({ timeout: 60000 });
      const frame = page.frameLocator("iframe");
      await frame.getByRole("heading", { level: 1 }).filter({ hasText: xss }).waitFor({ timeout: 60000 });
      assert.equal(await frame.locator('img[src="x"]').count(), 0);
      assert.equal(await page.frames().find((item) => item.url().includes("/live-preview")).evaluate(() => window.__auditXss), undefined);
      const response = await owner.request.get(`${base}/login`);
      assert.equal(response.headers()["x-frame-options"], "SAMEORIGIN");
      assert.match(response.headers()["content-security-policy"], /frame-ancestors 'self'/);
      assert.equal(response.headers()["x-content-type-options"], "nosniff");
      assert.equal(response.headers()["strict-transport-security"], "max-age=31536000");
    });

    await t.test("uploaded executable markup, forged types and oversized images are refused", async () => {
      const draft = { version: 1, template: "harbor-house", business: {}, home: {}, theme: {} };
      assert.equal((await owner.request.put(`${base}/api/personalization/harbor-house`, { headers: json, data: { draft, photo: { action: "keep" } } })).status(), 200);
      const endpoint = `${base}/api/personalization/harbor-house/placements/home.hero/image`;
      const png = await sharp({ create: { width: 8, height: 8, channels: 3, background: "#337799" } }).png().toBuffer();
      assert.equal((await owner.request.put(endpoint, { headers: { origin: base, "content-type": "image/png" }, data: png })).status(), 200);
      const image = await owner.request.get(endpoint);
      assert.equal(image.headers()["content-type"], "image/webp");
      assert.equal(image.headers()["x-content-type-options"], "nosniff");
      assert.equal((await other.request.get(endpoint)).status(), 404);
      assert.equal((await anonymous.request.get(endpoint)).status(), 401);
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>';
      assert.equal((await owner.request.put(endpoint, { headers: { origin: base, "content-type": "image/png" }, data: svg })).status(), 400);
      assert.equal((await owner.request.put(endpoint, { headers: { origin: base, "content-type": "image/svg+xml" }, data: svg })).status(), 415);
      assert.equal((await owner.request.put(endpoint, { headers: { origin: base, "content-type": "image/png" }, data: Buffer.alloc(5 * 1024 * 1024 + 1) })).status(), 413);
      const invalid = `${base}/api/personalization/harbor-house/placements/unknown-slot/image`;
      assert.equal((await owner.request.put(invalid, { headers: { origin: base, "content-type": "image/png" }, data: png })).status(), 404);
    });

    await t.test("checkout ignores neither forged totals nor foreign purchaser identities", async () => {
      assert.equal((await owner.request.post(`${base}/api/cart`, { headers: json, data: { designId: design.id, tierId: starter.id, userId: users[1], priceCents: 0 } })).status(), 201);
      const cart = await (await owner.request.get(`${base}/api/cart`)).json();
      assert.equal(cart.totalCents, 10000);
      const headers = { ...json, "idempotency-key": randomUUID() };
      assert.equal((await owner.request.post(`${base}/api/checkout`, { headers, data: { savedDraftTemplates: [], imageRightsConfirmed: false, totalCents: 0, userId: users[1] } })).status(), 400);
      assert.equal((await owner.request.post(`${base}/api/cart/coupon`, { headers: json, data: { code: couponCode } })).status(), 200);
      const choice = { savedDraftTemplates: [], imageRightsConfirmed: false };
      const first = await owner.request.post(`${base}/api/checkout`, { headers, data: choice });
      assert.equal(first.status(), 200, await first.text());
      const second = await owner.request.post(`${base}/api/checkout`, { headers, data: choice });
      assert.equal(second.status(), 200);
      const orders = await db.order.findMany({ where: { userId: users[0], couponCode } });
      assert.equal(orders.length, 1); orderIds.push(orders[0].id);
      assert.equal(orders[0].status, "PAID");
      assert.equal((await db.coupon.findUniqueOrThrow({ where: { code: couponCode } })).redemptions, 1);
      assert.equal(new URL((await second.json()).url, base).pathname, `/account/orders/${orders[0].id}`);
      assert.equal((await owner.request.post(`${base}/api/jobs/maintenance`, { data: {} })).status(), 401);
      assert.equal((await anonymous.request.post(`${base}/api/webhooks/stripe`, { headers: { "stripe-signature": "forged" }, data: { type: "checkout.session.completed" } })).status(), 503);
    });

    await t.test("tampered tokens, disabled accounts and revoked sessions cannot authenticate", async () => {
      const cookies = await owner.cookies();
      const session = cookies.find((cookie) => cookie.name.includes("session-token"));
      assert.ok(session);
      assert.equal(session.httpOnly, true);
      assert.equal(session.secure, true);
      assert.equal(session.sameSite, "Lax");
      const forged = await browser.newContext({ ignoreHTTPSErrors: true });
      await forged.addCookies([{ ...session, value: `${session.value.slice(0, -1)}${session.value.endsWith("A") ? "B" : "A"}` }]);
      assert.equal((await forged.request.get(`${base}/api/favorites`)).status(), 401);
      await forged.close();
      await db.user.update({ where: { id: users[1] }, data: { disabled: true } });
      assert.equal((await other.request.get(`${base}/api/cart`)).status(), 401);
      const oldDevice = await browser.newContext({ ignoreHTTPSErrors: true });
      await login(oldDevice);
      const nextPassword = randomBytes(24).toString("base64url");
      const refused = await owner.request.post(`${base}/api/account/password`, { headers: json, data: { current: password, password: "passwordpassword", confirm: "passwordpassword" } });
      assert.equal(refused.status(), 400);
      assert.match((await refused.json()).fieldErrors.password, /known data breaches/);
      const unavailable = await owner.request.post(`${base}/api/account/password`, { headers: json, data: { current: password, password: "Unavailable fixture password", confirm: "Unavailable fixture password" } });
      assert.equal(unavailable.status(), 503);
      assert.equal((await oldDevice.request.get(`${base}/api/favorites`)).status(), 200);
      const changed = await owner.request.post(`${base}/api/account/password`, { headers: json, data: { current: password, password: nextPassword, confirm: nextPassword } });
      assert.equal(changed.status(), 200);
      assert.equal((await owner.request.get(`${base}/api/favorites`)).status(), 200);
      assert.equal((await oldDevice.request.get(`${base}/api/favorites`)).status(), 401);
      await oldDevice.close();
    });
    await t.test("password reset tokens expire, are single use and revoke existing sessions", async () => {
      const resetPage = await anonymous.newPage();
      const expired = randomBytes(32).toString("base64url");
      await db.verificationToken.create({ data: { email: emails[0], tokenHash: createHash("sha256").update(expired).digest("hex"), type: "RESET_PASSWORD", expiresAt: new Date(Date.now() - 1000) } });
      await resetPage.goto(`${base}/reset-password?token=${expired}`, { waitUntil: "domcontentloaded" });
      await resetPage.getByRole("alert").filter({ hasText: "expired or was already used" }).waitFor();
      const raw = randomBytes(32).toString("base64url"), tokenHash = createHash("sha256").update(raw).digest("hex");
      await db.verificationToken.create({ data: { email: emails[0], tokenHash, type: "RESET_PASSWORD", expiresAt: new Date(Date.now() + 60000) } });
      await resetPage.goto(`${base}/reset-password?token=${raw}`, { waitUntil: "domcontentloaded" });
      const value = randomBytes(24).toString("base64url");
      await resetPage.getByLabel("New password", { exact: true }).fill("passwordpassword");
      await resetPage.getByLabel("Confirm new password", { exact: true }).fill("passwordpassword");
      await resetPage.getByRole("button", { name: "Save new password" }).click();
      await resetPage.getByText("This password appears in known data breaches. Choose a different passphrase.", { exact: true }).waitFor();
      assert.equal(await db.verificationToken.count({ where: { tokenHash } }), 1);
      await resetPage.getByLabel("New password", { exact: true }).fill(value);
      await resetPage.getByLabel("Confirm new password", { exact: true }).fill(value);
      await resetPage.getByRole("button", { name: "Save new password" }).click();
      await resetPage.waitForURL(/\/login\?reset=1/);
      assert.equal(await db.verificationToken.count({ where: { tokenHash } }), 0);
      assert.equal((await owner.request.get(`${base}/api/favorites`)).status(), 401);
      await login(owner, 0, value);
      await resetPage.goto(`${base}/reset-password?token=${raw}`, { waitUntil: "domcontentloaded" });
      await resetPage.getByRole("alert").filter({ hasText: "expired or was already used" }).waitFor();
      await resetPage.close();
    });
    await t.test("administrators enroll MFA, recover once, and retain MFA after password reset", async () => {
      const admin = await browser.newContext({ ignoreHTTPSErrors: true });
      const denied = await browser.newContext({ ignoreHTTPSErrors: true });
      await login(admin, 2);
      assert.equal((await (await admin.request.get(`${base}/api/auth/session`)).json()).user.mfaPending, true);
      assert.equal((await (await admin.request.get(`${base}/api/auth/session`)).json()).user.role, "CLIENT");
      assert.equal((await admin.request.get(`${base}/api/favorites`)).status(), 401);
      assert.equal((await owner.request.post(`${base}/api/account/mfa`, { headers: json, data: { action: "begin", password } })).status(), 403);
      assert.equal((await admin.request.post(`${base}/api/account/mfa`, { headers: { ...json, origin: "https://attacker.example" }, data: { action: "begin", password } })).status(), 403);
      const adminPage = await admin.newPage();
      adminPage.setDefaultTimeout(60000); adminPage.setDefaultNavigationTimeout(90000);
      await adminPage.goto(`${base}/account/security`, { waitUntil: "domcontentloaded" });
      await adminPage.getByLabel("Current password", { exact: true }).fill(password);
      await adminPage.getByRole("button", { name: "Set up authenticator", exact: true }).click();
      const setupKey = await adminPage.getByLabel("Setup key").inputValue();
      await adminPage.getByLabel("New authenticator code").fill(authenticatorCode(setupKey));
      await adminPage.getByRole("button", { name: "Confirm authenticator", exact: true }).click();
      await adminPage.getByRole("list", { name: "Recovery codes" }).waitFor();
      const recovery = await adminPage.getByRole("list", { name: "Recovery codes" }).locator("li").allTextContents();
      assert.equal(recovery.length, 10);
      const factor = await db.mfaCredential.findUniqueOrThrow({ where: { userId: users[2] } });
      assert.ok(!factor.secret.includes(setupKey));
      assert.equal((await admin.request.get(`${base}/api/favorites`)).status(), 401);
      await adminPage.getByRole("link", { name: "Return to sign in" }).click();
      await adminPage.waitForURL(/\/login(?:\?|$)/);
      await adminPage.getByLabel("Email", { exact: true }).fill(emails[2]);
      await adminPage.getByLabel("Password", { exact: true }).fill(password);
      await adminPage.locator("summary").filter({ hasText: "Administrator verification" }).click();
      await adminPage.getByLabel("Authenticator or recovery code", { exact: true }).fill(recovery[0]);
      await adminPage.getByRole("button", { name: "Log in", exact: true }).click();
      await adminPage.waitForURL(/\/account\/security/);
      assert.equal((await (await admin.request.get(`${base}/api/auth/session`)).json()).user.role, "ADMIN");
      assert.equal((await admin.request.get(`${base}/api/favorites`)).status(), 200);
      async function rejectLogin(value, code) {
        const { csrfToken } = await (await denied.request.get(`${base}/api/auth/csrf`)).json();
        await denied.request.post(`${base}/api/auth/callback/credentials`, { form: { csrfToken, email: emails[2], password: value, code, json: "true" } });
        assert.equal((await (await denied.request.get(`${base}/api/auth/session`)).json())?.user, undefined);
      }
      await rejectLogin(password, recovery[0]);
      await rejectLogin(password, "");
      const reset = randomBytes(32).toString("base64url");
      await db.verificationToken.create({ data: { email: emails[2], tokenHash: createHash("sha256").update(reset).digest("hex"), type: "RESET_PASSWORD", expiresAt: new Date(Date.now() + 120000) } });
      await adminPage.goto(`${base}/reset-password?token=${reset}`, { waitUntil: "domcontentloaded" });
      const replacementPassword = randomBytes(24).toString("base64url");
      await adminPage.getByLabel("New password", { exact: true }).fill(replacementPassword);
      await adminPage.getByLabel("Confirm new password", { exact: true }).fill(replacementPassword);
      await adminPage.getByRole("button", { name: "Save new password" }).click();
      await adminPage.waitForURL(/\/login\?reset=1/);
      assert.equal((await db.mfaCredential.findUniqueOrThrow({ where: { userId: users[2] } })).version, 1);
      await rejectLogin(replacementPassword, "");
      await login(admin, 2, replacementPassword, recovery[1]);
      await adminPage.goto(`${base}/account/security`, { waitUntil: "domcontentloaded" });
      await adminPage.getByRole("region", { name: "Administrator verification", exact: true }).getByLabel("Current password", { exact: true }).fill(replacementPassword);
      await adminPage.getByLabel("Current authenticator or recovery code", { exact: true }).fill(recovery[2]);
      await adminPage.getByRole("button", { name: "Replace authenticator", exact: true }).click();
      const nextKey = await adminPage.getByLabel("Setup key").inputValue();
      assert.notEqual(nextKey, setupKey);
      assert.equal((await db.mfaCredential.findUniqueOrThrow({ where: { userId: users[2] } })).secret, factor.secret);
      await adminPage.getByLabel("New authenticator code").fill(authenticatorCode(nextKey));
      await adminPage.getByRole("button", { name: "Confirm authenticator", exact: true }).click();
      await adminPage.getByRole("list", { name: "Recovery codes" }).waitFor();
      const nextRecovery = await adminPage.getByRole("list", { name: "Recovery codes" }).locator("li").allTextContents();
      assert.equal((await admin.request.get(`${base}/api/favorites`)).status(), 401);
      await rejectLogin(replacementPassword, recovery[3]);
      await login(admin, 2, replacementPassword, nextRecovery[0]);
      assert.equal((await admin.request.get(`${base}/api/favorites`)).status(), 200);
      await adminPage.close(); await admin.close(); await denied.close();
    });
    assert.deepEqual(errors, [], "No browser exceptions during malicious-input tests");
  } finally {
    await browser?.close();
    tlsProxy?.closeAllConnections();
    await new Promise((resolve) => tlsProxy ? tlsProxy.close(resolve) : resolve());
    attacker?.closeAllConnections();
    await new Promise((resolve) => attacker ? attacker.close(resolve) : resolve());
    if (server && server.exitCode === null) await new Promise((resolve) => {
      server.once("exit", resolve);
      if (!server.kill()) resolve();
    });
    serverLog?.end();
    try {
      await db.checkoutRequest.deleteMany({ where: { userId: { in: users } } });
      await db.order.deleteMany({ where: { userId: { in: users } } });
      await db.verificationToken.deleteMany({ where: { email: { in: [...emails, signupEmail] } } });
      await db.user.deleteMany({ where: { id: { in: users } } });
      await db.user.deleteMany({ where: { email: { in: [`${prefix}-registration@example.test`, signupEmail] } } });
      await db.design.deleteMany({ where: { id: prefix } });
      await db.category.deleteMany({ where: { id: prefix } });
      await db.coupon.deleteMany({ where: { code: couponCode } });
      await unlink(`storage/${fileKey}`).catch(() => {});
      await unlink(`storage/security/${prefix}-key.pem`).catch(() => {});
      await unlink(`storage/security/${prefix}-cert.pem`).catch(() => {});
    } finally { await db.$disconnect(); }
  }
});
