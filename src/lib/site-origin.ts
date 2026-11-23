import "server-only";

export function railwayPublicOrigin() {
  const domain = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();
  return domain ? `https://${domain}` : undefined;
}

export function publicSiteOrigin() {
  return new URL(process.env.NEXT_PUBLIC_SITE_URL || railwayPublicOrigin() || "http://localhost:3000").origin;
}
