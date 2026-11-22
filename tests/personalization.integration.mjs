import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { PrismaClient } from "@prisma/client";
import { getDraft, getHarborDraft, saveDraft, saveHarborDraft } from "../src/lib/personalization/drafts.ts";
import { emptyDraft, emptyHarborDraft, parseDraft } from "../src/lib/personalization/harbor-draft.ts";
import { prepareCheckout } from "../src/lib/checkout.ts";
import { registerTemplateRelease } from "../src/lib/personalization/purchases.ts";
import { sourceArchive } from "./helpers/template-release.mjs";
import sharp from "sharp";

const url = process.env.TEST_DATABASE_URL;
if (url && (url === process.env.DATABASE_URL || !new URL(url).pathname.includes("_test"))) {
  throw new Error("TEST_DATABASE_URL must name a separate disposable database containing '_test'");
}

test("personalization drafts are owner-scoped and preserve or remove images", { skip: !url && "Set TEST_DATABASE_URL to a migrated disposable _test database" }, async (t) => {
  const db = new PrismaClient({ datasources: { db: { url } } });
  const ids = [randomUUID(), randomUUID()];
  t.after(async () => { try { await db.user.deleteMany({ where: { id: { in: ids } } }); } finally { await db.$disconnect(); } });
  await db.user.createMany({ data: ids.map((id) => ({ id, email: `${id}@example.com` })) });
  const first = { ...emptyHarborDraft(), business: { name: "First owner" } };
  await saveHarborDraft(ids[0], first, Uint8Array.from([1, 2, 3]), db);
  assert.equal(await getHarborDraft(ids[1], db), null);
  await saveHarborDraft(ids[1], { ...emptyHarborDraft(), business: { name: "Second owner" } }, undefined, db);
  await saveHarborDraft(ids[0], { ...first, home: { headline: "Changed" } }, undefined, db);
  assert.deepEqual([...((await getHarborDraft(ids[0], db)).heroImage)], [1, 2, 3]);
  assert.equal((await getHarborDraft(ids[1], db)).content.business.name, "Second owner");
  await saveHarborDraft(ids[0], first, null, db);
  assert.equal((await getHarborDraft(ids[0], db)).heroImage, null);
  await db.user.delete({ where: { id: ids[0] } });
  assert.equal(await db.personalizationDraft.count({ where: { userId: ids[0] } }), 0);
});

test("Coral Cove reviews and home sections persist in the owner's draft", { skip: !url && "Set TEST_DATABASE_URL to a migrated disposable _test database" }, async (t) => {
  const db = new PrismaClient({ datasources: { db: { url } } });
  const ids = [randomUUID(), randomUUID()];
  t.after(async () => { try { await db.user.deleteMany({ where: { id: { in: ids } } }); } finally { await db.$disconnect(); } });
  await db.user.createMany({ data: ids.map((id) => ({ id, email: `${id}@example.com` })) });
  const candidate = { ...emptyDraft("coral-cove"), homeSections: { travel: { first: { title: "Arrive by ferry" } }, reefHeading: "Meet the sea", useGalleryReef: true, useGalleryStrip: true }, reviews: { first: { quote: "A memorable stay", name: "A visitor" } }, reviewsHidden: true };
  const parsed = parseDraft(candidate, "coral-cove");
  assert.equal(parsed.success, true);
  await saveDraft(ids[0], parsed.data, undefined, db);
  const saved = await getDraft(ids[0], "coral-cove", db);
  assert.deepEqual(saved.content, candidate);
  assert.equal(await getDraft(ids[1], "coral-cove", db), null);
});

test("Pine Ridge content remains private and survives a database round trip", { skip: !url && "Set TEST_DATABASE_URL to a migrated disposable _test database" }, async (t) => {
  const db = new PrismaClient({ datasources: { db: { url } } });
  const ids = [randomUUID(), randomUUID()];
  t.after(async () => { try { await db.user.deleteMany({ where: { id: { in: ids } } }); } finally { await db.$disconnect(); } });
  await db.user.createMany({ data: ids.map((id) => ({ id, email: `${id}@example.com` })) });
  const candidate = { ...emptyDraft("pine-ridge-lodge"), pineRooms: { "trapper-twin": { name: "Forest Room", price: 250 } }, pineSeasons: { summer: { months: "June to August" } }, pineActivities: { "ridge-ski": { name: "Mountain adventure" } }, pineMenu: { first: { name: "Forest stew" } }, pinePages: { rooms: { heading: "Lodge accommodation" } }, pineCopy: { "Supper at the long table": "Dinner by the fire" } };
  const parsed = parseDraft(candidate, "pine-ridge-lodge");
  assert.equal(parsed.success, true);
  await saveDraft(ids[0], parsed.data, undefined, db);
  assert.deepEqual((await getDraft(ids[0], "pine-ridge-lodge", db)).content, candidate);
  assert.equal(await getDraft(ids[1], "pine-ridge-lodge", db), null);
});

test("Lumen content remains private and survives a database round trip", { skip: !url && "Set TEST_DATABASE_URL to a migrated disposable _test database" }, async (t) => {
  const db = new PrismaClient({ datasources: { db: { url } } });
  const ids = [randomUUID(), randomUUID()];
  t.after(async () => { try { await db.user.deleteMany({ where: { id: { in: ids } } }); } finally { await db.$disconnect(); } });
  await db.user.createMany({ data: ids.map((id) => ({ id, email: `${id}@example.com` })) });
  const candidate = { ...emptyDraft("lumen-lake-villas"), lumenVillas: { "shore-villa": { name: "Lake Suite", price: 4500, jetty: false } }, lumenExperiences: { kayak: { name: "Morning paddle" } }, lumenExtras: { breakfast: { price: 300 } }, lumenTour: { jetty: "Lakeside jetty" }, lumenPhotoAlt: { villas: "Our lake villa" }, lumenCopy: { "Compare the villas": "Explore the stays" } };
  const parsed = parseDraft(candidate, "lumen-lake-villas");
  assert.equal(parsed.success, true);
  await saveDraft(ids[0], parsed.data, undefined, db);
  assert.deepEqual((await getDraft(ids[0], "lumen-lake-villas", db)).content, candidate);
  assert.equal(await getDraft(ids[1], "lumen-lake-villas", db), null);
});

test("Isla Verde content remains private and survives a database round trip", { skip: !url && "Set TEST_DATABASE_URL to a migrated disposable _test database" }, async (t) => {
  const db = new PrismaClient({ datasources: { db: { url } } });
  const ids = [randomUUID(), randomUUID()];
  t.after(async () => { try { await db.user.deleteMany({ where: { id: { in: ids } } }); } finally { await db.$disconnect(); } });
  await db.user.createMany({ data: ids.map((id) => ({ id, email: `${id}@example.com` })) });
  const candidate = { ...emptyDraft("isla-verde-boutique"), islaRooms: { "casa-room": { name: "Garden Room", price: 8500 } }, islaMenu: { first: { name: "Breakfast plate" } }, islaSpaces: { first: { name: "Garden Hall" } }, islaPosts: { "a-morning-on-calle-crisologo": { title: "A quiet morning" } }, islaStory: { chapters: { first: { year: "1920", text: "Our story begins." } } }, islaPhotoAlt: { "carved-bed": "Garden bedroom" } };
  const parsed = parseDraft(candidate, "isla-verde-boutique");
  assert.equal(parsed.success, true);
  await saveDraft(ids[0], parsed.data, undefined, db);
  assert.deepEqual((await getDraft(ids[0], "isla-verde-boutique", db)).content, candidate);
  assert.equal(await getDraft(ids[1], "isla-verde-boutique", db), null);
});

test("checkout stores a separate Harbor House snapshot in PostgreSQL", { skip: !url && "Set TEST_DATABASE_URL to a migrated disposable _test database" }, async (t) => {
  const db = new PrismaClient({ datasources: { db: { url } } });
  const id = `snapshot-${randomUUID()}`;
  const previousActive = await db.activeTemplateRelease.findUnique({ where: { template: "harbor-house" } });
  let registeredRelease;
  t.after(async () => { try {
    await db.checkoutRequest.deleteMany({ where: { userId: id } });
    await db.order.deleteMany({ where: { userId: id } });
    await db.cartItem.deleteMany({ where: { userId: id } });
    await db.user.deleteMany({ where: { id } });
    await db.design.deleteMany({ where: { id } });
    await db.category.deleteMany({ where: { id } });
    if (registeredRelease) {
      if (previousActive) await db.activeTemplateRelease.update({ where: { template: "harbor-house" }, data: { releaseId: previousActive.releaseId } });
      else await db.activeTemplateRelease.deleteMany({ where: { template: "harbor-house" } });
      if (registeredRelease !== previousActive?.releaseId) await db.templateRelease.deleteMany({ where: { sha256: registeredRelease, purchases: { none: {} }, active: { none: {} } } });
    }
  } finally { await db.$disconnect(); } });
  if (await db.design.findUnique({ where: { slug: "harbor-house" } })) {
    t.skip("The isolated test database already has a Harbor House design");
    return;
  }
  await db.category.create({ data: { id, name: id, slug: id } });
  await db.design.create({ data: { id, slug: "harbor-house", title: "Test", summary: "Test", description: "Test", status: "PUBLISHED", categoryId: id, heroImage: "/test.webp", deliverables: [], tiers: { create: { id, level: "STARTER", name: "Starter", priceCents: 10000, inclusions: [] } } } });
  await db.user.create({ data: { id, email: `${id}@example.com`, emailVerified: new Date() } });
  await db.cartItem.create({ data: { userId: id, designId: id, tierId: id, addonIds: [] } });
  registeredRelease = await registerTemplateRelease("harbor-house", sourceArchive("harbor-house"), db);
  const image = await sharp({ create: { width: 8, height: 8, channels: 3, background: "#456789" } }).webp().toBuffer();
  await saveHarborDraft(id, { ...emptyHarborDraft(), business: { name: "Original" } }, image, db);
  const draft = await db.personalizationDraft.findUniqueOrThrow({ where: { userId_template: { userId: id, template: "harbor-house" } } });
  await db.personalizationDraftImage.create({ data: { draftId: draft.id, slot: "rose-room", image } });
  const order = await prepareCheckout(id, randomUUID(), null, true, db, ["harbor-house"], true);
  await saveHarborDraft(id, { ...emptyHarborDraft(), business: { name: "Later" } }, null, db);
  await db.personalizationDraftImage.deleteMany({ where: { draftId: draft.id } });
  const item = await db.orderItem.findFirstOrThrow({ where: { orderId: order.id }, include: { personalization: { include: { images: true } } } });
  assert.equal(item.personalization.content.business.name, "Original");
  assert.deepEqual(item.personalization.heroImage, new Uint8Array(image));
  assert.deepEqual(item.personalization.images[0].image, new Uint8Array(image));
});
