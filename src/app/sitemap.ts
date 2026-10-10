import type { MetadataRoute } from "next";
import { getPublishedSlugs } from "@/lib/catalog";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getPublishedSlugs();
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/designs`, changeFrequency: "daily", priority: 0.9 },
    ...slugs.map((slug) => ({
      url: `${base}/designs/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    { url: `${base}/credits`, changeFrequency: "monthly", priority: 0.2 },
  ];
}
