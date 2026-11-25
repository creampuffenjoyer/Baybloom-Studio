import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { Order, PrismaClient } from "@prisma/client";
import { z } from "zod";
import { CheckoutError } from "@/lib/checkout";
import { db } from "@/lib/db";
import { fulfillOrder, markOrderFailed, markOrderRefunded } from "@/lib/orders";

const sessionId = z.string().regex(/^cs_[a-zA-Z0-9]+$/);
const paymentId = z.string().regex(/^pay_[a-zA-Z0-9]+$/);
const refundDetails = z.object({ amount: z.int().positive(), status: z.string() });
const payment = z.object({
  id: paymentId,
  attributes: z.object({
    amount: z.int().positive(), currency: z.string(), status: z.string(),
    source: z.object({ type: z.string() }).nullish(),
    refunds: z.array(z.union([refundDetails, z.object({ attributes: refundDetails }).transform(r => r.attributes)])).nullish(),
  }),
});
const session = z.object({
  id: sessionId,
  attributes: z.object({
    status: z.enum(["active", "expired"]).optional(),
    reference_number: z.string(),
    metadata: z.object({ orderId: z.string(), userId: z.string() }),
    checkout_url: z.string().nullish(),
    payments: z.array(payment).nullish(),
  }),
});
type Session = z.infer<typeof session>;
const refundNotice = z.object({
  payment_id: paymentId, amount: z.int().positive(), currency: z.string(), status: z.literal("succeeded"),
});

const eventDetails = z.object({ type: z.string(), livemode: z.boolean(), data: z.unknown() });
const event = z.union([
  z.object({ data: z.object({ attributes: eventDetails }) }).transform(input => input.data.attributes),
  z.object({ event_type: z.literal("send.webhook"), data: eventDetails }).transform(input => input.data),
]);

export function gcashConfigured() {
  return process.env.PAYMONGO_GCASH_ENABLED === "true" && payMongoWebhookConfigured();
}

export function payMongoWebhookConfigured() {
  return /^(sk_test_|sk_live_)/.test(process.env.PAYMONGO_SECRET_KEY ?? "") && !!process.env.PAYMONGO_WEBHOOK_SECRET;
}

export function parsePayMongoWebhook(raw: Buffer, header: string, secret: string, live: boolean, now = Date.now()) {
  const parts = header.split(",").map(part => part.trim().split("="));
  const time = parts.filter(([key]) => key === "t");
  const signatures = parts.filter(([key]) => key === (live ? "li" : "te"));
  const timestamp = time[0]?.[1];
  const signature = signatures[0]?.[1];
  if (time.length !== 1 || signatures.length !== 1 || !timestamp || !/^\d{10}$/.test(timestamp)
    || Math.abs(now / 1000 - Number(timestamp)) > 300 || !signature || !/^[a-f0-9]{64}$/i.test(signature)) {
    throw new Error("Invalid PayMongo signature");
  }
  const expected = createHmac("sha256", secret).update(timestamp).update(".").update(raw).digest();
  if (!timingSafeEqual(expected, Buffer.from(signature, "hex"))) throw new Error("Invalid PayMongo signature");
  const verified = event.parse(JSON.parse(raw.toString("utf8")));
  if (verified.livemode !== live) throw new Error("PayMongo event mode mismatch");
  return verified;
}

class PayMongoError extends Error {
  constructor(public readonly status: number) { super("PayMongo request failed"); }
}

async function requestPayMongo<T>(schema: z.ZodType<T>, path: string, init: RequestInit = {}) {
  const key = process.env.PAYMONGO_SECRET_KEY;
  if (!key) throw new CheckoutError("GCash is temporarily unavailable.", 503);
  const response = await fetch(`https://api.paymongo.com${path}`, {
    ...init, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(12_000),
    headers: { Authorization: `Basic ${Buffer.from(key + ":").toString("base64")}`,
      "Content-Type": "application/json", ...init.headers },
  });
  if (!response.ok) throw new PayMongoError(response.status);
  return z.object({ data: schema }).parse(await response.json()).data;
}

function sessionPath(id: string) { return `/v1/checkout_sessions/${sessionId.parse(id)}`; }

function validateSession(order: Order, checkout: Session) {
  const { reference_number, metadata } = checkout.attributes;
  if (order.paymentMethod !== "GCASH" || reference_number !== order.id || metadata.orderId !== order.id ||
    metadata.userId !== order.userId || (order.paymentRef && order.paymentRef !== checkout.id)) {
    throw new Error("PayMongo session does not match the order");
  }
}

async function settlePayment(order: Order, id: string, client: PrismaClient, succeededRefund?: number) {
  const current = await requestPayMongo(payment, `/v1/payments/${paymentId.parse(id)}`);
  const details = current.attributes;
  if (current.id !== id || details.amount !== order.totalCents || details.currency.toUpperCase() !== order.currency.toUpperCase() ||
    details.source?.type !== "gcash") throw new Error("PayMongo payment does not match the order");
  const refunded = details.refunds?.reduce((sum, refund) => sum + (refund.status === "succeeded" ? refund.amount : 0), 0) ?? 0;
  if (details.status === "refunded" || Math.max(refunded, succeededRefund ?? 0) >= order.totalCents) {
    await markOrderRefunded(order.id, client);
    return "paid" as const;
  }
  if (details.status !== "paid") return "pending" as const;
  await fulfillOrder(order.id, null, client);
  return "paid" as const;
}

async function syncSession(order: Order, checkout: Session, client: PrismaClient) {
  validateSession(order, checkout);
  const paid = checkout.attributes.payments?.find(({ attributes }) => attributes.status === "paid" || attributes.status === "refunded");
  if (paid && (paid.attributes.amount !== order.totalCents || paid.attributes.currency.toUpperCase() !== order.currency.toUpperCase())) {
    throw new Error("PayMongo session amount does not match the order");
  }
  const attached = await client.order.updateMany({
    where: { id: order.id, paymentMethod: "GCASH", AND: [
      { OR: [{ paymentRef: null }, { paymentRef: checkout.id }] },
      ...(paid ? [{ OR: [{ providerPaymentId: null }, { providerPaymentId: paid.id }] }] : []),
    ] },
    data: { paymentRef: checkout.id, ...(paid && { providerPaymentId: paid.id }) },
  });
  if (!attached.count) throw new Error("PayMongo order references changed");
  if (paid) return settlePayment(order, paid.id, client);
  if (checkout.attributes.status === "expired") {
    await markOrderFailed(order.id, client);
    return "expired" as const;
  }
  return "pending" as const;
}

export async function reconcileGCash(order: Order, client: PrismaClient = db) {
  if (!order.paymentRef) return "pending";
  return syncSession(order, await requestPayMongo(session, sessionPath(order.paymentRef)), client);
}

async function getOrCreateSession(order: Order) {
  if (order.paymentRef) return requestPayMongo(session, sessionPath(order.paymentRef));
  // Recovery may use the frozen request only inside PayMongo's 24-hour idempotency window.
  if (!order.checkoutParameters || Date.now() - order.createdAt.getTime() >= 23 * 3600_000) {
    throw new CheckoutError("This GCash payment needs reconciliation. Contact the studio with your order number.", 503);
  }
  const result = await requestPayMongo(z.object({ id: sessionId }).passthrough(), "/v2/checkout_sessions", {
    method: "POST", body: JSON.stringify(order.checkoutParameters),
    headers: { "Idempotency-Key": `bb-checkout-${order.id}` },
  });
  const decoded = session.safeParse(result);
  return decoded.success ? decoded.data : requestPayMongo(session, sessionPath(result.id));
}

export async function gcashCheckout(order: Order, client: PrismaClient) {
  const checkout = await getOrCreateSession(order);
  const state = await syncSession(order, checkout, client);
  if (state === "paid") return `/checkout/success?order=${encodeURIComponent(order.id)}`;
  if (state === "expired") return null;
  const rawUrl = checkout.attributes.checkout_url;
  const url = rawUrl ? new URL(rawUrl) : null;
  if (!url || url.origin !== "https://checkout.paymongo.com" || url.username || url.password) {
    throw new CheckoutError("GCash checkout is being prepared. Please retry.", 503);
  }
  return url.href;
}

export async function closeGCashCheckout(order: Order, client: PrismaClient) {
  const current = await getOrCreateSession(order);
  const status = await syncSession(order, current, client);
  if (status !== "pending") return status;
  const path = sessionPath(current.id);
  let closed: Session;
  try {
    closed = await requestPayMongo(session, `${path}/expire`, { method: "POST" });
  } catch (error) {
    if (!(error instanceof PayMongoError && error.status === 400)) throw error;
    // PayMongo also refuses to expire a paid or in-flight session. Retrieve the result first.
    closed = await requestPayMongo(session, path);
  }
  return syncSession(order, closed, client);
}

export async function handlePayMongoEvent({ type, data }: z.infer<typeof event>, client: PrismaClient = db) {
  if (type === "checkout_session.payment.paid") {
    const reference = z.object({ attributes: z.object({ reference_number: z.string().max(128) }) }).safeParse(data);
    if (!reference.success) return;
    const order = await client.order.findUnique({ where: { id: reference.data.attributes.reference_number } });
    if (order?.paymentMethod === "GCASH") await syncSession(order, session.parse(data), client);
  }
  if (type === "payment.refund.updated" || type === "payment.refunded") {
    const notice = z.object({ attributes: refundNotice }).safeParse(data);
    const money = notice.success ? notice.data.attributes : null;
    const id = money?.payment_id ?? payment.safeParse(data).data?.id;
    if (!id) return;
    const order = await client.order.findUnique({ where: { providerPaymentId: id } });
    if (order?.paymentMethod === "GCASH") {
      await settlePayment(order, id, client, money?.currency.toUpperCase() === order.currency.toUpperCase() ? money.amount : undefined);
    }
  }
}
