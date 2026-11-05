import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { PrismaClient } from "@prisma/client";
import { getHarborDraft, saveHarborDraft } from "../src/lib/personalization/drafts.ts";
import { emptyHarborDraft } from "../src/lib/personalization/harbor-draft.ts";

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
