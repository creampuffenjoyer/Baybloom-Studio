/** Validate browser origin against the requested public host, not Next's internal URL. */
export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded && forwarded !== "http" && forwarded !== "https") return false;
  try {
    const protocol = forwarded ? `${forwarded}:` : new URL(request.url).protocol;
    if (protocol !== "http:" && protocol !== "https:") return false;
    const expected = new URL(`${protocol}//${host}`);
    if (expected.username || expected.password || expected.pathname !== "/" || expected.search || expected.hash) return false;
    return new URL(origin).origin === origin && expected.origin === origin;
  } catch { return false; }
}

export function isSameOriginJsonRequest(request: Request): boolean {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  return contentType === "application/json" && isSameOriginRequest(request);
}
