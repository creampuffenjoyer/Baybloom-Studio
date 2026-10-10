/** Only allow same-site relative paths as post-login redirects. */
export function safeCallbackUrl(value: unknown, fallback = "/designs"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return value;
}

export function loginHref(callbackUrl?: string) {
  return callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login";
}
