import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The isolated browser integration harness owns this separate build cache.
  ...(process.env.BAYBLOOM_PERSONALIZATION_TEST === "1" ? {
    distDir: ".next/personalization-e2e",
    typescript: { tsconfigPath: ".next/personalization-e2e-config/tsconfig.json" },
  } : {}),
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Content-Security-Policy", value: "base-uri 'self'; object-src 'none'; frame-ancestors 'self'" },
      ...(process.env.NODE_ENV === "production" ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }] : []),
    ] }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
