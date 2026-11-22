import "server-only";
import type { Prisma, PrismaClient } from "@prisma/client";
import { db } from "@/lib/db";

export const PHOTO_STORAGE_LIMITS = Object.freeze({ draftBytes: 100 * 1024 * 1024, accountBytes: 200 * 1024 * 1024 });

export class PhotoQuotaError extends Error {
  constructor(scope: "draft" | "account") {
    super(scope === "draft"
      ? "This draft has reached its 100 MB photo limit. Restore an unused photo and try again."
      : "Your account has reached its 200 MB photo limit. Restore unused photos and try again.");
  }
}

async function usage(tx: Prisma.TransactionClient, userId: string) {
  return tx.$queryRaw<{ id: string; bytes: bigint }[]>`
    SELECT d."id", (COALESCE(octet_length(d."heroImage"), 0)::bigint +
      COALESCE((SELECT SUM(octet_length(i."image")) FROM "PersonalizationDraftImage" i WHERE i."draftId" = d."id"), 0))::bigint AS "bytes"
    FROM "PersonalizationDraft" d WHERE d."userId" = ${userId}`;
}

/** Lock the account before any draft lock, including writes to different templates.
 * Check inside the same transaction so an oversized write is rolled back.
 * Existing oversized drafts can still be edited without growth or reduced.
 * Limits can be lowered by isolated database tests without allocating huge blobs.
 */
export function withPhotoQuota<T>(userId: string, write: (tx: Prisma.TransactionClient) => Promise<T>, client: PrismaClient = db, limits = PHOTO_STORAGE_LIMITS) {
  return client.$transaction(async tx => {
    await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${userId} FOR UPDATE`;
    const before = await usage(tx, userId);
    const result = await write(tx);
    const after = await usage(tx, userId);
    const previous = new Map(before.map(row => [row.id, row.bytes]));
    for (const row of after) {
      if (row.bytes > BigInt(limits.draftBytes) && row.bytes > (previous.get(row.id) ?? BigInt(0))) throw new PhotoQuotaError("draft");
    }
    const sum = (rows: typeof before) => rows.reduce((total, row) => total + row.bytes, BigInt(0));
    if (sum(after) > BigInt(limits.accountBytes) && sum(after) > sum(before)) throw new PhotoQuotaError("account");
    return result;
  }, { maxWait: 15_000, timeout: 30_000 });
}

/** Preserve ordinary failures; only quota refusals become a customer-facing 413. */
export function withPhotoQuotaErrors<A extends unknown[]>(handler: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try { return await handler(...args); }
    catch (error) {
      if (!(error instanceof PhotoQuotaError)) throw error;
      return Response.json({ error: error.message }, { status: 413, headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
    }
  };
}
