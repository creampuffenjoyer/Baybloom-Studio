import assert from "node:assert/strict";
import { test } from "node:test";
import { prepareCheckout } from "../src/lib/checkout.ts";
import { snapshotDigest } from "../src/lib/personalization/purchases.ts";
import { checkoutChoiceSchema } from "../src/lib/personalization/checkout-choice.ts";
import { captureTemplateSnapshot } from "../src/lib/personalization/export.ts";
import { emptyDraft } from "../src/lib/personalization/harbor-draft.ts";
import { activeRelease, sourceArchive } from "./helpers/template-release.mjs";
import { commerceFixture } from "./helpers/commerce.mjs";
import { phase3Exports } from "./helpers/phase3-exports.mjs";

test("checkout choices reject draft ids, unverified templates, duplicate choices and missing photo consent", () => {
  for (const input of [{ draftId: "someone-else" }, { savedDraftTemplates: ["unknown-template"], imageRightsConfirmed: true },
    { savedDraftTemplates: ["harbor-house", "harbor-house"], imageRightsConfirmed: true }, { savedDraftTemplates: ["harbor-house"] }]) {
    assert.equal(checkoutChoiceSchema.safeParse(input).success, false);
  }
  assert.deepEqual(checkoutChoiceSchema.parse({}), { savedDraftTemplates: [], imageRightsConfirmed: false });
});

test("snapshot digest survives JSONB key order and image row ordering", () => {
  const snapshot = captureTemplateSnapshot(sourceArchive("harbor-house"), emptyDraft("harbor-house"), { heroImage: null,
    images: [{ slot: "photo:breakfast", image: Buffer.from("RIFF0000WEBP") }, { slot: "rose-room", image: Buffer.from("RIFF1111WEBP") }],
  });
  const reordered = { ...snapshot, content: Object.fromEntries(Object.entries(snapshot.content).reverse()), images: [...snapshot.images].reverse() };
  assert.equal(snapshotDigest(snapshot), snapshotDigest(reordered));
  assert.notEqual(snapshotDigest(snapshot), snapshotDigest({ ...snapshot, content: { ...snapshot.content, business: { name: "Changed" } } }));
});

for (const template of ["harbor-house", "bloomfield-gardens", ...phase3Exports.map(item => item.template)]) test(`${template}: original and saved choices pin sources, retries ignore later releases`, async () => {
  const f = commerceFixture();
  f.state().cart[0].design.slug = template;
  let release = activeRelease(template);
  let draft = { content: { ...emptyDraft(template), business: { name: "Buyer" } }, heroImage: null, images: [] };
  f.client.activeTemplateRelease = { findUnique: async () => release };
  f.client.personalizationDraft = { findUnique: async () => draft };
  const original = await prepareCheckout("alice", "original", null, true, f.client);
  const saved = await prepareCheckout("alice", "saved", null, true, f.client, [template], true);
  assert.notEqual(original.id, saved.id);
  const pinned = f.state().orders[1].items[0].personalization.create;
  assert.equal(pinned.content.business.name, "Buyer");
  assert.equal(pinned.sourceReleaseId, release.releaseId);
  assert.ok(pinned.imageRightsConfirmedAt);
  release = activeRelease(template, sourceArchive(template, "next"));
  draft = null;
  assert.equal((await prepareCheckout("alice", "saved", null, true, f.client, [template], true)).id, saved.id);
  assert.equal(f.state().orders[0].items[0].personalization.create.mode, "ORIGINAL");
  assert.deepEqual(f.state().orders[0].items[0].personalization.create.content.business, {});
  assert.equal(f.state().orders[0].items[0].personalization.create.imageRightsConfirmedAt, null);
  assert.deepEqual(f.state().orders[1].items[0].delivery, { create: {} });
});

test("checkout fails closed before creating an order for missing sources, drafts, invalid assets and unsupported choices", async () => {
  const f = commerceFixture();
  f.state().cart[0].design.slug = "harbor-house";
  f.client.activeTemplateRelease = { findUnique: async () => null };
  await assert.rejects(prepareCheckout("alice", "no-release", null, true, f.client), /could not be captured/);
  f.client.activeTemplateRelease = { findUnique: async () => activeRelease("harbor-house") };
  f.client.personalizationDraft = { findUnique: async () => null };
  await assert.rejects(prepareCheckout("alice", "no-draft", null, true, f.client, ["harbor-house"], true), /could not be captured/);
  await assert.rejects(prepareCheckout("alice", "consent", null, true, f.client, ["harbor-house"]), /permission/);
  f.client.personalizationDraft = { findUnique: async () => ({ content: emptyDraft("harbor-house"), heroImage: Uint8Array.of(1), images: [] }) };
  await assert.rejects(prepareCheckout("alice", "bad-photo", null, true, f.client, ["harbor-house"], true), /could not be captured/);
  await assert.rejects(prepareCheckout("alice", "unsupported", null, true, f.client, ["coral-cove"], true), /not supported/);
  assert.equal(f.state().orders.length, 0);
});
