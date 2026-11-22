import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { PrismaClient } from "@prisma/client";
import { testDatabaseConfig } from "../scripts/personalization-test-config.mjs";
import { storageRetentionReport } from "../scripts/storage-retention-report.mjs";

test("read-only retention report counts recent photo edits and excludes protected owners", async t => {
  const { target } = testDatabaseConfig();
  const db = new PrismaClient({ datasources: { db: { url: target } } });
  const users = Array.from({ length: 4 }, () => randomUUID());
  t.after(async () => { try { await db.order.deleteMany({ where: { userId: { in: users } } }); await db.user.deleteMany({ where: { id: { in: users } } }); } finally { await db.$disconnect(); } });
  const before = await storageRetentionReport(db);
  await db.user.createMany({ data: users.map((id, index) => ({ id, email: `${id}@example.test`, role: index === 2 ? "ADMIN" : "CLIENT", emailVerified: index === 3 ? null : new Date() })) });
  await db.order.create({ data: { userId: users[1], status: "PAID", subtotalCents: 100, totalCents: 100, currency: "PHP" } });
  for (const [index, userId] of users.entries()) {
    const draft = await db.personalizationDraft.create({ data: { userId, template: "harbor-house", content: { fixture: true }, heroImage: Uint8Array.from([1, 2, 3]), updatedAt: new Date("2000-01-01") } });
    if (index === 3) await db.personalizationDraftImage.create({ data: { draftId: draft.id, slot: "photo:fixture", image: Uint8Array.from([4, 5]) } });
  }
  const after = await storageRetentionReport(db);
  assert.equal(BigInt(after.drafts) - BigInt(before.drafts), BigInt(4));
  assert.equal(BigInt(after.accounts) - BigInt(before.accounts), BigInt(4));
  assert.equal(BigInt(after.protectedDrafts) - BigInt(before.protectedDrafts), BigInt(2));
  assert.equal(BigInt(after.reviewCandidates) - BigInt(before.reviewCandidates), BigInt(1));
  assert.equal(BigInt(after.candidateImageBytes) - BigInt(before.candidateImageBytes), BigInt(3));
  assert.equal(BigInt(after.imageBytes) - BigInt(before.imageBytes), BigInt(14));
  assert.equal(BigInt(after.unverifiedDrafts) - BigInt(before.unverifiedDrafts), BigInt(1));
  assert.equal(after.automaticDeletion, false);
  assert.equal(after.mode, "READ_ONLY_REVIEW");
  assert.equal(after.status, "READY");
  assert.equal(after.proposedDays, 30);
  for (const id of users) assert.ok(!JSON.stringify(after).includes(id));
  assert.equal(await db.personalizationDraft.count({ where: { userId: { in: users } } }), 4);
  await assert.rejects(storageRetentionReport(db, 0), /Days must/);
  await assert.rejects(storageRetentionReport(db, 90.5), /Days must/);
});
