import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { Cart } from "@/lib/cart";
import { actionEmail, sendEmail, siteUrl } from "@/lib/email";
import { formatPrice } from "@/lib/format";

/*
 * Order lifecycle. Every transition is a conditional update (WHERE status IN
 * ...), so webhook retries, duplicate events and the success-page check can
 * all run the same code without double-fulfilling or regressing a status.
 */

export async function createPendingOrder(
  userId: string,
  cart: Cart,
  billing: Prisma.InputJsonValue,
) {
  return db.order.create({
    data: {
      userId,
      status: "PENDING",
      subtotalCents: cart.subtotalCents,
      discountCents: cart.discountCents,
      totalCents: cart.totalCents,
      currency: cart.currency,
      couponCode: cart.coupon?.code ?? null,
      billing,
      items: {
        create: cart.lines.map((l) => ({
          designId: l.design.id,
          tierId: l.tier.id,
          designTitle: l.design.title,
          tierName: l.tier.label,
          priceCents: l.lineCents,
          addons: l.addons,
        })),
      },
    },
    select: { id: true },
  });
}

/** PENDING/FAILED → PAID. Returns true only for the call that made the change. */
export async function fulfillOrder(orderId: string, receiptUrl?: string | null) {
  const changed = await db.$transaction(async (tx) => {
    const { count } = await tx.order.updateMany({
      where: { id: orderId, status: { in: ["PENDING", "FAILED"] } },
      data: { status: "PAID", paidAt: new Date(), ...(receiptUrl && { receiptUrl }) },
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
    await db.order.updateMany({ where: { id: orderId, receiptUrl: null }, data: { receiptUrl } });
  }
  await sendConfirmationOnce(orderId);
  return changed;
}

export async function markOrderFailed(orderId: string) {
  await db.order.updateMany({ where: { id: orderId, status: "PENDING" }, data: { status: "FAILED" } });
}

export async function markOrderRefunded(orderId: string) {
  await db.order.updateMany({ where: { id: orderId, status: "PAID" }, data: { status: "REFUNDED" } });
}

/** Sends the confirmation email at most once per order. */
async function sendConfirmationOnce(orderId: string) {
  const claim = await db.order.updateMany({
    where: { id: orderId, status: "PAID", confirmationSentAt: null },
    data: { confirmationSentAt: new Date() },
  });
  if (claim.count === 0) return;

  const order = await db.order.findUniqueOrThrow({
    where: { id: orderId },
    select: {
      totalCents: true,
      currency: true,
      user: { select: { email: true, name: true } },
      items: { select: { designTitle: true, tierName: true } },
    },
  });
  const ref = orderRef(orderId);
  const list = order.items.map((i) => `${i.designTitle} (${i.tierName})`).join(", ");
  try {
    await sendEmail({
      to: order.user.email,
      subject: `Your Baybloom Studio order ${ref}`,
      ...actionEmail({
        heading: `Thank you${order.user.name ? `, ${order.user.name.split(" ")[0]}` : ""}!`,
        body: `Your payment of ${formatPrice(order.totalCents, order.currency)} for ${list} was received. Your files are ready to download from your account.`,
        cta: "View receipt & downloads",
        url: siteUrl(`/account/orders/${orderId}`),
        footer: `Order ${ref}. Download links in your account are refreshed each time you open them.`,
      }),
    });
  } catch (e) {
    // Release the claim so a later webhook retry can resend.
    await db.order.update({ where: { id: orderId }, data: { confirmationSentAt: null } });
    console.error("[orders] confirmation email failed", e);
  }
}

export function orderRef(orderId: string) {
  return `#${orderId.slice(-8).toUpperCase()}`;
}
