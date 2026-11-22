import assert from "node:assert/strict";
import { test } from "node:test";
import { Worker } from "node:worker_threads";
import { zipSync, strToU8 } from "fflate";
import { guardBrowserWrite, readJsonBody } from "../src/lib/request-security.ts";
import { safeCallbackUrl } from "../src/lib/urls.ts";
import { actionEmail } from "../src/lib/email.ts";
import { passwordSchema, loginSchema } from "../src/lib/validators.ts";
import { POST as stripeWebhook } from "../src/app/api/webhooks/stripe/route.ts";
import Stripe from "stripe";
import { consumeToken } from "../src/lib/tokens.ts";

function request(headers = {}, body = "{}") {
  return new Request("http://127.0.0.1:3000/api/cart", { method: "POST", headers: {
    host: "127.0.0.1:3000", origin: "http://127.0.0.1:3000", "content-type": "application/json", ...headers,
  }, body });
}

test("origin guard rejects foreign, same-site sibling and missing browser origins", () => {
  for (const json of [true, false]) {
    for (const origin of ["https://attacker.example", "http://127.0.0.1:3001", "null"]) {
      assert.equal(guardBrowserWrite(request({ origin }), json).status, 403);
    }
    const missing = request();
    missing.headers.delete("origin");
    assert.equal(guardBrowserWrite(missing, json).status, 403);
  }
});

test("JSON guard rejects browser-simple content types and JSON lookalikes", () => {
  for (const contentType of ["text/plain", "application/x-www-form-urlencoded", "multipart/form-data", "application/jsonp", "text/application/json"]) {
    assert.equal(guardBrowserWrite(request({ "content-type": contentType })).status, 415);
  }
  assert.equal(guardBrowserWrite(request({ "content-type": "Application/JSON; charset=utf-8" })), null);
});

test("streaming JSON limits reject oversized declared and undeclared bodies", async () => {
  const declared = await readJsonBody(request({ "content-length": "4097" }));
  assert.equal(declared.ok, false);
  assert.equal(declared.response.status, 413);
  let canceled = false;
  const stream = new ReadableStream({
    pull(controller) { controller.enqueue(new Uint8Array(2048)); },
    cancel() { canceled = true; },
  });
  const chunked = new Request("http://localhost", { method: "POST", body: stream, duplex: "half", headers: { "content-length": "1" } });
  const result = await readJsonBody(chunked);
  assert.equal(result.ok, false);
  assert.equal(result.response.status, 413);
  assert.equal(canceled, true);
});

test("bounded JSON parsing rejects malformed encoding and accepts valid JSON", async () => {
  assert.deepEqual(await readJsonBody(request({}, '{"value":"safe"}')), { ok: true, value: { value: "safe" } });
  for (const body of ["{", "", new Uint8Array([0xff, 0xfe])]) {
    const result = await readJsonBody(request({}, body));
    assert.equal(result.ok, false);
    assert.equal(result.response.status, 400);
  }
});

test("post-login redirects reject URL normalization tricks and preserve local destinations", () => {
  for (const value of ["https://attacker.example", "//attacker.example", "/\\attacker.example", "/\n/attacker.example", "/\t\\attacker.example", "/\r/attacker.example", "/ designs", "javascript:alert(1)", undefined]) {
    assert.equal(safeCallbackUrl(value), "/designs");
  }
  for (const value of ["/account/orders", "/designs?q=spa%20hotel&sort=name"]) assert.equal(safeCallbackUrl(value), value);
});

test("email HTML escapes user-controlled markup and attribute delimiters", () => {
  const payload = '<img src=x onerror="alert(1)">';
  const { html, text } = actionEmail({ heading: payload, body: payload, cta: payload, footer: payload, url: 'https://example.test/?q="<script>' });
  assert.ok(!html.includes(payload));
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;img"));
  assert.ok(text.includes(payload));
});

test("new passwords cannot silently collide at bcrypt's 72-byte boundary", () => {
  assert.equal(passwordSchema.safeParse("abcdefgh123456").success, false);
  assert.equal(passwordSchema.safeParse("a passphrase with spaces").success, true);
  assert.equal(passwordSchema.safeParse("😀".repeat(8)).success, false);
  assert.equal(passwordSchema.safeParse("a".repeat(72)).success, true);
  assert.equal(passwordSchema.safeParse("a".repeat(72) + "different-suffix").success, false);
  assert.equal(passwordSchema.safeParse("😀".repeat(18)).success, true);
  assert.equal(passwordSchema.safeParse("😀".repeat(19)).success, false);
  // Existing hashes remain usable; this change only limits newly set passwords.
  assert.equal(loginSchema.safeParse({ email: "customer@example.test", password: "a".repeat(100) }).success, true);
});

test("concurrent reset-token consumption succeeds once without racing-delete errors", async () => {
  let available = true;
  const row = { id: "token", type: "RESET_PASSWORD", email: "customer@example.test" };
  const client = { verificationToken: {
    findUnique: async () => row,
    deleteMany: async () => { const count = available ? 1 : 0; available = false; return { count }; },
  } };
  const results = await Promise.all(Array.from({ length: 8 }, () => consumeToken("random-test-token", "RESET_PASSWORD", client)));
  assert.equal(results.filter(Boolean).length, 1);
  assert.equal(await consumeToken("random-test-token", "VERIFY_EMAIL", client), null);
});

test("Stripe webhook authenticates exact bounded bytes and rejects forgeries", async (t) => {
  const originalKey = process.env.STRIPE_SECRET_KEY, originalSecret = process.env.STRIPE_WEBHOOK_SECRET;
  process.env.STRIPE_SECRET_KEY = "sk_test_security_fixture";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_security_fixture_only";
  t.after(() => {
    if (originalKey === undefined) delete process.env.STRIPE_SECRET_KEY; else process.env.STRIPE_SECRET_KEY = originalKey;
    if (originalSecret === undefined) delete process.env.STRIPE_WEBHOOK_SECRET; else process.env.STRIPE_WEBHOOK_SECRET = originalSecret;
  });
  const payload = JSON.stringify({ id: "evt_security_fixture", object: "event", type: "audit.unsupported", data: { object: {} } });
  const signature = Stripe.webhooks.generateTestHeaderString({ payload, secret: process.env.STRIPE_WEBHOOK_SECRET });
  const send = (body, value = signature) => stripeWebhook(new Request("http://localhost/api/webhooks/stripe", { method: "POST", headers: { "stripe-signature": value }, body }));
  assert.equal((await send(payload)).status, 200);
  assert.equal((await send(`${payload} `)).status, 400);
  assert.equal((await send(payload, "forged")).status, 400);
  assert.equal((await send("x".repeat(1024 * 1024 + 1))).status, 413);
});

test("malformed ZIP64 parsing terminates without blocking the package worker", { timeout: 10000 }, async () => {
  const archive = zipSync({ "test.txt": strToU8("test") });
  const view = new DataView(archive.buffer, archive.byteOffset, archive.byteLength);
  let directory = -1;
  for (let i = 0; i < archive.length - 4; i++) if (view.getUint32(i, true) === 0x02014b50) { directory = i; break; }
  assert.ok(directory >= 0);
  view.setUint32(directory + 20, 0xffffffff, true);
  const worker = new Worker(`const {parentPort,workerData}=require("node:worker_threads"); const {unzipSync}=require("fflate"); try { unzipSync(workerData); parentPort.postMessage("returned"); } catch { parentPort.postMessage("rejected"); }`, { eval: true, workerData: archive });
  try {
    const result = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("ZIP parser blocked on malformed ZIP64 input")), 5000);
      worker.once("message", (value) => { clearTimeout(timer); resolve(value); });
      worker.once("error", (error) => { clearTimeout(timer); reject(error); });
    });
    assert.ok(["returned", "rejected"].includes(result));
  } finally { await worker.terminate(); }
});
