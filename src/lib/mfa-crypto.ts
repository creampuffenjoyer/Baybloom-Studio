import "server-only";
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
export function encodeBase32(bytes: Uint8Array) {
  let bits = 0, value = 0, result = "";
  for (const byte of bytes) {
    value = (value << 8) | byte; bits += 8;
    while (bits >= 5) { result += alphabet[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits) result += alphabet[(value << (5 - bits)) & 31];
  return result;
}
function decodeBase32(secret: string) {
  if (!/^[A-Z2-7]+$/.test(secret)) throw new Error("Invalid authenticator secret.");
  let bits = 0, value = 0;
  const bytes = [];
  for (const char of secret) {
    value = (value << 5) | alphabet.indexOf(char); bits += 5;
    if (bits >= 8) { bytes.push((value >>> (bits - 8)) & 255); bits -= 8; }
  }
  return Buffer.from(bytes);
}
export const newMfaSecret = () => encodeBase32(randomBytes(20));
export function totp(secret: string, step: number, digits = 6) {
  if (!Number.isSafeInteger(step) || step < 0 || ![6, 8].includes(digits)) throw new Error("Invalid authenticator parameters.");
  const counter = Buffer.alloc(8); counter.writeBigUInt64BE(BigInt(step));
  const mac = createHmac("sha1", decodeBase32(secret)).update(counter).digest();
  const offset = mac[mac.length - 1] & 15;
  return ((mac.readUInt32BE(offset) & 0x7fffffff) % 10 ** digits).toString().padStart(digits, "0");
}
export function matchTotp(secret: string, code: string, lastStep = -1, now = Date.now()) {
  if (!/^\d{6}$/.test(code)) return null;
  const current = Math.floor(now / 30_000);
  for (const step of [current, current - 1, current + 1]) {
    if (step >= 0 && step > lastStep && timingSafeEqual(Buffer.from(totp(secret, step)), Buffer.from(code))) return step;
  }
  return null;
}
function key() {
  const value = process.env.MFA_ENCRYPTION_KEY;
  if (!value || !/^[A-Za-z0-9+/]{43}=$/.test(value) || Buffer.from(value, "base64").length !== 32) throw new Error("MFA encryption key is not configured.");
  return Buffer.from(value, "base64");
}
export function encryptMfaSecret(secret: string, userId: string) {
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), nonce);
  cipher.setAAD(Buffer.from(`baybloom:mfa:v1:${userId}`));
  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  return ["v1", nonce.toString("base64url"), cipher.getAuthTag().toString("base64url"), encrypted.toString("base64url")].join(".");
}
export function decryptMfaSecret(encrypted: string, userId: string) {
  const [version, nonce, tag, value, extra] = encrypted.split(".");
  if (version !== "v1" || !nonce || !tag || !value || extra !== undefined) throw new Error("Invalid MFA secret envelope.");
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(nonce, "base64url"));
  decipher.setAAD(Buffer.from(`baybloom:mfa:v1:${userId}`));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(value, "base64url")), decipher.final()]).toString("utf8");
}
export function recoveryHash(userId: string, code: string) {
  return createHash("sha256").update(`${userId}:${code.replace(/[-\s]/g, "").toUpperCase()}`).digest("hex");
}
export function newRecoveryCodes(userId: string) {
  const codes = Array.from({ length: 10 }, () => randomBytes(16).toString("hex").toUpperCase().match(/.{8}/g)!.join("-"));
  return { codes, hashes: codes.map(code => recoveryHash(userId, code)) };
}
