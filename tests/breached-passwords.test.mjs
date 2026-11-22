import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { checkBreachedPassword } from "../src/lib/breached-passwords.ts";

const password = "a test passphrase with spaces";
const digest = createHash("sha1").update(password).digest("hex").toUpperCase();

test("password range lookup transmits only a padded five-character prefix", async () => {
  const result = await checkBreachedPassword(password, async (url, init) => {
    assert.equal(url, `https://api.pwnedpasswords.com/range/${digest.slice(0, 5)}`);
    assert.equal(init.headers["Add-Padding"], "true");
    assert.equal(init.cache, "no-store");
    assert.equal(init.redirect, "error");
    assert.ok(init.signal instanceof AbortSignal);
    assert.equal(init.body, undefined);
    assert.ok(!JSON.stringify(init).includes(password));
    assert.ok(!JSON.stringify(init).includes(digest.slice(5)));
    return new Response(`${digest.slice(5)}:15\r\n${"A".repeat(35)}:0\r\n`);
  });
  assert.equal(result, "breached");
});
test("zero-count padding is ignored and absent hashes pass", async () => {
  assert.equal(await checkBreachedPassword(password, async () => new Response(`${digest.slice(5)}:0`)), "clear");
  assert.equal(await checkBreachedPassword(password, async () => new Response(`${"B".repeat(35)}:10`)), "clear");
});
test("provider errors, redirects, empty and malformed ranges fail closed", async () => {
  for (const response of [new Response("", { status: 503 }), new Response("", { status: 302 }), new Response(""), new Response("<html>failure</html>"), new Response(`${digest.slice(5)}:4\njunk`)]) {
    assert.equal(await checkBreachedPassword(password, async () => response), "unavailable");
  }
  assert.equal(await checkBreachedPassword(password, async () => { throw new DOMException("timed out", "TimeoutError"); }), "unavailable");
});
test("oversized streamed ranges are canceled and never treated as a clean password", async () => {
  let canceled = false;
  const body = new ReadableStream({ pull(controller) { controller.enqueue(new Uint8Array(512 * 1024)); }, cancel() { canceled = true; } });
  assert.equal(await checkBreachedPassword(password, async () => new Response(body)), "unavailable");
  assert.equal(canceled, true);
});
