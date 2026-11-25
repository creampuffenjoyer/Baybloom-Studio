import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { PrismaClient } from "@prisma/client";
import { prepareCheckout } from "../src/lib/checkout.ts";
import { continueCheckout } from "../src/lib/checkout-payment.ts";
import { fulfillOrder, markOrderFailed, markOrderRefunded } from "../src/lib/orders.ts";
import { authorizeGoogleAccount } from "../src/lib/google-account.ts";
import { authorizeDownload } from "../src/lib/deliverables.ts";
import { stripeFixture } from "./helpers/commerce.mjs";
import { rateLimit } from "../src/lib/rate-limit.ts";
import { deliverConfirmations } from "../src/lib/confirmation-outbox.ts";
import { deliverProjectEmails } from "../src/lib/project-delivery-outbox.ts";
import { findProjectDelivery } from "../src/lib/project-delivery-link.ts";
import { createHash } from "node:crypto";

// Never load .env or fall back to the application's DATABASE_URL.
const url = process.env.TEST_DATABASE_URL;
if (url) {
  const target = new URL(url);
  if (url === process.env.DATABASE_URL || !target.pathname.includes("_test")) {
    throw new Error("TEST_DATABASE_URL must name a separate disposable database containing '_test'");
  }
}

test("PostgreSQL checkout/security integration", { skip: !url && "Set TEST_DATABASE_URL to a migrated disposable _test database" }, async (t) => {
  const db = new PrismaClient({ datasources: { db: { url } } });
  const prefix = `audit-${randomUUID()}`;
  const users = [`${prefix}-alice`, `${prefix}-bob`];
  const designId = `${prefix}-design`;
  const hostingDesignId = `${prefix}-hosting-design`;
  const tierId = `${prefix}-tier`;
  const code = prefix.toUpperCase();

  const clearOrders = async () => {
    await db.checkoutRequest.deleteMany({ where: { userId: { in: users } } });
    await db.order.deleteMany({ where: { userId: { in: users } } });
    await db.cartItem.deleteMany({ where: { userId: { in: users } } });
    await db.coupon.update({ where: { code }, data: { redemptions: 0, percentOff: 100 } });
    await db.cartItem.createMany({ data: users.map((userId) => ({ userId, designId, tierId, addonIds: [] })) });
  };
  t.after(async () => {
    try {
      await db.rateLimitBucket.deleteMany({ where: { key: createHash("sha256").update(prefix).digest("hex") } });
      await db.checkoutRequest.deleteMany({ where: { userId: { in: users } } });
      await db.order.deleteMany({ where: { userId: { in: users } } });
      await db.user.deleteMany({ where: { id: { in: users } } });
      await db.design.deleteMany({ where: { id: { in: [designId, hostingDesignId] } } });
      await db.category.deleteMany({ where: { id: prefix } });
      await db.coupon.deleteMany({ where: { code } });
    } finally { await db.$disconnect(); }
  });
  await db.category.create({ data: { id: prefix, name: prefix, slug: prefix } });
  await db.design.create({ data: {
    id: designId, slug: prefix, title: "Integration fixture", summary: "Test", description: "Test",
    status: "PUBLISHED", categoryId: prefix, heroImage: "/test.webp", deliverables: [],
    tiers: { create: { id: tierId, level: "STARTER", name: "Starter", priceCents: 10000, inclusions: [] } },
  } });
  await db.deliverableFile.create({ data: {
    id: `${prefix}-file`, designId, name: "Test.zip", storageKey: "test.zip", minTierId: tierId,
  } });
  await db.user.createMany({ data: users.map((id) => ({ id, email: `${id}@example.com`, emailVerified: new Date() })) });
  await db.coupon.create({ data: { code, percentOff: 100, maxRedemptions: 1 } });

  await t.test("independent PostgreSQL transactions serialize the final coupon slot", async () => {
    await clearOrders();
    const results = await Promise.allSettled(users.map((id) => prepareCheckout(id, randomUUID(), code, true, db)));
    assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
    assert.equal(await db.order.count({ where: { couponCode: code, couponReserved: true } }), 1);
  });

  await t.test("simultaneous retries/tabs reuse one order and one redemption", async () => {
    await clearOrders();
    const results = await Promise.all(Array.from({ length: 5 }, () => prepareCheckout(users[0], randomUUID(), code, true, db)));
    assert.equal(new Set(results.map((order) => order.id)).size, 1);
    const order = results[0];
    await db.order.update({ where: { id: order.id }, data: { confirmationSentAt: new Date() } });
    await Promise.all([fulfillOrder(order.id, null, db), fulfillOrder(order.id, null, db)]);
    assert.equal((await db.coupon.findUniqueOrThrow({ where: { code } })).redemptions, 1);
    assert.equal((await db.order.findUniqueOrThrow({ where: { id: order.id } })).couponReserved, false);
  });

  await t.test("refund first, then completion: no paid status or download access", async () => {
    await clearOrders();
    const order = await prepareCheckout(users[0], randomUUID(), code, true, db);
    await markOrderRefunded(order.id, db);
    await fulfillOrder(order.id, null, db);
    const item = await db.orderItem.findFirstOrThrow({ where: { orderId: order.id } });
    assert.equal((await db.order.findUniqueOrThrow({ where: { id: order.id } })).status, "REFUNDED");
    assert.equal(await authorizeDownload(users[0], item.id, `${prefix}-file`, db), null);
    assert.equal(await authorizeDownload(users[1], item.id, `${prefix}-file`, db), null);
  });

  await t.test("expired checkout capacity is available to another buyer", async () => {
    await clearOrders();
    const first = await prepareCheckout(users[0], randomUUID(), code, true, db);
    await markOrderFailed(first.id, db);
    const second = await prepareCheckout(users[1], randomUUID(), code, true, db);
    assert.equal(second.couponReserved, true);
  });

  await t.test("persisted Stripe request survives a simulated database-write failure", async () => {
    await clearOrders();
    const order = await prepareCheckout(users[0], randomUUID(), null, true, db);
    const s = stripeFixture();
    // Stripe accepted the original request, but the application lost its response.
    await s.gateway.checkout.sessions.create(order.checkoutParameters, { idempotencyKey: `checkout-${order.id}` });
    await continueCheckout(order, db, s.gateway);
    assert.equal(s.sessions.size, 1);
    assert.deepEqual(s.calls[0], s.calls[1]);
  });

  await t.test("shared limiter admits exactly the limit under concurrent requests and resets expired windows", async () => {
    const results = await Promise.all(Array.from({ length: 20 }, () => rateLimit(prefix, 5, 60_000, db)));
    assert.equal(results.filter((result) => result.ok).length, 5);
    assert.ok(results.filter((result) => !result.ok).every((result) => result.retryAfterMs > 0));
    await db.rateLimitBucket.update({ where: { key: createHash("sha256").update(prefix).digest("hex") }, data: { resetAt: new Date(0) } });
    assert.equal((await rateLimit(prefix, 5, 60_000, db)).ok, true);
  });

  await t.test("outbox retries frozen payload, skips active leases, and delivers once across workers", async () => {
    await clearOrders();
    const order = await prepareCheckout(users[0], randomUUID(), code, true, db);
    await fulfillOrder(order.id, null, db);
    let calls = [];
    const fail = async (payload, key) => { calls.push({ payload, key }); throw new Error("provider offline"); };
    assert.equal((await deliverConfirmations(db, fail, 1)).failed, 1);
    const queued = await db.order.findUniqueOrThrow({ where: { id: order.id } });
    assert.equal(queued.status, "PAID");
    assert.equal(queued.confirmationSentAt, null);
    assert.equal(queued.confirmationAttempts, 1);
    assert.ok(queued.confirmationNextAt > new Date());
    await db.user.update({ where: { id: users[0] }, data: { name: "Changed after first attempt" } });
    await db.order.update({ where: { id: order.id }, data: { confirmationNextAt: new Date(0), confirmationLeaseUntil: new Date(Date.now() + 60_000) } });
    const send = async (payload, key) => { calls.push({ payload, key }); };
    assert.deepEqual(await deliverConfirmations(db, send, 1), { sent: 0, failed: 0 });
    await db.order.update({ where: { id: order.id }, data: { confirmationLeaseUntil: new Date(0) } });
    await Promise.all([deliverConfirmations(db, send, 1), deliverConfirmations(db, send, 1)]);
    assert.equal(calls.length, 2);
    assert.deepEqual(calls[0], calls[1]);
    assert.ok((await db.order.findUniqueOrThrow({ where: { id: order.id } })).confirmationSentAt);
    assert.deepEqual(await deliverConfirmations(db, send, 1), { sent: 0, failed: 0 });
  });

  await t.test("exhausted delivery stops retrying and refunded orders are not sent", async () => {
    await clearOrders();
    const order = await prepareCheckout(users[0], randomUUID(), code, true, db);
    await fulfillOrder(order.id, null, db);
    await db.order.update({ where: { id: order.id }, data: { confirmationAttempts: 7 } });
    await deliverConfirmations(db, async () => { throw new Error("offline"); }, 1);
    assert.equal((await db.order.findUniqueOrThrow({ where: { id: order.id } })).confirmationNextAt, null);
    let sends = 0;
    await deliverConfirmations(db, async () => { sends++; }, 1);
    await db.order.update({ where: { id: order.id }, data: { confirmationNextAt: new Date(0) } });
    await markOrderRefunded(order.id, db);
    await deliverConfirmations(db, async () => { sends++; }, 1);
    assert.equal(sends, 0);
  });

  await t.test("verified recipient gets one email per project, and hosting waits for the live URL", async (subtest) => {
    if (!process.env.AUTH_SECRET) {
      process.env.AUTH_SECRET = "test-only-project-delivery-signing-key";
      subtest.after(() => { delete process.env.AUTH_SECRET; });
    }
    await clearOrders();
    await db.deliverableFile.update({ where: { id: `${prefix}-file` }, data: { storageKey: `${prefix}/base-source.zip` } });
    const hostedTier = `${prefix}-hosted-tier`;
    const addon = `${prefix}-hosting`;
    await db.design.create({ data: {
      id: hostingDesignId, slug: hostingDesignId, title: "Hosting fixture", summary: "Test", description: "Test",
      status: "PUBLISHED", categoryId: prefix, heroImage: "/test.webp", deliverables: [],
      tiers: { create: { id: hostedTier, level: "STARTER", name: "Starter", priceCents: 12_000, inclusions: [] } },
      addons: { create: { id: addon, name: "Hosting setup", priceCents: 8_500 } },
    } });
    await db.deliverableFile.create({ data: { designId: hostingDesignId, name: "Hosted ZIP",
      storageKey: `${prefix}/hosted-source.zip`, minTierId: hostedTier } });
    await db.cartItem.create({ data: { userId: users[0], designId: hostingDesignId, tierId: hostedTier, addonIds: [addon] } });
    const deliveryEmail = `delivery-${prefix}@example.com`;
    const options = { method: "GCASH", gcashReady: true, deliveryEmail };
    const submit = methodOptions => prepareCheckout(users[0], randomUUID(), null, true, db, [], false, methodOptions);
    await assert.rejects(submit(options), /Verify your delivery email/);
    await db.checkoutDeliveryVerification.create({ data: { userId: users[0], email: deliveryEmail, codeHash: "fixture",
      expiresAt: new Date(Date.now() + 60_000), verifiedAt: new Date() } });
    const order = await submit(options);
    assert.equal(order.deliveryEmail, deliveryEmail);
    assert.equal(order.paymentMethod, "GCASH");
    assert.equal(order.checkoutParameters.data.attributes.line_items[0].amount, 30_500);
    await assert.rejects(submit({ ...options, method: "STRIPE" }), /Close your pending checkout/);
    const items = await db.orderItem.findMany({ where: { orderId: order.id } });
    const basic = items.find(item => item.designId === designId);
    const hosted = items.find(item => item.designId === hostingDesignId);
    assert.equal(basic.deploymentRequired, false);
    assert.equal(hosted.deploymentRequired, true);

    await fulfillOrder(order.id, null, db);
    const emails = [];
    const send = async (payload, key) => { emails.push({ payload, key }); };
    assert.deepEqual(await deliverProjectEmails(db, send), { sent: 0, failed: 0 });
    assert.equal((await deliverConfirmations(db, send, 1)).sent, 1);
    assert.equal(emails[0].payload.to, deliveryEmail);
    const failed = await deliverProjectEmails(db, async (...args) => { await send(...args); throw new Error("provider unavailable"); });
    assert.equal(failed.failed, 1);
    await db.orderDelivery.update({ where: { orderItemId: basic.id }, data: { emailNextAt: new Date(0) } });
    const retry = await Promise.all([deliverProjectEmails(db, send), deliverProjectEmails(db, send)]);
    assert.equal(retry.reduce((sum, result) => sum + result.sent, 0), 1);
    assert.deepEqual(emails[1], emails[2]);
    assert.doesNotMatch(emails[2].payload.text, /Open your live website/);
    const token = emails[2].payload.text.match(/\/api\/project-delivery\/(\S+)/)[1];
    assert.equal((await findProjectDelivery(token, db)).key, `${prefix}/base-source.zip`);
    assert.equal((await db.orderDelivery.findUniqueOrThrow({ where: { orderItemId: hosted.id } })).emailSentAt, null);
    await db.orderDelivery.update({ where: { orderItemId: hosted.id }, data: { deploymentUrl: "https://published.example.com" } });
    assert.deepEqual(await deliverProjectEmails(db, send), { sent: 1, failed: 0 });
    assert.equal(emails[3].payload.to, deliveryEmail);
    assert.match(emails[3].payload.text, /Open your live website: https:\/\/published\.example\.com/);
    await markOrderRefunded(order.id, db);
    assert.equal(await findProjectDelivery(token, db), null);
  });

  await t.test("existing password account is not adopted by Google", async () => {
    await db.user.update({ where: { id: users[0] }, data: { emailVerified: null, passwordHash: "attacker-controlled-fixture" } });
    assert.equal(await authorizeGoogleAccount({ subject: `${prefix}-google`, email: `${users[0]}@example.com` }, db), false);
    assert.equal(await db.account.count({ where: { userId: users[0] } }), 0);
  });
});
