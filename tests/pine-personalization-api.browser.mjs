import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { createServer } from "node:net";
import { mkdir, writeFile } from "node:fs/promises";
import { test } from "node:test";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { request } from "playwright-core";
import sharp from "sharp";
import { testDatabaseConfig } from "../scripts/personalization-test-config.mjs";

test("Template photos are private, validated, saved and removed", { timeout: 180_000 }, async () => {
  const { target, direct } = testDatabaseConfig();
  const socket = createServer();
  await new Promise((resolve, reject) => { socket.once("error", reject); socket.listen(0, "127.0.0.1", resolve); });
  const port = socket.address().port;
  await new Promise((resolve, reject) => socket.close((error) => error ? reject(error) : resolve()));
  const base = `http://127.0.0.1:${port}`;
  const db = new PrismaClient({ datasources: { db: { url: target } } });
  const ids = [randomUUID(), randomUUID()];
  const emails = ids.map((id) => `pine-${id}@example.test`);
  const password = randomBytes(24).toString("base64url");
  const ip = `198.18.${randomBytes(1)[0]}.${randomBytes(1)[0]}`;
  const clients = [];
  let server;
  try {
    await mkdir(".next/personalization-e2e-config", { recursive: true });
    await writeFile(".next/personalization-e2e-config/tsconfig.json", JSON.stringify({ extends: "../../tsconfig.json", include: ["../../next-env.d.ts", "../../src/**/*.ts", "../../src/**/*.tsx", "../personalization-e2e/types/**/*.ts", "../personalization-e2e/dev/types/**/*.ts"], exclude: ["../../node_modules"] }, null, 2));
    const passwordHash = await bcrypt.hash(password, 10);
    await db.user.createMany({ data: ids.map((id, i) => ({ id, email: emails[i], passwordHash, emailVerified: new Date() })) });
    const env = { ...process.env, BAYBLOOM_PERSONALIZATION_TEST: "1", DATABASE_URL: target, DIRECT_URL: direct, AUTH_SECRET: randomBytes(32).toString("base64url"), AUTH_URL: base, NEXT_PUBLIC_SITE_URL: base, AUTH_GOOGLE_ID: "", AUTH_GOOGLE_SECRET: "", STRIPE_SECRET_KEY: "", S3_ENDPOINT: "", S3_BUCKET: "", S3_ACCESS_KEY: "", S3_SECRET_KEY: "" };
    server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", String(port)], { env, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
    server.stdout.resume(); server.stderr.resume();
    const deadline = Date.now() + 120_000;
    while (true) {
      if (server.exitCode !== null) throw new Error(`Test server exited with code ${server.exitCode}`);
      try { if ((await fetch(`${base}/api/auth/csrf`)).ok) break; } catch { /* starting */ }
      if (Date.now() > deadline) throw new Error("Test server did not become ready");
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    for (const email of emails) {
      const client = await request.newContext({ extraHTTPHeaders: { "x-forwarded-for": ip } }); clients.push(client);
      const { csrfToken } = await (await client.get(`${base}/api/auth/csrf`)).json();
      const login = await client.post(`${base}/api/auth/callback/credentials`, { form: { csrfToken, email, password, callbackUrl: base, json: "true" } });
      assert.equal(login.ok(), true);
      assert.equal((await (await client.get(`${base}/api/auth/session`)).json()).user.email, email);
    }
    const [owner, other] = clients;
    const draft = { version: 1, template: "pine-ridge-lodge", business: {}, home: {}, theme: {}, pineRooms: { "trapper-twin": { name: "Forest Room" } } };
    assert.equal((await owner.put(`${base}/api/personalization/pine-ridge-lodge`, { headers: { origin: base }, data: { draft, photo: { action: "keep" } } })).status(), 200);
    const image = await sharp({ create: { width: 20, height: 20, channels: 3, background: "#789456" } }).png().toBuffer();
    const url = `${base}/api/personalization/pine-ridge-lodge/photos/twin-room/image`;
    assert.equal((await owner.put(url, { headers: { origin: base, "content-type": "image/png" }, data: image })).status(), 200);
    assert.equal((await owner.get(url)).status(), 200);
    assert.equal((await other.get(url)).status(), 404);
    const loaded = await (await owner.get(`${base}/api/personalization/pine-ridge-lodge`)).json();
    assert.equal(loaded.draft.pineRooms["trapper-twin"].name, "Forest Room");
    assert.ok(loaded.photos.some((item) => item.slot === "twin-room"));
    assert.equal((await owner.put(url, { headers: { origin: base, "content-type": "image/png" }, data: Buffer.from("invalid") })).status(), 400);
    assert.equal((await owner.put(url, { headers: { origin: "https://elsewhere.invalid", "content-type": "image/png" }, data: image })).status(), 403);
    assert.equal((await owner.get(`${base}/api/personalization/pine-ridge-lodge/photos/invalid/image`)).status(), 404);
    assert.equal((await owner.delete(url, { headers: { origin: base } })).status(), 200);
    assert.equal((await owner.get(url)).status(), 404);
    const lumenDraft = { version: 1, template: "lumen-lake-villas", business: {}, home: {}, theme: {}, lumenVillas: { "shore-villa": { name: "Lake Suite", price: 4500 } } };
    assert.equal((await owner.put(`${base}/api/personalization/lumen-lake-villas`, { headers: { origin: base }, data: { draft: lumenDraft, photo: { action: "keep" } } })).status(), 200);
    const lumenUrl = `${base}/api/personalization/lumen-lake-villas/photos/villas/image`;
    assert.equal((await owner.put(lumenUrl, { headers: { origin: base, "content-type": "image/png" }, data: image })).status(), 200);
    assert.equal((await owner.get(lumenUrl)).status(), 200);
    assert.equal((await other.get(lumenUrl)).status(), 404);
    const lumenLoaded = await (await owner.get(`${base}/api/personalization/lumen-lake-villas`)).json();
    assert.equal(lumenLoaded.draft.lumenVillas["shore-villa"].name, "Lake Suite");
    assert.ok(lumenLoaded.photos.some((item) => item.slot === "villas"));
    assert.equal((await owner.put(lumenUrl, { headers: { origin: base, "content-type": "image/png" }, data: Buffer.from("invalid") })).status(), 400);
    assert.equal((await owner.put(lumenUrl, { headers: { origin: "https://elsewhere.invalid", "content-type": "image/png" }, data: image })).status(), 403);
    assert.equal((await owner.get(`${base}/api/personalization/lumen-lake-villas/photos/invalid/image`)).status(), 404);
    assert.equal((await owner.delete(lumenUrl, { headers: { origin: base } })).status(), 200);
    assert.equal((await owner.get(lumenUrl)).status(), 404);
    const islaDraft = { version: 1, template: "isla-verde-boutique", business: {}, home: {}, theme: {}, islaRooms: { "casa-room": { name: "Garden Room", price: 8500 } } };
    assert.equal((await owner.put(`${base}/api/personalization/isla-verde-boutique`, { headers: { origin: base }, data: { draft: islaDraft, photo: { action: "keep" } } })).status(), 200);
    const islaUrl = `${base}/api/personalization/isla-verde-boutique/photos/carved-bed/image`;
    assert.equal((await owner.put(islaUrl, { headers: { origin: base, "content-type": "image/png" }, data: image })).status(), 200);
    assert.equal((await owner.get(islaUrl)).status(), 200);
    assert.equal((await other.get(islaUrl)).status(), 404);
    const islaLoaded = await (await owner.get(`${base}/api/personalization/isla-verde-boutique`)).json();
    assert.equal(islaLoaded.draft.islaRooms["casa-room"].name, "Garden Room");
    assert.ok(islaLoaded.photos.some((item) => item.slot === "carved-bed"));
    assert.equal((await owner.put(islaUrl, { headers: { origin: base, "content-type": "image/png" }, data: Buffer.from("invalid") })).status(), 400);
    assert.equal((await owner.put(islaUrl, { headers: { origin: "https://elsewhere.invalid", "content-type": "image/png" }, data: image })).status(), 403);
    assert.equal((await owner.get(`${base}/api/personalization/isla-verde-boutique/photos/invalid/image`)).status(), 404);
    assert.equal((await owner.delete(islaUrl, { headers: { origin: base } })).status(), 200);
    assert.equal((await owner.get(islaUrl)).status(), 404);
    const emberDraft = { version: 1, template: "ember-and-salt", business: {}, home: {}, theme: {}, emberDishes: { "dinner:0:0": { name: "Garden plate", diet: [] } } };
    assert.equal((await owner.put(`${base}/api/personalization/ember-and-salt`, { headers: { origin: base }, data: { draft: emberDraft, photo: { action: "keep" } } })).status(), 200);
    const emberUrl = `${base}/api/personalization/ember-and-salt/photos/room/image`;
    assert.equal((await owner.put(emberUrl, { headers: { origin: base, "content-type": "image/png" }, data: image })).status(), 200);
    assert.equal((await owner.get(emberUrl)).status(), 200);
    assert.equal((await other.get(emberUrl)).status(), 404);
    const emberLoaded = await (await owner.get(`${base}/api/personalization/ember-and-salt`)).json();
    assert.equal(emberLoaded.draft.emberDishes["dinner:0:0"].name, "Garden plate");
    assert.ok(emberLoaded.photos.some((item) => item.slot === "room"));
    assert.equal((await owner.put(emberUrl, { headers: { origin: base, "content-type": "image/png" }, data: Buffer.from("invalid") })).status(), 400);
    assert.equal((await owner.put(emberUrl, { headers: { origin: "https://elsewhere.invalid", "content-type": "image/png" }, data: image })).status(), 403);
    assert.equal((await owner.get(`${base}/api/personalization/ember-and-salt/photos/invalid/image`)).status(), 404);
    assert.equal((await owner.delete(emberUrl, { headers: { origin: base } })).status(), 200);
    assert.equal((await owner.get(emberUrl)).status(), 404);
    const spaDraft = { version: 1, template: "still-water-spa", business: {}, home: {}, theme: {}, spaCopy: { "Rest is a practice.": "Rest with us." } };
    assert.equal((await owner.put(`${base}/api/personalization/still-water-spa`, { headers: { origin: base }, data: { draft: spaDraft, photo: { action: "keep" } } })).status(), 200);
    const spaUrl = `${base}/api/personalization/still-water-spa/photos/room/image`;
    assert.equal((await owner.put(spaUrl, { headers: { origin: base, "content-type": "image/png" }, data: image })).status(), 200);
    assert.equal((await owner.get(spaUrl)).status(), 200);
    assert.equal((await other.get(spaUrl)).status(), 404);
    const spaLoaded = await (await owner.get(`${base}/api/personalization/still-water-spa`)).json();
    assert.ok(spaLoaded.photos.some(item => item.slot === "room"));
    assert.equal(spaLoaded.draft.spaCopy["Rest is a practice."], "Rest with us.");
    assert.equal((await owner.put(spaUrl, { headers: { origin: base, "content-type": "image/png" }, data: Buffer.from("invalid") })).status(), 400);
    assert.equal((await owner.put(spaUrl, { headers: { origin: "https://elsewhere.invalid", "content-type": "image/png" }, data: image })).status(), 403);
    assert.equal((await owner.get(`${base}/api/personalization/still-water-spa/photos/invalid/image`)).status(), 404);
    assert.equal((await owner.delete(spaUrl, { headers: { origin: base } })).status(), 200);
    assert.equal((await owner.get(spaUrl)).status(), 404);
    const bloomDraft = { version: 1, template: "bloomfield-gardens", business: {}, home: {}, theme: {}, bloomSpaces: { "the-lawn": { name: "Garden Lawn", ceremony: 120 } } };
    assert.equal((await owner.put(`${base}/api/personalization/bloomfield-gardens`, { headers: { origin: base }, data: { draft: bloomDraft, photo: { action: "keep" } } })).status(), 200);
    const bloomUrl = `${base}/api/personalization/bloomfield-gardens/photos/lawn/image`;
    assert.equal((await owner.put(bloomUrl, { headers: { origin: base, "content-type": "image/png" }, data: image })).status(), 200);
    assert.equal((await owner.get(bloomUrl)).status(), 200);
    assert.equal((await other.get(bloomUrl)).status(), 404);
    const bloomLoaded = await (await owner.get(`${base}/api/personalization/bloomfield-gardens`)).json();
    assert.equal(bloomLoaded.draft.bloomSpaces["the-lawn"].name, "Garden Lawn");
    assert.ok(bloomLoaded.photos.some(item => item.slot === "lawn"));
    assert.equal((await owner.put(bloomUrl, { headers: { origin: base, "content-type": "image/png" }, data: Buffer.from("invalid") })).status(), 400);
    assert.equal((await owner.put(bloomUrl, { headers: { origin: "https://elsewhere.invalid", "content-type": "image/png" }, data: image })).status(), 403);
    assert.equal((await owner.get(`${base}/api/personalization/bloomfield-gardens/photos/invalid/image`)).status(), 404);
    assert.equal((await owner.delete(bloomUrl, { headers: { origin: base } })).status(), 200);
    assert.equal((await owner.get(bloomUrl)).status(), 404);
    for (const [template, slot, field] of [["harbor-house", "breakfast", "housePhotoAlt"], ["coral-cove", "reef-fish", "coralPhotoAlt"]]) {
      const draft = { version: 1, template, business: {}, home: {}, theme: {}, [field]: { [slot]: "Private website photo" } };
      assert.equal((await owner.put(`${base}/api/personalization/${template}`, { headers: { origin: base }, data: { draft, photo: { action: "keep" } } })).status(), 200);
      const photoUrl = `${base}/api/personalization/${template}/photos/${slot}/image`;
      assert.equal((await owner.put(photoUrl, { headers: { origin: base, "content-type": "image/png" }, data: image })).status(), 200);
      assert.equal((await owner.get(photoUrl)).status(), 200);
      assert.equal((await other.get(photoUrl)).status(), 404);
      const loaded = await (await owner.get(`${base}/api/personalization/${template}`)).json();
      assert.equal(loaded.draft[field][slot], "Private website photo");
      assert.ok(loaded.photos.some(item => item.slot === slot));
      assert.equal((await owner.put(photoUrl, { headers: { origin: base, "content-type": "image/png" }, data: Buffer.from("invalid") })).status(), 400);
      assert.equal((await owner.put(photoUrl, { headers: { origin: "https://elsewhere.invalid", "content-type": "image/png" }, data: image })).status(), 403);
      assert.equal((await owner.get(`${base}/api/personalization/${template}/photos/invalid/image`)).status(), 404);
      assert.equal((await owner.delete(photoUrl, { headers: { origin: base } })).status(), 200);
      assert.equal((await owner.get(photoUrl)).status(), 404);
    }
  } finally {
    await Promise.all(clients.map((client) => client.dispose()));
    if (server?.pid && server.exitCode === null) {
      if (process.platform === "win32") spawnSync("taskkill", ["/PID", String(server.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
      else server.kill("SIGTERM");
    }
    const keys = [`login:ip:${ip}`, ...emails.map((email) => `login:email:${email}`), ...ids.flatMap((id) => [`personalization:${id}`, `personalization-pine-photo:${id}`, `personalization-lumen-photo:${id}`, `personalization-isla-photo:${id}`, `personalization-ember-photo:${id}`, `personalization-spa-photo:${id}`, `personalization-bloom-photo:${id}`, `personalization-house-photo:${id}`, `personalization-coral-photo:${id}`])].map((key) => createHash("sha256").update(key).digest("hex"));
    try { await db.user.deleteMany({ where: { id: { in: ids } } }); await db.rateLimitBucket.deleteMany({ where: { key: { in: keys } } }); }
    finally { await db.$disconnect(); }
  }
});
