import { pathToFileURL } from "node:url";
import { Prisma } from "@prisma/client";

/** Aggregates only: never select names, emails, draft content or image buffers. */
export async function storageRetentionReport(client, days = 30) {
  if (!Number.isInteger(days) || days < 1 || days > 3650) throw new Error("Days must be an integer between 1 and 3650.");
  return client.$transaction(async tx => {
    // Defense in depth: mutations of application tables fail in this transaction.
    await tx.$executeRaw`SET TRANSACTION READ ONLY`;
    const [schema] = await tx.$queryRaw`SELECT
      to_regclass('public."PersonalizationDraft"') IS NOT NULL AS drafts,
      to_regclass('public."PersonalizationDraftImage"') IS NOT NULL AS images,
      to_regclass('public."User"') IS NOT NULL AS users,
      to_regclass('public."Order"') IS NOT NULL AS orders`;
    const required = { drafts: "PersonalizationDraft", images: "PersonalizationDraftImage", users: "User", orders: "Order" };
    const missingTables = Object.keys(required).filter(key => !schema[key]).map(key => required[key]);
    if (missingTables.length) return { mode: "READ_ONLY_REVIEW", status: "SCHEMA_NOT_READY", automaticDeletion: false, missingTables };
    const [drafts] = await tx.$queryRaw`
      WITH usage AS (
        SELECT d."userId", u."emailVerified" IS NOT NULL AS verified,
          u."disabled" OR u."role" = 'ADMIN' OR EXISTS (
            SELECT 1 FROM "Order" o WHERE o."userId" = d."userId" AND o."status" IN ('PAID', 'PENDING')
          ) AS protected,
          GREATEST(d."updatedAt", COALESCE(i.last_edit, d."updatedAt")) AS last_edit,
          COALESCE(octet_length(d."heroImage"), 0)::bigint + COALESCE(i.bytes, 0) AS image_bytes
        FROM "PersonalizationDraft" d JOIN "User" u ON u."id" = d."userId"
        LEFT JOIN LATERAL (
          SELECT SUM(octet_length("image"))::bigint AS bytes, MAX("updatedAt") AS last_edit
          FROM "PersonalizationDraftImage" WHERE "draftId" = d."id"
        ) i ON true
      )
      SELECT COUNT(*)::bigint AS "drafts", COUNT(DISTINCT "userId")::bigint AS "accounts",
        COALESCE(SUM(image_bytes), 0)::bigint AS "imageBytes",
        COUNT(*) FILTER (WHERE NOT verified)::bigint AS "unverifiedDrafts",
        COUNT(*) FILTER (WHERE protected)::bigint AS "protectedDrafts",
        COUNT(*) FILTER (WHERE NOT protected AND last_edit < CURRENT_TIMESTAMP - ${days} * interval '1 day')::bigint AS "reviewCandidates",
        COALESCE(SUM(image_bytes) FILTER (WHERE NOT protected AND last_edit < CURRENT_TIMESTAMP - ${days} * interval '1 day'), 0)::bigint AS "candidateImageBytes"
      FROM usage`;
    return { mode: "READ_ONLY_REVIEW", status: "READY", proposedDays: days, lastActivityBasis: "latest saved draft or photo edit; views and sign-ins are not recorded",
      ...Object.fromEntries(Object.entries(drafts).map(([key, value]) => [key, value.toString()])),
      automaticDeletion: false, exclusions: ["accounts with paid or pending orders", "administrators", "disabled accounts"],
      excludedStorage: ["purchased snapshots and images", "retained source releases", "delivered files", "MFA credentials"] };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead, timeout: 30000 });
}

async function main() {
  const args = process.argv.slice(2);
  if (!args.every(arg => arg === "--test" || /^--days=\d+$/.test(arg)) || args.filter(arg => arg.startsWith("--days=")).length > 1) throw new Error("Usage: storage-retention-report.mjs [--test] [--days=30]. No delete/apply option exists.");
  const days = Number(args.find(arg => arg.startsWith("--days="))?.slice(7) ?? 30);
  const { PrismaClient } = await import("@prisma/client");
  let url;
  if (args.includes("--test")) {
    const { testDatabaseConfig } = await import("./personalization-test-config.mjs");
    url = testDatabaseConfig().target;
  } else {
    const dotenv = await import("dotenv");
    dotenv.config({ quiet: true });
    url = process.env.DATABASE_URL;
  }
  if (!url) throw new Error("A database URL is required.");
  const client = new PrismaClient({ datasources: { db: { url } } });
  try { console.log(JSON.stringify(await storageRetentionReport(client, days), null, 2)); }
  finally { await client.$disconnect(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(() => { console.error("Storage report failed. Check database availability and the documented report arguments; no deletion was attempted."); process.exitCode = 1; });
}
