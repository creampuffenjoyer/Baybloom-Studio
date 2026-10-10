import "server-only";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { fulfillOrder, markOrderFailed, markOrderRefunded } from "@/lib/orders";

async function receiptUrlFor(paymentIntent: string | Stripe.PaymentIntent | null) {
  if (!paymentIntent) return null;
  const pi =
    typeof paymentIntent === "string"
      ? await stripe().paymentIntents.retrieve(paymentIntent, { expand: ["latest_charge"] })
      : paymentIntent;
  const charge = pi.latest_charge;
  return charge && typeof charge !== "string" ? (charge.receipt_url ?? null) : null;
}

/**
 * Applies a Checkout Session's state to its order. Safe to call from the
 * webhook and from the success page: it only trusts data fetched from Stripe.
 */
export async function syncCheckoutSession(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return null;

  if (session.payment_status === "paid" || session.payment_status === "no_payment_required") {
    await fulfillOrder(orderId, await receiptUrlFor(session.payment_intent));
  } else if (session.status === "expired") {
    await markOrderFailed(orderId);
  }
  return orderId;
}

export async function handleStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
    case "checkout.session.expired":
      await syncCheckoutSession(event.data.object);
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
      if (pi.metadata?.orderId) await markOrderRefunded(pi.metadata.orderId);
      break;
    }
    default:
      break;
  }
}
