import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { PrismaClient } from "@prisma/client";
import { strFromU8, unzipSync } from "fflate";
import sharp from "sharp";
import { prepareCheckout } from "../src/lib/checkout.ts";
import { fulfillOrder, markOrderRefunded } from "../src/lib/orders.ts";
import { syncCheckoutSession } from "../src/lib/stripe-orders.ts";
import { getDownloadsForOrder, authorizeDownload } from "../src/lib/deliverables.ts";
import { registerTemplateRelease, getPurchasedDownload, PURCHASE_SOURCE_FILE } from "../src/lib/personalization/purchases.ts";
import { deliverPurchases } from "../src/lib/personalization/delivery.ts";
import { packageTemplateSnapshot } from "../src/lib/personalization/export.ts";
import { emptyDraft } from "../src/lib/personalization/harbor-draft.ts";
import { sourceArchive } from "./helpers/template-release.mjs";
import { stripeFixture } from "./helpers/commerce.mjs";
import { LOCAL_ROOT, verifyPurchaseArtifact } from "../src/lib/storage.ts";

const url = process.env.TEST_DATABASE_URL;
if (url && (url === process.env.DATABASE_URL || !new URL(url).pathname.includes("_test"))) throw new Error("Use only the isolated _test database");

test("durable purchases and delivery use only isolated PostgreSQL", { skip: !url && "Run npm run test:database" }, async t => {
  const db = new PrismaClient({ datasources: { db: { url } } });
  const prefix = `purchase-${randomUUID()}`;
  const users = [`${prefix}-alice`, `${prefix}-bob`];
  const templates = ["harbor-house", "bloomfield-gardens"];
  const designs = new Map();
  const priorActive = await db.activeTemplateRelease.findMany({ where: { template: { in: templates } } });
  const newReleases = [];
  const createdDesigns = [];
  const image = await sharp({ create: { width: 12, height: 12, channels: 3, background: "#56789a" } }).webp().toBuffer();
  t.after(async () => {
    try {
      await db.checkoutRequest.deleteMany({ where: { userId: { in: users } } });
      await db.order.deleteMany({ where: { userId: { in: users } } });
      await db.user.deleteMany({ where: { id: { in: users } } });
      await db.design.deleteMany({ where: { id: { in: createdDesigns } } });
      await db.category.deleteMany({ where: { id: prefix } });
      for (const template of templates) {
        const previous = priorActive.find(row => row.template === template);
        if (previous) await db.activeTemplateRelease.upsert({ where: { template }, create: previous, update: { releaseId: previous.releaseId } });
        else await db.activeTemplateRelease.deleteMany({ where: { template } });
      }
      await db.templateRelease.deleteMany({ where: { sha256: { in: newReleases }, purchases: { none: {} }, active: { none: {} } } });
    } finally { await db.$disconnect(); }
  });
  await db.user.createMany({ data: users.map(id => ({ id, email: `${id}@example.test`, emailVerified: new Date() })) });
  await db.category.create({ data: { id: prefix, name: prefix, slug: prefix } });
  for (const template of templates) {
    let design = await db.design.findUnique({ where: { slug: template }, include: { tiers: true } });
    if (!design) {
      design = await db.design.create({ data: { slug: template, title: template, summary: "Test", description: "Test",
        status: "PUBLISHED", categoryId: prefix, heroImage: "/test.webp", deliverables: [],
        tiers: { create: { level: "STARTER", name: "Starter", priceCents: 10000, inclusions: [] } },
      }, include: { tiers: true } });
      createdDesigns.push(design.id);
    }
    designs.set(template, design);
    const archive = sourceArchive(template, prefix);
    newReleases.push(await registerTemplateRelease(template, archive, db));
    await db.cartItem.create({ data: { userId: users[0], designId: design.id, tierId: design.tiers[0].id, addonIds: [] } });
    await db.personalizationDraft.create({ data: { userId: users[0], template, content: {
      ...emptyDraft(template), business: { name: `Purchased ${template}` }, home: { headline: "Frozen at checkout" },
    }, heroImage: image, images: { create: { slot: template === "harbor-house" ? "photo:breakfast" : "photo:lawn", image } } } });
    await db.personalizationDraft.create({ data: { userId: users[1], template, content: { ...emptyDraft(template), business: { name: "Other owner" } }, heroImage: null } });
  }

  let order;
  let items;
  await t.test("concurrent checkout tabs capture one immutable order with owned content and sources", async () => {
    const results = await Promise.all(Array.from({ length: 3 }, () => prepareCheckout(users[0], randomUUID(), null, true, db, templates, true)));
    assert.equal(new Set(results.map(row => row.id)).size, 1);
    order = results[0];
    items = await db.orderItem.findMany({ where: { orderId: order.id }, include: { personalization: { include: { images: true } }, delivery: true } });
    assert.equal(items.length, 2);
    for (const item of items) {
      assert.equal(item.personalization.content.business.name, `Purchased ${item.personalization.template}`);
      assert.deepEqual(item.personalization.heroImage, new Uint8Array(image));
      assert.equal(item.personalization.images.length, 1);
      assert.ok(item.personalization.imageRightsConfirmedAt);
      assert.equal(item.delivery.attempts, 0);
      assert.equal(await getPurchasedDownload(users[0], item.id, db), null);
    }
    assert.deepEqual(await deliverPurchases(db), { ready: 0, failed: 0 });
  });

  await t.test("source replacement and draft deletion cannot change a retry or existing snapshot", async () => {
    const retryKey = randomUUID();
    await prepareCheckout(users[0], retryKey, null, true, db, templates, true);
    await db.personalizationDraft.deleteMany({ where: { userId: users[0] } });
    for (const template of templates) newReleases.push(await registerTemplateRelease(template, sourceArchive(template, `${prefix}-new`), db));
    assert.equal((await prepareCheckout(users[0], retryKey, null, true, db, templates, true)).id, order.id);
    const original = await prepareCheckout(users[0], randomUUID(), null, true, db);
    assert.notEqual(original.id, order.id);
    const rows = await db.orderPersonalization.findMany({ where: { orderItem: { orderId: original.id } } });
    assert.ok(rows.every(row => row.mode === "ORIGINAL"));
    assert.ok(rows.every(row => row.sourceReleaseId !== items.find(item => item.personalization.template === row.template).personalization.sourceReleaseId));
  });

  await t.test("retained sources and captured purchase data reject in-place updates", async () => {
    const saved = items[0].personalization;
    await assert.rejects(db.templateRelease.update({ where: { sha256: saved.sourceReleaseId }, data: { archive: Uint8Array.of(1) } }), /immutable/);
    await assert.rejects(db.templateRelease.delete({ where: { sha256: saved.sourceReleaseId } }), /foreign key/i);
    await assert.rejects(db.orderPersonalization.update({ where: { orderItemId: items[0].id }, data: { content: {} } }), /immutable/);
    await assert.rejects(db.orderPersonalizationImage.update({ where: { id: saved.images[0].id }, data: { image: Uint8Array.of(1) } }), /immutable/);
  });

  await t.test("verified payment events queue delivery once and independent workers publish each artifact once", async () => {
    // A corrupt/missing optimization must fall back to the retained database source.
    await writeFile(path.join(LOCAL_ROOT, "purchases/releases", `${items[0].personalization.sourceReleaseId}.zip`), "corrupt cache");
    const stripe = stripeFixture();
    const session = await stripe.gateway.checkout.sessions.create(order.checkoutParameters, { idempotencyKey: `checkout-${order.id}` });
    session.payment_status = "paid";
    session.status = "complete";
    await Promise.all([syncCheckoutSession(session, db, stripe.gateway), syncCheckoutSession(session, db, stripe.gateway)]);
    const results = await Promise.all([deliverPurchases(db), deliverPurchases(db)]);
    assert.equal(results.reduce((count, result) => count + result.ready, 0), 2);
    for (const item of items) {
      const download = await getPurchasedDownload(users[0], item.id, db);
      assert.equal(download.status, "ready");
      assert.equal(await getPurchasedDownload(users[1], item.id, db), null);
      const template = item.personalization.template;
      const bytes = await readFile(path.join(LOCAL_ROOT, download.storageKey));
      assert.equal(verifyPurchaseArtifact(download.storageKey, bytes), true);
      const files = unzipSync(bytes);
      const content = JSON.parse(strFromU8(files[`${template}/src/app/personalized.json`]));
      assert.equal(content.home.headline, "Frozen at checkout");
      assert.equal(content.business.name, `Purchased ${template}`);
      assert.deepEqual(files[`${template}/public/personalized/hero.webp`], new Uint8Array(image));
      const manifest = JSON.parse(strFromU8(files[`${template}/baybloom-export.json`]));
      assert.equal(manifest.sourceSha256, item.personalization.sourceReleaseId);
      assert.equal((await db.orderDelivery.findUniqueOrThrow({ where: { orderItemId: item.id } })).attempts, 1);
    }
    assert.deepEqual(await deliverPurchases(db), { ready: 0, failed: 0 });
    const listings = await getDownloadsForOrder(users[0], order.id, db);
    assert.ok(items.every(item => listings[item.id].some(file => file.id === PURCHASE_SOURCE_FILE && file.status === "ready")));
    assert.deepEqual(await getDownloadsForOrder(users[1], order.id, db), {});
  });

  await t.test("generated artifacts detect corruption and refunded orders lose all download access", async () => {
    const item = items[0];
    const download = await getPurchasedDownload(users[0], item.id, db);
    const artifact = await readFile(path.join(LOCAL_ROOT, download.storageKey));
    await writeFile(path.join(LOCAL_ROOT, download.storageKey), "corrupt artifact");
    assert.equal(verifyPurchaseArtifact(download.storageKey, await readFile(path.join(LOCAL_ROOT, download.storageKey))), false);
    await writeFile(path.join(LOCAL_ROOT, download.storageKey), artifact);
    await db.orderDelivery.update({ where: { orderItemId: item.id }, data: { artifactStorageKey: "purchases/artifacts/incorrect.zip" } });
    await assert.rejects(getPurchasedDownload(users[0], item.id, db), /integrity/);
    await db.orderDelivery.update({ where: { orderItemId: item.id }, data: { artifactStorageKey: download.storageKey } });
    await markOrderRefunded(order.id, db);
    await fulfillOrder(order.id, null, db);
    assert.equal(await getPurchasedDownload(users[0], item.id, db), null);
    assert.deepEqual(await getDownloadsForOrder(users[0], order.id, db), {});
  });

  await t.test("failed packages back off, crashed leases recover, and stale workers cannot overwrite a reclaimed job", async () => {
    // Fulfill the original-content order prepared after the release switch.
    const original = await db.order.findFirstOrThrow({ where: { userId: users[0], status: "PENDING" } });
    await fulfillOrder(original.id, null, db);
    assert.equal((await deliverPurchases(db, undefined, 1, async () => { throw new Error("private storage unavailable"); })).failed, 1);
    const failed = await db.orderDelivery.findFirstOrThrow({ where: { lastError: { not: null }, orderItem: { orderId: original.id } } });
    assert.equal(failed.attempts, 1);
    assert.ok(failed.nextAt > new Date());
    await db.orderDelivery.updateMany({ where: { orderItem: { orderId: original.id } }, data: { nextAt: new Date(Date.now() + 60_000) } });
    await db.orderDelivery.update({ where: { orderItemId: failed.orderItemId }, data: { nextAt: new Date(0), leaseUntil: new Date(Date.now() + 60_000) } });
    assert.deepEqual(await deliverPurchases(db), { ready: 0, failed: 0 });
    await db.orderDelivery.update({ where: { orderItemId: failed.orderItemId }, data: { leaseUntil: new Date(0) } });
    const stale = await deliverPurchases(db, async (archive, snapshot) => {
      await db.orderDelivery.update({ where: { orderItemId: failed.orderItemId }, data: { leaseToken: "replacement-worker", leaseUntil: new Date(0) } });
      return packageTemplateSnapshot(archive, snapshot);
    }, 1);
    assert.equal(stale.ready, 0);
    assert.equal((await db.orderDelivery.findUniqueOrThrow({ where: { orderItemId: failed.orderItemId } })).artifactStorageKey, null);
    assert.equal((await deliverPurchases(db, undefined, 1)).ready, 1);
    const remaining = await db.orderDelivery.findFirstOrThrow({ where: { readyAt: null, orderItem: { orderId: original.id } } });
    await db.orderDelivery.update({ where: { orderItemId: remaining.orderItemId }, data: { attempts: 7, nextAt: new Date(0) } });
    await deliverPurchases(db, () => { throw new Error("permanent failure"); }, 1);
    const exhausted = await db.orderDelivery.findUniqueOrThrow({ where: { orderItemId: remaining.orderItemId } });
    assert.equal(exhausted.attempts, 8);
    assert.equal(exhausted.nextAt, null);
    assert.equal((await getPurchasedDownload(users[0], remaining.orderItemId, db)).status, "unavailable");
    assert.deepEqual(await deliverPurchases(db), { ready: 0, failed: 0 });
  });

  await t.test("refund during packaging prevents publishing and no mutable source fallback is authorized", async () => {
    await db.cartItem.createMany({ data: [...designs.values()].map(design => ({ userId: users[0], designId: design.id, tierId: design.tiers[0].id, addonIds: [] })) });
    const pending = await prepareCheckout(users[0], randomUUID(), null, true, db);
    await fulfillOrder(pending.id, null, db);
    const row = await db.orderItem.findFirstOrThrow({ where: { orderId: pending.id } });
    const file = await db.deliverableFile.create({ data: { designId: row.designId, name: "Source", storageKey: "deliverables/test-source.zip" } });
    try {
      assert.equal(await authorizeDownload(users[0], row.id, file.id, db), null);
      const result = await deliverPurchases(db, async (archive, snapshot) => { await markOrderRefunded(pending.id, db); return packageTemplateSnapshot(archive, snapshot); }, 1);
      assert.equal(result.ready, 0);
      assert.equal(await getPurchasedDownload(users[0], row.id, db), null);
      assert.deepEqual(await deliverPurchases(db), { ready: 0, failed: 0 });
    } finally { await db.deliverableFile.delete({ where: { id: file.id } }); }
  });
});
