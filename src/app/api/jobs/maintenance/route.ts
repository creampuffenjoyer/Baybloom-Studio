import { timingSafeEqual } from "node:crypto";
import { deliverConfirmations } from "@/lib/confirmation-outbox";
import { db } from "@/lib/db";
import { reportEvent } from "@/lib/monitoring";
import { deliverPurchases } from "@/lib/personalization/delivery";

// Source/artifact transfers run outside transactions and need more time than email alone.
export const maxDuration = 120;

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
    const purchases = await deliverPurchases(db, undefined, 1);
    const result = await deliverConfirmations(db, undefined, 2);
    await db.$executeRaw`DELETE FROM "RateLimitBucket" WHERE "resetAt" < CURRENT_TIMESTAMP AND "key" IN (
      SELECT "key" FROM "RateLimitBucket" WHERE "resetAt" < CURRENT_TIMESTAMP LIMIT 1000
    )`;
    const exhausted = await db.order.count({ where: { status: "PAID", confirmationSentAt: null, confirmationAttempts: { gte: 8 } } });
    const overdue = await db.order.count({ where: { status: "PAID", confirmationSentAt: null, confirmationNextAt: { lt: new Date(Date.now() - 10 * 60_000) } } });
    const purchaseExhausted = await db.orderDelivery.count({ where: { readyAt: null, attempts: { gte: 8 }, orderItem: { order: { status: "PAID" } } } });
    const purchaseOverdue = await db.orderDelivery.count({ where: { readyAt: null, nextAt: { lt: new Date(Date.now() - 10 * 60_000) }, orderItem: { order: { status: "PAID" } } } });
    reportEvent("maintenance_completed", { ...result, exhausted, overdue, purchaseReady: purchases.ready, purchaseFailed: purchases.failed, purchaseExhausted, purchaseOverdue });
    return Response.json({ ...result, exhausted, overdue, purchases, purchaseExhausted, purchaseOverdue });
  } catch {
    reportEvent("maintenance_failed");
    return Response.json({ error: "Maintenance failed" }, { status: 503 });
  }
}
