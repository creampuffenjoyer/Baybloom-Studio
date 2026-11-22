// Explicit preload used by the isolated production browser harness only.
// Application code has no environment switch that bypasses password screening.
import { createHash } from "node:crypto";
const digest = createHash("sha1").update("passwordpassword").digest("hex").toUpperCase();
const unavailable = createHash("sha1").update("Unavailable fixture password").digest("hex").toUpperCase();
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
  if (url.origin === "https://api.pwnedpasswords.com") {
    if (url.pathname.endsWith(unavailable.slice(0, 5))) return new Response("", { status: 503 });
    const row = url.pathname.endsWith(digest.slice(0, 5)) ? `${digest.slice(5)}:123` : `${"A".repeat(35)}:0`;
    return new Response(row, { headers: { "Content-Type": "text/plain" } });
  }
  return realFetch(input, init);
};
