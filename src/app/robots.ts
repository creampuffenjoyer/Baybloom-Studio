import type { MetadataRoute } from "next";
import { publicSiteOrigin } from "@/lib/site-origin";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/login", "/register"] },
    sitemap: `${publicSiteOrigin()}/sitemap.xml`,
  };
}
