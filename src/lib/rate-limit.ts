import "server-only";

/**
 * Fixed-window rate limiter kept in process memory.
 *
 * Good enough for a single dev server and as a first line of defence, but on
 * Vercel each function instance has its own memory, so swap this for a shared
 * store (e.g. Upstash Redis) before launch.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 10_000) {
      for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
    }
    return { ok: true, retryAfterMs: 0 };
  }

  bucket.count += 1;
  return bucket.count <= limit
    ? { ok: true, retryAfterMs: 0 }
    : { ok: false, retryAfterMs: bucket.resetAt - now };
}
