import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequestQueue } from "../src/lib/request-queue.ts";
import { rateLimit } from "../src/lib/rate-limit.ts";
import { POST } from "../src/app/api/jobs/maintenance/route.ts";
import { commerceFixture } from "./helpers/commerce.mjs";
import { prepareCheckout } from "../src/lib/checkout.ts";
import { fulfillOrder } from "../src/lib/orders.ts";
import { deliverConfirmations } from "../src/lib/confirmation-outbox.ts";

test("cart operations retain invocation order and recover after network rejection", async () => {
  const queue = createRequestQueue();
  const events = [];
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const first = queue(async () => { events.push("first-start"); await gate; throw new Error("network"); });
  const failed = assert.rejects(first, /network/);
  const second = queue(async () => { events.push("second"); return "updated cart"; });
  await Promise.resolve();
  assert.deepEqual(events, ["first-start"]);
  release();
  await failed;
  assert.equal(await second, "updated cart");
  assert.deepEqual(events, ["first-start", "second"]);
});

test("limiter does not allow requests when its shared store fails", async () => {
  await assert.rejects(rateLimit("test", 1, 1000, { $queryRaw: async () => { throw new Error("offline"); } }), /offline/);
});

test("maintenance refuses absent configuration and invalid credentials before database work", async (t) => {
  const original = process.env.MAINTENANCE_SECRET;
  t.after(() => { if (original === undefined) delete process.env.MAINTENANCE_SECRET; else process.env.MAINTENANCE_SECRET = original; });
  delete process.env.MAINTENANCE_SECRET;
  assert.equal((await POST(new Request("http://localhost/api/jobs/maintenance", { method: "POST" }))).status, 503);
  process.env.MAINTENANCE_SECRET = "a".repeat(32);
  for (const authorization of ["", "Bearer wrong", `Bearer ${"b".repeat(32)}`]) {
    assert.equal((await POST(new Request("http://localhost/api/jobs/maintenance", { method: "POST", headers: { authorization } }))).status, 401);
  }
});

async function outboxFixture() {
  const f = commerceFixture();
  const order = await prepareCheckout("alice", "outbox-request", "LAST", true, f.client);
  await fulfillOrder(order.id, null, f.client);
  f.client.$queryRaw = async (sql) => {
    if (!sql.join("").includes('"confirmationNextAt"')) return [];
    const row = f.state().orders.find((o) => o.status === "PAID" && !o.confirmationSentAt && o.confirmationAttempts < 8 &&
      o.confirmationNextAt && o.confirmationNextAt <= new Date() && (!o.confirmationLeaseUntil || o.confirmationLeaseUntil < new Date()));
    return row ? [{ id: row.id }] : [];
  };
  const update = f.client.order.update;
  f.client.order.update = async (args) => {
    const row = f.state().orders.find((o) => o.id === args.where.id);
    if (args.data.confirmationAttempts?.increment) {
      args.data.confirmationAttempts = row.confirmationAttempts + args.data.confirmationAttempts.increment;
    }
    return update(args);
  };
  return { ...f, order: () => f.state().orders[0] };
}

test("paid transition durably queues email; failure retries the same payload and key", async () => {
  const f = await outboxFixture();
  assert.ok(f.order().confirmationNextAt);
  assert.equal(f.order().confirmationSentAt, null);
  const calls = [];
  await deliverConfirmations(f.client, async (payload, key) => { calls.push({ payload, key }); throw new Error("offline"); }, 1);
  assert.equal(f.order().status, "PAID");
  assert.equal(f.order().confirmationSentAt, null);
  assert.equal(f.order().confirmationAttempts, 1);
  assert.ok(f.order().confirmationNextAt > new Date());
  f.order().confirmationNextAt = new Date(0);
  f.state().users[0].name = "Changed name";
  await deliverConfirmations(f.client, async (payload, key) => { calls.push({ payload, key }); }, 1);
  assert.deepEqual(calls[0], calls[1]);
  assert.ok(f.order().confirmationSentAt);
  assert.deepEqual(await deliverConfirmations(f.client, async () => assert.fail("already sent")), { sent: 0, failed: 0 });
});

test("active leases defer delivery; expired leases recover crashed workers", async () => {
  const f = await outboxFixture();
  f.order().confirmationLeaseUntil = new Date(Date.now() + 60_000);
  assert.deepEqual(await deliverConfirmations(f.client, async () => assert.fail("leased"), 1), { sent: 0, failed: 0 });
  f.order().confirmationLeaseUntil = new Date(0);
  assert.equal((await deliverConfirmations(f.client, async () => {}, 1)).sent, 1);
});

test("delivery exhaustion stops automatic retries without changing paid status", async () => {
  const f = await outboxFixture();
  f.order().confirmationAttempts = 7;
  await deliverConfirmations(f.client, async () => { throw new Error("offline"); }, 1);
  assert.equal(f.order().confirmationAttempts, 8);
  assert.equal(f.order().confirmationNextAt, null);
  assert.equal(f.order().status, "PAID");
  assert.deepEqual(await deliverConfirmations(f.client, async () => assert.fail("exhausted"), 1), { sent: 0, failed: 0 });
});
