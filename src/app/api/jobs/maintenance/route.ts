import { timingSafeEqual } from "node:crypto";
import { deliverConfirmations } from "@/lib/confirmation-outbox";
import { db } from "@/lib/db";
import { reportEvent } from "@/lib/monitoring";

export const maxDuration = 60;

/** Call every minute from an authenticated scheduler; never from the browser. */
export async function POST(request: Request) {
  const secret = process.env.MAINTENANCE_SECRET;
  if (!secret || secret.length < 32) return Response.json({ error: "Not configured" }, { status: 503 });
  const received = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    // Three 15-second provider timeouts fit inside the execution budget.
    const result = await deliverConfirmations(db, undefined, 3);
    await db.$executeRaw`DELETE FROM "RateLimitBucket" WHERE "resetAt" < CURRENT_TIMESTAMP AND "key" IN (
      SELECT "key" FROM "RateLimitBucket" WHERE "resetAt" < CURRENT_TIMESTAMP LIMIT 1000
    )`;
    const exhausted = await db.order.count({ where: { status: "PAID", confirmationSentAt: null, confirmationAttempts: { gte: 8 } } });
    const overdue = await db.order.count({ where: { status: "PAID", confirmationSentAt: null, confirmationNextAt: { lt: new Date(Date.now() - 10 * 60_000) } } });
    reportEvent("maintenance_completed", { ...result, exhausted, overdue });
    return Response.json({ ...result, exhausted, overdue });
  } catch {
    reportEvent("maintenance_failed");
    return Response.json({ error: "Maintenance failed" }, { status: 503 });
  }
}
