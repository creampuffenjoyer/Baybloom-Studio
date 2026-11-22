import "server-only";
import { createHash } from "node:crypto";

export const BREACHED_PASSWORD_MESSAGE = "This password appears in known data breaches. Choose a different passphrase.";
export const PASSWORD_CHECK_UNAVAILABLE = "We couldn't check this password right now. Please try again shortly.";

/** Submit-time only. Never send/log the password, full hash, email or suffix. */
export async function checkBreachedPassword(password: string, fetcher: typeof fetch = fetch): Promise<"clear" | "breached" | "unavailable"> {
  const digest = createHash("sha1").update(password, "utf8").digest("hex").toUpperCase();
  try {
    const response = await fetcher(`https://api.pwnedpasswords.com/range/${digest.slice(0, 5)}`, {
      headers: { "Add-Padding": "true", "User-Agent": "Baybloom-Password-Screening" },
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(4000),
    });
    if (response.status !== 200 || !response.body) return "unavailable";
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 1024 * 1024) { await reader.cancel(); return "unavailable"; }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
    const text = new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks));
    const lines = text.trim().split(/\r?\n/);
    let breached = false;
    for (const line of lines) {
      const match = /^([A-F0-9]{35}):(\d+)$/.exec(line);
      if (!match) return "unavailable";
      if (match[1] === digest.slice(5) && /[1-9]/.test(match[2])) breached = true;
    }
    return breached ? "breached" : "clear";
  } catch { return "unavailable"; }
}
