import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { test } from "node:test";
import { encodeBase32, totp, matchTotp, encryptMfaSecret, decryptMfaSecret, newRecoveryCodes, recoveryHash } from "../src/lib/mfa-crypto.ts";

test("authenticator implementation matches RFC 6238 SHA-1 vectors", () => {
  const secret = encodeBase32(Buffer.from("12345678901234567890"));
  for (const [seconds, expected] of [[59,"94287082"],[1111111109,"07081804"],[1111111111,"14050471"],[1234567890,"89005924"],[2000000000,"69279037"],[20000000000,"65353130"]]) {
    assert.equal(totp(secret, Math.floor(seconds / 30), 8), expected);
  }
});
test("authenticator windows reject replay, malformed and out-of-window codes", () => {
  const secret = encodeBase32(Buffer.from("12345678901234567890")), step = 500;
  assert.equal(matchTotp(secret, totp(secret, step), -1, step * 30000), step);
  assert.equal(matchTotp(secret, totp(secret, step), step, step * 30000), null);
  assert.equal(matchTotp(secret, totp(secret, step - 1), -1, step * 30000), step - 1);
  assert.equal(matchTotp(secret, totp(secret, step - 3), -1, step * 30000), null);
  for (const code of ["", "abcdef", "1234567", " 123456"]) assert.equal(matchTotp(secret, code), null);
});
test("MFA seeds are encrypted, authenticated and bound to the owning account", t => {
  const original = process.env.MFA_ENCRYPTION_KEY;
  t.after(() => { if (original === undefined) delete process.env.MFA_ENCRYPTION_KEY; else process.env.MFA_ENCRYPTION_KEY = original; });
  process.env.MFA_ENCRYPTION_KEY = randomBytes(32).toString("base64");
  const secret = encodeBase32(randomBytes(20)), value = encryptMfaSecret(secret, "owner");
  assert.ok(!value.includes(secret));
  assert.equal(decryptMfaSecret(value, "owner"), secret);
  assert.notEqual(encryptMfaSecret(secret, "owner"), value);
  assert.throws(() => decryptMfaSecret(value, "other"));
  const parts = value.split(".");
  const bytes = Buffer.from(parts[3], "base64url"); bytes[0] ^= 1; parts[3] = bytes.toString("base64url");
  assert.throws(() => decryptMfaSecret(parts.join("."), "owner"));
  process.env.MFA_ENCRYPTION_KEY = randomBytes(32).toString("base64");
  assert.throws(() => decryptMfaSecret(value, "owner"));
  delete process.env.MFA_ENCRYPTION_KEY;
  assert.throws(() => encryptMfaSecret(secret, "owner"));
});
test("recovery codes have independent entropy and account-scoped hashes", () => {
  const recovery = newRecoveryCodes("owner");
  assert.equal(new Set(recovery.codes).size, 10);
  for (let i = 0; i < 10; i++) {
    assert.match(recovery.codes[i], /^[A-F0-9]{8}(-[A-F0-9]{8}){3}$/);
    assert.equal(recoveryHash("owner", recovery.codes[i].toLowerCase()), recovery.hashes[i]);
    assert.notEqual(recoveryHash("other", recovery.codes[i]), recovery.hashes[i]);
    assert.ok(!recovery.hashes[i].includes(recovery.codes[i]));
  }
});
