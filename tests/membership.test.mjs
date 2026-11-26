import assert from "node:assert/strict";
import test from "node:test";
import {DESIGNS, CATEGORIES} from "../prisma/catalog.ts";
import {regularTemplate} from "../src/lib/membership-plans.ts";
import {checkoutParameters, membershipCheckout, syncMembership, refundMembership} from "../src/lib/membership-payment.ts";

test("every genre has one or two Regular templates and new releases default to Premium", () => {
  for (const category of CATEGORIES) {
    const free = DESIGNS.filter(d => d.category === category.slug && regularTemplate(d.slug));
    assert.ok(free.length >= 1 && free.length <= 2, category.slug);
  }
  assert.equal(regularTemplate("new-release"), false);
});

function fixture() {
  let row;
  const sessions = new Map();
  const client = {membershipPayment: {
    upsert: async ({create}) => {
      if (!row?.activeKey) row = {...create, sessionId: null, createdAt: new Date(), status: "PENDING"};
      return structuredClone(row);
    },
    findUniqueOrThrow: async () => structuredClone(row),
    updateMany: async ({where, data}) => {
      if (where.id !== row.id || (where.userId && where.userId !== row.userId)) return {count: 0};
      const statuses = typeof where.status === "string" ? [where.status] : where.status.in;
      if (!statuses.includes(row.status)) return {count: 0};
      Object.assign(row, data);
      return {count: 1};
    },
  }};
  const gateway = {checkout: {sessions: {
    create: async (p, {idempotencyKey}) => {
      if (!sessions.has(idempotencyKey)) sessions.set(idempotencyKey, {id: "cs_1", status: "open", mode: p.mode,
        payment_status: "unpaid", currency: "usd", amount_total: 1000, metadata: p.metadata,
        client_reference_id: p.client_reference_id, url: "https://checkout.stripe.test/one"});
      return sessions.get(idempotencyKey);
    },
    retrieve: async (id) => [...sessions.values()].find(s => s.id === id),
  }}};
  return {client, gateway, sessions, get row() {return row;}};
}

test("checkout is a single USD payment and concurrent requests share a checkout", async () => {
  const params = checkoutParameters("attempt", "member", null, new Date());
  assert.equal(params.mode, "payment");
  assert.equal(params.line_items[0].price_data.currency, "usd");
  assert.equal(params.line_items[0].price_data.unit_amount, 1000);
  assert.equal(params.line_items[0].price_data.recurring, undefined);
  const f = fixture();
  const start = () => membershipCheckout("member", null, f.client, f.gateway);
  const [a,b] = await Promise.all([start(), start()]);
  assert.equal(a,b);
  assert.equal(f.sessions.size, 1);
  assert.equal(f.row.status, "PENDING");
  const session = [...f.sessions.values()][0];
  for (const change of [{mode: "subscription"}, {currency: "php"}, {amount_total: 1}, {id: "wrong"},
    {metadata: {...session.metadata, userId: "other"}}, {client_reference_id: "wrong"}]) {
    await assert.rejects(syncMembership({...session, ...change}, f.client));
  }
  const paid = {...session, status: "complete", payment_status: "paid"};
  await syncMembership(paid, f.client);
  await syncMembership(paid, f.client);
  assert.equal(await start(), "/membership");
  assert.equal(f.row.status, "PAID");
  await syncMembership({...session, status: "expired"}, f.client);
  assert.equal(f.row.status, "PAID");
  await refundMembership(session.metadata, f.client);
  await syncMembership(paid, f.client);
  assert.equal(f.row.status, "REFUNDED");
  assert.equal(f.row.activeKey, null);
});

test("unpaid expiry releases the checkout and an early full refund cannot be undone by a delayed completion", async () => {
  for (const terminal of ["FAILED", "REFUNDED"]) {
    const f = fixture();
    await membershipCheckout("member", null, f.client, f.gateway);
    const session = [...f.sessions.values()][0];
    if (terminal === "FAILED") await syncMembership({...session, status: "expired"}, f.client);
    else await refundMembership(session.metadata, f.client);
    await syncMembership({...session, status: "complete", payment_status: "paid"}, f.client);
    assert.equal(f.row.status, terminal);
    assert.equal(f.row.activeKey, null);
  }
});
