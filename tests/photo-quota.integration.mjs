import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { setPriority, constants } from "node:os";
import { PrismaClient } from "@prisma/client";
import { testDatabaseConfig } from "../scripts/personalization-test-config.mjs";
import { withPhotoQuota, PhotoQuotaError, withPhotoQuotaErrors } from "../src/lib/personalization/photo-quota.ts";
import { saveDraft } from "../src/lib/personalization/drafts.ts";
import { emptyDraft } from "../src/lib/personalization/harbor-draft.ts";

test("photo quotas serialize across templates, roll back excess writes and allow recovery", async t => {
  try { setPriority(0, constants.priority.PRIORITY_BELOW_NORMAL); } catch { /* best effort */ }
  const { target } = testDatabaseConfig();
  const db = new PrismaClient({ datasources: { db: { url: target } } });
  const users = [randomUUID(), randomUUID()];
  const limits = { draftBytes: 10, accountBytes: 12 };
  t.after(async () => { try { await db.user.deleteMany({ where: { id: { in: users } } }); } finally { await db.$disconnect(); } });
  await db.user.createMany({ data: users.map(id => ({ id, email: `${id}@example.test` })) });
  await saveDraft(users[0], emptyDraft("harbor-house"), Uint8Array.from([1, 2, 3, 4, 5, 6]), db);
  await saveDraft(users[0], emptyDraft("coral-cove"), Uint8Array.from([1, 2, 3, 4]), db);
  const drafts = await db.personalizationDraft.findMany({ where: { userId: users[0] } });

  await t.test("independent upload transactions cannot overfill one account across templates", async () => {
    const results = await Promise.allSettled(drafts.map(draft => withPhotoQuota(users[0], tx => tx.personalizationDraftImage.create({ data: { draftId: draft.id, slot: "photo:test", image: Uint8Array.from([1, 2]) } }), db, limits)));
    assert.equal(results.filter(result => result.status === "fulfilled").length, 1);
    assert.ok(results.find(result => result.status === "rejected").reason instanceof PhotoQuotaError);
    assert.equal(await db.personalizationDraftImage.count({ where: { draft: { userId: users[0] } } }), 1);
  });
  await t.test("hero replacement exceeding a draft limit rolls back the whole transaction", async () => {
    const draft = drafts[0];
    const previous = await db.personalizationDraft.findUniqueOrThrow({ where: { id: draft.id } });
    await assert.rejects(withPhotoQuota(users[0], tx => tx.personalizationDraft.update({ where: { id: draft.id }, data: { heroImage: new Uint8Array(11), content: { changed: true } } }), db, limits), PhotoQuotaError);
    const after = await db.personalizationDraft.findUniqueOrThrow({ where: { id: draft.id } });
    assert.deepEqual(after.heroImage, previous.heroImage);
    assert.deepEqual(after.content, previous.content);
  });
  await t.test("replacing an existing image at capacity does not count its bytes twice", async () => {
    const photo = await db.personalizationDraftImage.findFirstOrThrow({ where: { draft: { userId: users[0] } } });
    await withPhotoQuota(users[0], tx => tx.personalizationDraftImage.update({ where: { id: photo.id }, data: { image: Uint8Array.from([3, 4]) } }), db, limits);
  });
  await t.test("accounts are independent and new drafts are counted", async () => {
    await withPhotoQuota(users[1], tx => tx.personalizationDraft.create({ data: { userId: users[1], template: "harbor-house", content: emptyDraft("harbor-house"), heroImage: new Uint8Array(8) } }), db, limits);
    await assert.rejects(withPhotoQuota(users[1], tx => tx.personalizationDraft.create({ data: { userId: users[1], template: "coral-cove", content: emptyDraft("coral-cove"), heroImage: new Uint8Array(5) } }), db, limits), PhotoQuotaError);
    assert.equal(await db.personalizationDraft.count({ where: { userId: users[1] } }), 1);
  });
  await t.test("historical over-quota drafts allow text edits and shrinking but reject growth", async () => {
    const draft = drafts[0];
    await db.personalizationDraft.update({ where: { id: draft.id }, data: { heroImage: new Uint8Array(20) } });
    await withPhotoQuota(users[0], tx => tx.personalizationDraft.update({ where: { id: draft.id }, data: { content: emptyDraft(draft.template) } }), db, limits);
    await assert.rejects(withPhotoQuota(users[0], tx => tx.personalizationDraft.update({ where: { id: draft.id }, data: { heroImage: new Uint8Array(21) } }), db, limits), PhotoQuotaError);
    await withPhotoQuota(users[0], tx => tx.personalizationDraft.update({ where: { id: draft.id }, data: { heroImage: null } }), db, limits);
  });
  await t.test("quota refusals produce private 413 responses and other errors propagate", async () => {
    const response = await withPhotoQuotaErrors(async () => { throw new PhotoQuotaError("account"); })();
    assert.equal(response.status, 413);
    assert.match(response.headers.get("cache-control"), /private.*no-store/);
    assert.match((await response.json()).error, /200 MB/);
    await assert.rejects(withPhotoQuotaErrors(async () => { throw new Error("database unavailable"); })(), /database unavailable/);
  });
});
