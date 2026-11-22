import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { PrismaClient } from "@prisma/client";
import { strFromU8, unzipSync } from "fflate";
import sharp from "sharp";
import { phase3Exports } from "./helpers/phase3-exports.mjs";
import { sourceArchive } from "./helpers/template-release.mjs";
import { stripeFixture } from "./helpers/commerce.mjs";
import { prepareCheckout } from "../src/lib/checkout.ts";
import { continueCheckout } from "../src/lib/checkout-payment.ts";
import { syncCheckoutSession } from "../src/lib/stripe-orders.ts";
import { markOrderRefunded } from "../src/lib/orders.ts";
import { deliverPurchases } from "../src/lib/personalization/delivery.ts";
import { registerTemplateRelease, getPurchasedDownload } from "../src/lib/personalization/purchases.ts";
import { LOCAL_ROOT, verifyPurchaseArtifact } from "../src/lib/storage.ts";

const url = process.env.TEST_DATABASE_URL;
if (url && (url === process.env.DATABASE_URL || !new URL(url).pathname.includes("_test"))) throw new Error("Use only the isolated _test database");
test("all six Phase 3 templates use durable purchaser-scoped delivery", { skip: !url && "Run npm run test:database" }, async t => {
  const db = new PrismaClient({ datasources: { db: { url } } });
  const prefix = `phase3-${randomUUID()}`;
  const users = [`${prefix}-alice`, `${prefix}-bob`];
  const templates = phase3Exports.map(item => item.template);
  const previousActive = await db.activeTemplateRelease.findMany({ where: { template: { in: templates } } });
  const designs = []; const releases = [];
  t.after(async () => {
    try {
      await db.checkoutRequest.deleteMany({ where: { userId: { in: users } } });
      await db.order.deleteMany({ where: { userId: { in: users } } });
      await db.user.deleteMany({ where: { id: { in: users } } });
      await db.design.deleteMany({ where: { id: { in: designs } } });
      await db.category.deleteMany({ where: { id: prefix } });
      for (const template of templates) {
        const previous = previousActive.find(item => item.template === template);
        if (previous) await db.activeTemplateRelease.upsert({ where: { template }, create: previous, update: { releaseId: previous.releaseId } });
        else await db.activeTemplateRelease.deleteMany({ where: { template } });
      }
      await db.templateRelease.deleteMany({ where: { sha256: { in: releases }, purchases: { none: {} }, active: { none: {} } } });
    } finally { await db.$disconnect(); }
  });
  await db.category.create({ data: { id: prefix, name: prefix, slug: prefix } });
  await db.user.createMany({ data: users.map(id => ({ id, email: `${id}@example.test`, emailVerified: new Date() })) });
  const image = await sharp({ create: { width: 12, height: 12, channels: 3, background: "#123456" } }).webp().toBuffer();
  const stripe = stripeFixture();
  for (const scenario of phase3Exports) await t.test(scenario.template, async () => {
    const template = scenario.template;
    let design = await db.design.findUnique({ where: { slug: template }, include: { tiers: true } });
    if (!design) {
      design = await db.design.create({ data: { slug: template, title: scenario.title, summary: "Test", description: "Test", status: "PUBLISHED",
        categoryId: prefix, heroImage: "/test.webp", deliverables: [],
        tiers: { create: { level: "STARTER", name: "Starter", priceCents: 10000, inclusions: [] } },
      }, include: { tiers: true } });
      designs.push(design.id);
    }
    const release = await registerTemplateRelease(template, sourceArchive(template, prefix), db);
    releases.push(release);
    const photos = JSON.parse(await readFile(`src/templates/${template}/photos.json`, "utf8"));
    const images = [...Object.keys(photos).map(key => `photo:${key}`), ...(scenario.extraAssets ?? [])].map(slot => ({ slot, image }));
    await db.personalizationDraft.create({ data: { userId: users[0], template, content: scenario.draft, heroImage: image, images: { createMany: { data: images } } } });
    await db.personalizationDraft.create({ data: { userId: users[1], template, content: { ...scenario.draft, business: { name: "Other owner's private content" } } } });
    await db.cartItem.create({ data: { userId: users[0], designId: design.id, tierId: design.tiers[0].id, addonIds: [] } });
    const key = randomUUID();
    const order = await prepareCheckout(users[0], key, null, true, db, [template], true);
    const item = await db.orderItem.findFirstOrThrow({ where: { orderId: order.id } });
    assert.equal(await getPurchasedDownload(users[0], item.id, db), null);
    await db.personalizationDraft.deleteMany({ where: { userId: users[0], template } });
    releases.push(await registerTemplateRelease(template, sourceArchive(template, `${prefix}-new`), db));
    assert.equal((await prepareCheckout(users[0], key, null, true, db, [template], true)).id, order.id);
    await continueCheckout(order, db, stripe.gateway);
    const session = stripe.sessions.get(`checkout-${order.id}`);
    session.payment_status = "paid"; session.status = "complete";
    await syncCheckoutSession(session, db, stripe.gateway);
    assert.deepEqual(await deliverPurchases(db, undefined, 1), { ready: 1, failed: 0 });
    const download = await getPurchasedDownload(users[0], item.id, db);
    assert.equal(download.status, "ready");
    assert.equal(await getPurchasedDownload(users[1], item.id, db), null);
    const bytes = await readFile(path.join(LOCAL_ROOT, download.storageKey));
    assert.equal(verifyPurchaseArtifact(download.storageKey, bytes), true);
    const files = unzipSync(bytes);
    const content = JSON.parse(strFromU8(files[`${template}/src/app/personalized.json`]));
    for (const [field, value] of Object.entries(scenario.overrides)) assert.deepEqual(content[field], value);
    assert.equal(content.business.name, scenario.draft.business.name);
    const manifest = JSON.parse(strFromU8(files[`${template}/baybloom-export.json`]));
    assert.equal(manifest.sourceSha256, release);
    assert.equal(Object.keys(manifest.assets).length, images.length + 1);
    for (const key of Object.keys(photos)) assert.equal(content[scenario.property][key], `/personalized/photos/${key}.webp`);
    assert.equal((await prepareCheckout(users[0], key, null, true, db, [template], true)).id, order.id);
    await markOrderRefunded(order.id, db);
    assert.equal(await getPurchasedDownload(users[0], item.id, db), null);
  });
});
