import "server-only";
import type Stripe from "stripe";
import type { PrismaClient } from "@prisma/client";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { syncMembership, refundMembership } from "@/lib/membership-payment";
import { fulfillOrder, markOrderFailed, markOrderRefunded } from "@/lib/orders";

async function paymentFor(paymentIntent: string | Stripe.PaymentIntent | null, gateway: Stripe) {
  if (!paymentIntent) return null;
  const id = typeof paymentIntent === "string" ? paymentIntent : paymentIntent.id;
  const pi = await gateway.paymentIntents.retrieve(id, { expand: ["latest_charge"] });
  return pi.latest_charge && typeof pi.latest_charge !== "string" ? pi.latest_charge : null;
}

/**
 * Applies a Checkout Session's state to its order. Safe to call from the
 * webhook and from the success page: it only trusts data fetched from Stripe.
 */
export async function syncCheckoutSession(session: Stripe.Checkout.Session, client: PrismaClient = db, gateway?: Stripe) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return null;

  const order = await client.order.findUniqueOrThrow({ where: { id: orderId } });
  if (order.paymentMethod === "GCASH" || session.metadata?.userId !== order.userId || session.amount_total !== order.totalCents ||
      session.currency?.toUpperCase() !== order.currency.toUpperCase() ||
      (order.paymentRef && order.paymentRef !== session.id)) {
    throw new Error("Checkout Session does not match its order");
  }
  await client.order.updateMany({ where: { id: orderId, paymentRef: null }, data: { paymentRef: session.id } });

  if (session.payment_status === "paid" || session.payment_status === "no_payment_required") {
    const charge = session.payment_intent ? await paymentFor(session.payment_intent, gateway ?? stripe()) : null;
    if (charge?.refunded) await markOrderRefunded(orderId, client);
    else await fulfillOrder(orderId, charge?.receipt_url, client);
  } else if (session.status === "expired") {
    await markOrderFailed(orderId, client);
  }
  return orderId;
}

export async function handleStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
    case "checkout.session.expired":
      if (event.data.object.metadata?.membershipId) await syncMembership(event.data.object);
      else await syncCheckoutSession(event.data.object);
      break;
    case "checkout.session.async_payment_failed": {
      const orderId = event.data.object.metadata?.orderId;
      if (orderId) await markOrderFailed(orderId);
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object;
      if (!charge.refunded || !charge.payment_intent) break; // partial refunds keep PAID
      const pi =
        typeof charge.payment_intent === "string"
          ? await stripe().paymentIntents.retrieve(charge.payment_intent)
          : charge.payment_intent;
      if (pi.metadata?.membershipId) await refundMembership(pi.metadata);
      else if (pi.metadata?.orderId) await markOrderRefunded(pi.metadata.orderId);
      break;
    }
    default:
      break;
  }
}
