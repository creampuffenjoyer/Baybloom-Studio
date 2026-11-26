import type { MetadataRoute } from "next";
import { getPublishedSlugs } from "@/lib/catalog";
import { publicSiteOrigin } from "@/lib/site-origin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = publicSiteOrigin();
  const slugs = await getPublishedSlugs();
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/designs`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/how-it-works`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/custom-websites`, changeFrequency: "monthly", priority: 0.6 },
    ...slugs.map((slug) => ({
      url: `${base}/designs/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    { url: `${base}/credits`, changeFrequency: "monthly", priority: 0.2 },
  ];
}
