import "server-only";
import { createHash } from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import { db } from "@/lib/db";

/** Shared fixed windows. Database failures propagate: never fail open. */
export async function rateLimit(key: string, limit: number, windowMs: number, client: PrismaClient = db) {
  const digest = createHash("sha256").update(key).digest("hex");
  const [bucket] = await client.$queryRaw<{ count: number; retryAfterMs: number }[]>`
    INSERT INTO "RateLimitBucket" ("key", "count", "resetAt")
    VALUES (${digest}, 1, clock_timestamp() + ${windowMs} * interval '1 millisecond')
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimitBucket"."resetAt" <= clock_timestamp() THEN 1
        ELSE LEAST("RateLimitBucket"."count" + 1, ${limit + 1}) END,
      "resetAt" = CASE WHEN "RateLimitBucket"."resetAt" <= clock_timestamp()
        THEN clock_timestamp() + ${windowMs} * interval '1 millisecond'
        ELSE "RateLimitBucket"."resetAt" END
    RETURNING "count", GREATEST(0, EXTRACT(EPOCH FROM ("resetAt" - clock_timestamp())) * 1000)::int AS "retryAfterMs"
  `;
  return { ok: bucket.count <= limit, retryAfterMs: bucket.count <= limit ? 0 : bucket.retryAfterMs };
}
