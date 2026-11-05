import "server-only";
import type { Prisma, PrismaClient } from "@prisma/client";
import { db } from "@/lib/db";

/*
 * Order lifecycle. Every transition is a conditional update (WHERE status IN
 * ...), so webhook retries, duplicate events and the success-page check can
 * all run the same code without double-fulfilling or regressing a status.
 */

async function lockOrder(tx: Prisma.TransactionClient, orderId: string) {
  const order = await tx.order.findUnique({ where: { id: orderId }, select: { couponCode: true } });
  // Always lock coupon before order, matching checkout's reservation lock order.
  if (order?.couponCode) {
    await tx.$queryRaw`SELECT "id" FROM "Coupon" WHERE "code" = ${order.couponCode} FOR UPDATE`;
  }
  await tx.$queryRaw`SELECT "id" FROM "Order" WHERE "id" = ${orderId} FOR UPDATE`;
}

/** PENDING/FAILED → PAID. Returns true only for the call that made the change. */
export async function fulfillOrder(orderId: string, receiptUrl?: string | null, client: PrismaClient = db) {
  const changed = await client.$transaction(async (tx) => {
    await lockOrder(tx, orderId);
    const { count } = await tx.order.updateMany({
      where: { id: orderId, status: { in: ["PENDING", "FAILED"] } },
      data: { status: "PAID", paidAt: new Date(), confirmationNextAt: new Date(), couponReserved: false, ...(receiptUrl && { receiptUrl }) },
    });
    if (count === 0) return false;

    const order = await tx.order.findUniqueOrThrow({
      where: { id: orderId },
      select: { userId: true, couponCode: true, items: { select: { designId: true } } },
    });
    if (order.couponCode) {
      await tx.coupon.updateMany({
        where: { code: order.couponCode },
        data: { redemptions: { increment: 1 } },
      });
    }
    // Purchased designs leave the cart; anything added since stays.
    await tx.cartItem.deleteMany({
      where: { userId: order.userId, designId: { in: order.items.map((i) => i.designId) } },
    });
    return true;
  });

  if (receiptUrl && !changed) {
    await client.order.updateMany({ where: { id: orderId, receiptUrl: null }, data: { receiptUrl } });
  }
  return changed;
}

export async function markOrderFailed(orderId: string, client: PrismaClient = db) {
  await client.$transaction(async (tx) => {
    await lockOrder(tx, orderId);
    await tx.order.updateMany({
      where: { id: orderId, status: "PENDING" },
      data: { status: "FAILED", couponReserved: false, checkoutKey: null },
    });
  });
}

export async function markOrderRefunded(orderId: string, client: PrismaClient = db) {
  await client.$transaction(async (tx) => {
    await lockOrder(tx, orderId);
    // A refund is terminal even when its completion event has not arrived yet.
    await tx.order.updateMany({
      where: { id: orderId, status: { in: ["PENDING", "FAILED", "PAID"] } },
      data: { status: "REFUNDED", couponReserved: false },
    });
  });
}

export function orderRef(orderId: string) {
  return `#${orderId.slice(-8).toUpperCase()}`;
}
