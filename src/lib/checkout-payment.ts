import "server-only";
import type { Order, PrismaClient } from "@prisma/client";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { CheckoutError, couponId, recoverCheckoutSession } from "@/lib/checkout";
import { fulfillOrder, markOrderFailed } from "@/lib/orders";
import { syncCheckoutSession } from "@/lib/stripe-orders";

export class ExpiredCheckoutError extends CheckoutError {
  constructor() { super("This checkout has expired. Please try again to start a new checkout."); }
}

async function settleSession(session: Stripe.Checkout.Session, client: PrismaClient, gateway: Stripe) {
  await syncCheckoutSession(session, client, gateway);
  if (session.payment_status === "paid" || session.payment_status === "no_payment_required" || session.status === "complete") {
    return `/checkout/success?session_id=${encodeURIComponent(session.id)}`;
  }
  if (session.status === "expired") throw new ExpiredCheckoutError();
  if (!session.url) throw new CheckoutError("Payment is still being prepared. Please retry this checkout.", 503);
  return session.url;
}

export async function continueCheckout(order: Order, client: PrismaClient = db, paymentGateway?: Stripe) {
  if (order.status === "FAILED") throw new ExpiredCheckoutError();
  if (order.status === "PAID" || order.status === "REFUNDED") return `/account/orders/${order.id}`;
  if (order.totalCents === 0) {
    await fulfillOrder(order.id, null, client);
    return `/checkout/success?order=${order.id}`;
  }
  const gateway = paymentGateway ?? stripe();
  if (!order.checkoutExpiresAt || !order.checkoutParameters) throw new CheckoutError("This checkout needs support to reconcile it.");

  // Stripe requires a new session's expiry to be at least 30 minutes away.
  // Close to/after that point, recover instead of changing the frozen request.
  if (order.paymentRef || order.checkoutExpiresAt.getTime() - Date.now() <= 30 * 60_000) {
    const session = await recoverCheckoutSession(order, gateway);
    if (session) return settleSession(session, client, gateway);
    // A missing session is safe to release only after its fixed creation window
    // has closed, including a buffer for an in-flight Stripe request.
    if (Date.now() > order.checkoutExpiresAt.getTime() + 5 * 60_000) {
      await markOrderFailed(order.id, client);
      throw new ExpiredCheckoutError();
    }
    throw new CheckoutError("The previous checkout is being reconciled. Please retry after it expires.", 503);
  }

  if (order.discountCents) {
    const id = couponId(order.id);
    try {
      await gateway.coupons.create({
        id, amount_off: order.discountCents, currency: order.currency.toLowerCase(),
        duration: "once", max_redemptions: 1, name: order.couponCode ?? "Discount",
        metadata: { orderId: order.id },
      }, { idempotencyKey: `coupon-${order.id}` });
    } catch (error) {
      if (!(error && typeof error === "object" && "code" in error && error.code === "resource_already_exists")) throw error;
      const coupon = await gateway.coupons.retrieve(id);
      if (coupon.metadata?.orderId !== order.id || coupon.amount_off !== order.discountCents ||
          coupon.currency !== order.currency.toLowerCase()) throw new Error("Checkout coupon does not match its order");
    }
  }
  const session = await gateway.checkout.sessions.create(
    order.checkoutParameters as unknown as Stripe.Checkout.SessionCreateParams,
    { idempotencyKey: `checkout-${order.id}` },
  );
  // If this write fails, retrying uses the same Stripe key and exact parameters.
  await client.order.update({ where: { id: order.id }, data: { paymentRef: session.id } });
  return settleSession(session, client, gateway);
}

/** Opportunistic cleanup; webhooks remain the primary release path. No release on API uncertainty. */
export async function reconcileExpiredCheckouts(client: PrismaClient = db, paymentGateway?: Stripe) {
  const expired = await client.order.findMany({
    where: { status: "PENDING", checkoutExpiresAt: { lt: new Date(Date.now() - 5 * 60_000) } },
    orderBy: { checkoutExpiresAt: "asc" }, take: 20,
  });
  for (const order of expired) {
    try {
      await continueCheckout(order, client, paymentGateway);
    } catch (error) {
      if (!(error instanceof ExpiredCheckoutError)) {
        // Keep the reservation: a timeout is not proof that payment failed.
        console.error("[checkout] reconciliation deferred", order.id);
      }
    }
  }
}
