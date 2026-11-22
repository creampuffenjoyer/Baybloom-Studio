import { createHmac } from "node:crypto";
export function authenticatorCode(secret, now = Date.now()) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const bits = [...secret].map(char => alphabet.indexOf(char).toString(2).padStart(5, "0")).join("");
  const bytes = Buffer.from(bits.match(/.{8}/g).map(byte => parseInt(byte, 2)));
  const message = Buffer.alloc(8); message.writeBigUInt64BE(BigInt(Math.floor(now / 30000)));
  const digest = createHmac("sha1", bytes).update(message).digest();
  return ((digest.readUInt32BE(digest[19] & 15) & 0x7fffffff) % 1000000).toString().padStart(6, "0");
}
