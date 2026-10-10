import type Stripe from "stripe";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { handleStripeEvent } from "@/lib/stripe-orders";

/**
 * Stripe webhook. The signature is verified against the raw body; payment
 * status is never taken from the client (spec §8). Handlers are idempotent,
 * and any failure returns 500 so Stripe retries the event.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeConfigured() || !secret) {
    return Response.json({ error: "Webhooks are not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return Response.json({ error: "Missing signature." }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return Response.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    await handleStripeEvent(event);
  } catch (e) {
    console.error(`[stripe] ${event.type} ${event.id} failed`, e);
    return Response.json({ error: "Handler failed." }, { status: 500 });
  }
  return Response.json({ received: true });
}
