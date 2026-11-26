import "server-only";
import { randomUUID } from "node:crypto";
import type { Prisma, PrismaClient } from "@prisma/client";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { LIFETIME_PRICE_CENTS } from "@/lib/membership-plans";
import { publicSiteOrigin } from "@/lib/site-origin";
import { stripe, stripeConfigured } from "@/lib/stripe";

export function membershipCheckoutReady() {
  return stripeConfigured() && Boolean(process.env.STRIPE_WEBHOOK_SECRET);
}

export function checkoutParameters(id: string, userId: string, email: string | null, expiresAt: Date): Stripe.Checkout.SessionCreateParams {
  const metadata = { membershipId: id, userId };
  return {
    mode: "payment", allowed_payment_method_types: ["card"], client_reference_id: id,
    ...(email ? { customer_email: email } : {}), metadata, payment_intent_data: { metadata },
    line_items: [{ quantity: 1, price_data: { currency: "usd", unit_amount: LIFETIME_PRICE_CENTS,
      product_data: { name: "Baybloom Premium · Lifetime access" } } }],
    expires_at: Math.floor(expiresAt.getTime() / 1000),
    success_url: publicSiteOrigin() + "/membership?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: publicSiteOrigin() + "/membership?canceled=1",
  };
}

export async function syncMembership(session: Stripe.Checkout.Session, client: PrismaClient = db) {
  const id = session.metadata?.membershipId;
  if (!id) return;
  const row = await client.membershipPayment.findUniqueOrThrow({where: {id}});
  if (session.client_reference_id !== id || row.userId !== session.metadata?.userId ||
      (row.sessionId && row.sessionId !== session.id) || session.mode !== "payment" ||
      session.currency !== "usd" || session.amount_total !== LIFETIME_PRICE_CENTS) {
    throw new Error("Checkout does not match the membership payment");
  }
  const paid = session.status === "complete" && session.payment_status === "paid";
  await client.membershipPayment.updateMany({
    where: { id, status: "PENDING", OR: [{ sessionId: null }, { sessionId: session.id }] },
    data: { sessionId: session.id, ...(paid ? { status: "PAID", paidAt: new Date() } :
      session.status === "expired" ? { status: "FAILED", activeKey: null } : {}) },
  });
}

export async function refundMembership(metadata: Stripe.Metadata, client: PrismaClient = db) {
  if (!metadata.membershipId || !metadata.userId) return;
  await client.membershipPayment.updateMany({
    where: {id: metadata.membershipId, userId: metadata.userId, status: {in: ["PENDING", "PAID"]}},
    data: {status: "REFUNDED", activeKey: null},
  });
}

export async function membershipCheckout(userId: string, email: string | null, client: PrismaClient = db, gateway = stripe()) {
  const id = randomUUID();
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const parameters = checkoutParameters(id, userId, email, expiresAt);
  // The unique active account key and frozen parameters let concurrent tabs resume the same payment.
  const row = await client.membershipPayment.upsert({ where: { activeKey: userId }, update: {activeKey: userId},
    create: {id, userId, activeKey: userId, expiresAt, parameters: parameters as Prisma.InputJsonObject} });
  if (row.status === "PAID") return "/membership";
  let session: Stripe.Checkout.Session | undefined;
  if (row.sessionId) {
    session = await gateway.checkout.sessions.retrieve(row.sessionId);
  } else if (row.expiresAt.getTime() - Date.now() < 31 * 60_000) {
    // If Stripe accepted a request whose response was lost, find it before allowing a replacement.
    await gateway.checkout.sessions.list({created: {gte: Math.floor(row.createdAt.getTime()/1000) - 60,
      lte: Math.ceil(row.expiresAt.getTime()/1000)}, limit: 100}).autoPagingEach(candidate => {
      if (candidate.metadata?.membershipId === row.id && candidate.metadata?.userId === userId) {
        session = candidate;
        return false;
      }
    });
    if (!session) {
      if (row.expiresAt.getTime() > Date.now()) return "/membership?retry=later";
      await client.membershipPayment.updateMany({where: {id: row.id, status: "PENDING", sessionId: null}, data: {status: "FAILED", activeKey: null}});
      return "/membership?retry=1";
    }
  } else {
    session = await gateway.checkout.sessions.create(row.parameters as unknown as Stripe.Checkout.SessionCreateParams,
      {idempotencyKey: "baybloom-membership-" + row.id});
  }
  await syncMembership(session, client);
  if (session.status === "open" && session.url) return session.url;
  return session.status === "expired" ? "/membership?retry=1" : "/membership";
}
