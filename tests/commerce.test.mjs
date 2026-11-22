import assert from "node:assert/strict";
import { test } from "node:test";
import { prepareCheckout } from "../src/lib/checkout.ts";
import { continueCheckout, ExpiredCheckoutError, reconcileExpiredCheckouts } from "../src/lib/checkout-payment.ts";
import { fulfillOrder, markOrderFailed, markOrderRefunded } from "../src/lib/orders.ts";
import { syncCheckoutSession } from "../src/lib/stripe-orders.ts";
import { commerceFixture, stripeFixture } from "./helpers/commerce.mjs";
import { activeRelease } from "./helpers/template-release.mjs";

test("competing buyers cannot both claim the last coupon slot", async () => {
  const f = commerceFixture();
  const results = await Promise.allSettled([
    prepareCheckout("alice", "a", "LAST", true, f.client),
    prepareCheckout("bob", "b", "LAST", true, f.client),
  ]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(f.state().orders.length, 1);
  assert.equal(f.state().orders[0].couponReserved, true);
});

test("retries and independent tabs share one reservation and frozen order", async () => {
  const f = commerceFixture();
  const original = await prepareCheckout("alice", "first", "LAST", true, f.client);
  const retry = await prepareCheckout("alice", "first", "LAST", true, f.client);
  const tab = await prepareCheckout("alice", "second", "LAST", true, f.client);
  assert.equal(original.id, retry.id);
  assert.equal(original.id, tab.id);
  assert.equal(f.state().orders.length, 1);
  assert.equal(f.state().requests.length, 2);
});

test("checkout freezes the saved Harbor House draft and retries keep the original", async () => {
  const f = commerceFixture();
  f.state().cart[0].design.slug = "harbor-house";
  let draft = { content: { version: 1, template: "harbor-house", business: { name: "First" }, home: {}, theme: {} }, heroImage: null, images: [] };
  f.client.personalizationDraft = { findUnique: async () => structuredClone(draft) };
  f.client.activeTemplateRelease = { findUnique: async () => activeRelease("harbor-house") };
  const first = await prepareCheckout("alice", "first", null, true, f.client, ["harbor-house"], true);
  draft.content.business.name = "Changed";
  const retry = await prepareCheckout("alice", "first", null, true, f.client, ["harbor-house"], true);
  const second = await prepareCheckout("alice", "second", null, true, f.client, ["harbor-house"], true);
  assert.equal(retry.id, first.id);
  assert.notEqual(second.id, first.id);
  assert.equal(f.state().orders[0].items[0].personalization.create.content.business.name, "First");
  assert.equal(f.state().orders[1].items[0].personalization.create.content.business.name, "Changed");
});

test("zero-total retries work after the cart is cleared and redeem exactly once", async () => {
  const f = commerceFixture();
  const order = await prepareCheckout("alice", "first", "LAST", false, f.client);
  // Skip email transport in this lifecycle test by simulating an already claimed confirmation.
  f.state().orders[0].confirmationSentAt = new Date();
  await continueCheckout(order, f.client);
  const retry = await prepareCheckout("alice", "first", null, false, f.client);
  await continueCheckout(retry, f.client);
  assert.equal(retry.status, "PAID");
  assert.equal(f.state().coupon.redemptions, 1);
  assert.equal(f.state().orders[0].couponReserved, false);
  assert.equal(f.state().cart.some((i) => i.userId === "alice"), false);
});

test("a failed session releases capacity and does not recycle the same client key", async () => {
  const f = commerceFixture();
  const order = await prepareCheckout("alice", "first", "LAST", true, f.client);
  await markOrderFailed(order.id, f.client);
  const failed = await prepareCheckout("alice", "first", "LAST", true, f.client);
  await assert.rejects(continueCheckout(failed, f.client), ExpiredCheckoutError);
  await prepareCheckout("bob", "second", "LAST", true, f.client);
  assert.equal(f.state().orders.length, 2);
});

test("refund before completion is terminal and does not grant a downloadable order", async () => {
  const f = commerceFixture();
  const order = await prepareCheckout("alice", "first", "LAST", true, f.client);
  await markOrderRefunded(order.id, f.client);
  assert.equal(await fulfillOrder(order.id, null, f.client), false);
  await markOrderFailed(order.id, f.client);
  assert.equal(f.state().orders[0].status, "REFUNDED");
  assert.equal(f.state().orders[0].couponReserved, false);
  assert.equal(f.state().coupon.redemptions, 0);
});

test("a lost paymentRef write retries Stripe with the identical request and key", async () => {
  const f = commerceFixture();
  const s = stripeFixture();
  const order = await prepareCheckout("alice", "first", null, true, f.client);
  f.failNextPaymentRef();
  await assert.rejects(continueCheckout(order, f.client, s.gateway), /connection lost/);
  assert.equal(await continueCheckout(order, f.client, s.gateway), "https://checkout.stripe.com/test");
  assert.deepEqual(s.calls[0], s.calls[1]);
  assert.equal(s.sessions.size, 1);
  assert.equal(f.state().orders.length, 1);
});

test("a refunded current Stripe charge wins over a paid checkout session", async () => {
  const f = commerceFixture();
  const order = await prepareCheckout("alice", "first", null, true, f.client);
  await syncCheckoutSession({
    id: "cs_paid", metadata: { orderId: order.id, userId: "alice" },
    amount_total: order.totalCents, currency: "php", payment_status: "paid", payment_intent: "pi_paid",
  }, f.client, { paymentIntents: { retrieve: async () => ({ latest_charge: { refunded: true } }) } });
  assert.equal(f.state().orders[0].status, "REFUNDED");
});

test("payment reconciliation rejects a mismatched amount or buyer", async () => {
  const f = commerceFixture();
  const order = await prepareCheckout("alice", "first", null, true, f.client);
  for (const [userId, amount] of [["bob", order.totalCents], ["alice", order.totalCents - 1]]) {
    await assert.rejects(syncCheckoutSession({
      id: "cs_wrong", metadata: { orderId: order.id, userId },
      amount_total: amount, currency: "php", payment_status: "paid",
    }, f.client), /does not match/);
  }
  assert.equal(f.state().orders[0].status, "PENDING");
  assert.equal(f.state().orders[0].paymentRef, null);
});

test("Stripe API uncertainty never releases an expired coupon reservation", async () => {
  const f = commerceFixture({ percentOff: 10 });
  await prepareCheckout("alice", "first", "LAST", true, f.client);
  f.state().orders[0].checkoutExpiresAt = new Date(Date.now() - 10 * 60_000);
  await reconcileExpiredCheckouts(f.client, {
    checkout: { sessions: { list: () => ({ autoPagingEach: async () => { throw new Error("offline"); } }) } },
  });
  assert.equal(f.state().orders[0].couponReserved, true);
  assert.equal(f.state().orders[0].status, "PENDING");
});

test("an expired attempt with confirmed absence of a Stripe session releases capacity", async () => {
  const f = commerceFixture({ percentOff: 10 });
  const s = stripeFixture();
  await prepareCheckout("alice", "first", "LAST", true, f.client);
  f.state().orders[0].checkoutExpiresAt = new Date(Date.now() - 10 * 60_000);
  await reconcileExpiredCheckouts(f.client, s.gateway);
  assert.equal(f.state().orders[0].couponReserved, false);
  assert.equal(f.state().orders[0].status, "FAILED");
});

test("the same client key cannot recover another buyer's order", async () => {
  const f = commerceFixture();
  const a = await prepareCheckout("alice", "same", null, true, f.client);
  const b = await prepareCheckout("bob", "same", null, true, f.client);
  assert.notEqual(a.id, b.id);
});

test("a retry preserves its original prices even after the catalog changes", async () => {
  const f = commerceFixture();
  const original = await prepareCheckout("alice", "first", null, true, f.client);
  f.state().cart[0].tier.priceCents = 20000;
  const retry = await prepareCheckout("alice", "first", null, true, f.client);
  assert.equal(retry.id, original.id);
  assert.equal(retry.totalCents, 10000);
  assert.deepEqual(retry.checkoutParameters, original.checkoutParameters);
});

test("database row ordering and display-copy changes do not create duplicate checkouts", async () => {
  const f = commerceFixture();
  const second = structuredClone(f.state().cart[0]);
  second.id = "cart-alice-second";
  second.design.id = "design-second";
  second.tier.designId = second.design.id;
  second.tier.id = "tier-second";
  f.state().cart.push(second);
  const original = await prepareCheckout("alice", "first", null, true, f.client);
  f.state().cart.reverse();
  f.state().cart.find((row) => row.id === "cart-alice").design.title = "New display title";
  const otherTab = await prepareCheckout("alice", "second", null, true, f.client);
  assert.equal(otherTab.id, original.id);
});

test("a late failure cannot regress an already paid order or its coupon redemption", async () => {
  const f = commerceFixture();
  const order = await prepareCheckout("alice", "first", "LAST", true, f.client);
  f.state().orders[0].confirmationSentAt = new Date();
  await fulfillOrder(order.id, null, f.client);
  await markOrderFailed(order.id, f.client);
  assert.equal(f.state().orders[0].status, "PAID");
  assert.equal(f.state().coupon.redemptions, 1);
});

test("reconciliation recovers a lost Stripe session id before releasing its slot", async () => {
  const f = commerceFixture();
  const s = stripeFixture();
  const order = await prepareCheckout("alice", "first", null, true, f.client);
  const session = await s.gateway.checkout.sessions.create(order.checkoutParameters, { idempotencyKey: `checkout-${order.id}` });
  session.status = "expired";
  f.state().orders[0].checkoutExpiresAt = new Date(Date.now() - 10 * 60_000);
  await reconcileExpiredCheckouts(f.client, s.gateway);
  assert.equal(f.state().orders[0].paymentRef, session.id);
  assert.equal(f.state().orders[0].status, "FAILED");
});
