import assert from "node:assert/strict";
import { test } from "node:test";
import { isSameOriginJsonRequest, isSameOriginRequest } from "../src/lib/personalization/request.ts";
import { isHarborRoomImageKey } from "../src/lib/personalization/harbor-room-images.ts";

function request(overrides = {}) {
  return new Request("http://localhost:3000/api/personalization/harbor-house", {
    method: "PUT",
    headers: { origin: "http://127.0.0.1:3000", host: "127.0.0.1:3000", "x-forwarded-proto": "http", "content-type": "application/json", ...overrides },
    body: "{}",
  });
}

test("accepts the public host even when Next normalizes its internal URL", () => {
  assert.equal(isSameOriginJsonRequest(request()), true);
});

test("rejects cross-origin, malformed, and non-JSON requests", () => {
  assert.equal(isSameOriginJsonRequest(request({ origin: "https://attacker.example" })), false);
  assert.equal(isSameOriginJsonRequest(request({ origin: "http://127.0.0.1:3001" })), false);
  assert.equal(isSameOriginJsonRequest(request({ "content-type": "application/jsonp" })), false);
  assert.equal(isSameOriginJsonRequest(request({ "x-forwarded-proto": "https,http" })), false);
  assert.equal(isSameOriginJsonRequest(request({ host: "attacker.example/path" })), false);
});

test("room photo requests require the same origin and a known room", () => {
  assert.equal(isSameOriginRequest(request({ "content-type": "image/png" })), true);
  assert.equal(isSameOriginRequest(request({ origin: "https://attacker.example", "content-type": "image/png" })), false);
  assert.equal(isHarborRoomImageKey("lighthouse-room"), true);
  assert.equal(isHarborRoomImageKey("../../photo"), false);
});
