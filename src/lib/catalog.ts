import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Prisma, ProductType, TierLevel } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { PAGE_SIZE, type CatalogQuery } from "@/lib/validators";

/*
 * Price gating (spec §6): nothing in this file's public functions selects a
 * price column. Prices are only read by the functions under "Gated pricing",
 * which check the session before touching the cached price lookups.
 */

const TIER_ORDER: TierLevel[] = ["STARTER", "STANDARD", "PREMIUM"];

const cardSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  type: true,
  featured: true,
  heroImage: true,
  heroAlt: true,
  category: { select: { name: true, slug: true } },
  style: { select: { name: true, slug: true } },
  tiers: { select: { level: true } },
} satisfies Prisma.DesignSelect;

type CardRow = Prisma.DesignGetPayload<{ select: typeof cardSelect }>;

export type DesignCard = Omit<CardRow, "tiers"> & {
  tierLevels: TierLevel[];
  /** Highest tier offered, shown as the card badge. */
  topTier: TierLevel | null;
};

function toCard({ tiers, ...rest }: CardRow): DesignCard {
  const tierLevels = TIER_ORDER.filter((l) => tiers.some((t) => t.level === l));
  return { ...rest, tierLevels, topTier: tierLevels.at(-1) ?? null };
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export async function getFilterOptions() {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");

  const [categories, styles, features] = await Promise.all([
    db.category.findMany({
      orderBy: { position: "asc" },
      select: { name: true, slug: true },
    }),
    db.style.findMany({
      orderBy: { position: "asc" },
      select: { name: true, slug: true },
    }),
    db.feature.findMany({
      orderBy: [{ group: "asc" }, { name: "asc" }],
      select: { name: true, slug: true, group: true, appliesTo: true },
    }),
  ]);
  return { categories, styles, features };
}

export type FilterOptions = Awaited<ReturnType<typeof getFilterOptions>>;

// ─── Catalog search ──────────────────────────────────────────────────────────

function buildWhere(q: CatalogQuery): Prisma.DesignWhereInput {
  const and: Prisma.DesignWhereInput[] = [{ status: "PUBLISHED" }];
  if (q.type.length) and.push({ type: { in: q.type } });
  if (q.category.length) and.push({ category: { slug: { in: q.category } } });
  if (q.style.length) and.push({ style: { slug: { in: q.style } } });
  if (q.tier.length) and.push({ tiers: { some: { level: { in: q.tier } } } });
  for (const slug of q.features) {
    and.push({ features: { some: { feature: { slug } } } });
  }
  if (q.q) {
    const contains = { contains: q.q, mode: "insensitive" as const };
    and.push({
      OR: [
        { title: contains },
        { summary: contains },
        { description: contains },
        { category: { name: contains } },
        { style: { name: contains } },
        { features: { some: { feature: { name: contains } } } },
      ],
    });
  }
  return { AND: and };
}

const ORDER_BY: Record<
  "newest" | "popular" | "name",
  Prisma.DesignOrderByWithRelationInput[]
> = {
  newest: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  popular: [{ favorites: { _count: "desc" } }, { viewCount: "desc" }, { title: "asc" }],
  name: [{ title: "asc" }],
};

async function searchDesignsCached(q: CatalogQuery) {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");

  const where = buildWhere(q);
  const skip = (q.page - 1) * PAGE_SIZE;

  if (q.sort === "price-asc" || q.sort === "price-desc") {
    // Sort by each design's lowest tier price. Only the order leaves this
    // function; the prices themselves are dropped here.
    const rows = await db.design.findMany({
      where,
      select: { id: true, title: true, tiers: { select: { priceCents: true } } },
    });
    const dir = q.sort === "price-asc" ? 1 : -1;
    const ids = rows
      .map((r) => ({
        id: r.id,
        title: r.title,
        min: Math.min(...r.tiers.map((t) => t.priceCents), Number.MAX_SAFE_INTEGER),
      }))
      .sort((a, b) => (a.min - b.min) * dir || a.title.localeCompare(b.title))
      .map((r) => r.id);
    const pageIds = ids.slice(skip, skip + PAGE_SIZE);
    const items = await db.design.findMany({
      where: { id: { in: pageIds } },
      select: cardSelect,
    });
    items.sort((a, b) => pageIds.indexOf(a.id) - pageIds.indexOf(b.id));
    return { items: items.map(toCard), total: ids.length };
  }

  const [items, total] = await Promise.all([
    db.design.findMany({
      where,
      orderBy: ORDER_BY[q.sort],
      skip,
      take: PAGE_SIZE,
      select: cardSelect,
    }),
    db.design.count({ where }),
  ]);
  return { items: items.map(toCard), total };
}

/**
 * Catalog search. Price sorting is only honoured for signed-in clients
 * (spec §3.1); for visitors it falls back to "newest".
 */
export async function searchDesigns(q: CatalogQuery, canSeePrices: boolean) {
  const query: CatalogQuery =
    !canSeePrices && q.sort.startsWith("price") ? { ...q, sort: "newest" } : q;
  const { items, total } = await searchDesignsCached(query);
  return {
    items,
    total,
    page: query.page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    sort: query.sort,
  };
}

// ─── Home page ───────────────────────────────────────────────────────────────

export async function getFeaturedDesigns(limit = 6) {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");

  const rows = await db.design.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    take: limit,
    select: cardSelect,
  });
  return rows.map(toCard);
}

export async function getCategoriesWithCovers() {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");

  const categories = await db.category.findMany({
    orderBy: { position: "asc" },
    select: {
      name: true,
      slug: true,
      description: true,
      designs: {
        where: { status: "PUBLISHED" },
        orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
        select: { heroImage: true, heroAlt: true },
      },
    },
  });
  return categories.map(({ designs, ...c }) => ({
    ...c,
    count: designs.length,
    cover: designs[0] ?? null,
  }));
}

export async function getHomeStats() {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");

  const [designs, categories, features, clients] = await Promise.all([
    db.design.count({ where: { status: "PUBLISHED" } }),
    db.category.count(),
    db.feature.count(),
    db.order
      .findMany({ where: { status: "PAID" }, distinct: ["userId"], select: { userId: true } })
      .then((r) => r.length),
  ]);
  return { designs, categories, features, clients };
}

// ─── Design detail ───────────────────────────────────────────────────────────

export async function getPublishedSlugs() {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");

  const rows = await db.design.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}

export async function getDesignBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog", `design:${slug}`);

  const design = await db.design.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      description: true,
      type: true,
      heroImage: true,
      heroAlt: true,
      demoUrl: true,
      deliverables: true,
      updatedAt: true,
      category: { select: { id: true, name: true, slug: true } },
      style: { select: { name: true, slug: true } },
      images: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          url: true,
          thumbUrl: true,
          alt: true,
          kind: true,
          width: true,
          height: true,
          creditName: true,
          creditUrl: true,
          license: true,
          licenseUrl: true,
        },
      },
      // Tier comparison is public (what each level includes); prices are not.
      tiers: {
        select: { id: true, level: true, name: true, inclusions: true, revisions: true },
      },
      features: {
        select: { feature: { select: { name: true, slug: true, group: true } } },
      },
    },
  });
  if (!design) return null;

  return {
    ...design,
    tiers: [...design.tiers].sort(
      (a, b) => TIER_ORDER.indexOf(a.level) - TIER_ORDER.indexOf(b.level),
    ),
    features: design.features
      .map((f) => f.feature)
      .sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name)),
  };
}

export type DesignDetail = NonNullable<Awaited<ReturnType<typeof getDesignBySlug>>>;

export async function getRelatedDesigns(
  designId: string,
  categoryId: string,
  type: ProductType,
) {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");

  const rows = await db.design.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: designId },
      OR: [{ categoryId }, { type }],
    },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    take: 3,
    select: cardSelect,
  });
  return rows.map(toCard);
}

/** All image credits, for the public credits page. */
export async function getImageCredits() {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");

  return db.design.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { title: "asc" },
    select: {
      slug: true,
      title: true,
      images: {
        orderBy: { position: "asc" },
        where: { creditName: { not: null } },
        select: {
          id: true,
          thumbUrl: true,
          url: true,
          alt: true,
          creditName: true,
          creditUrl: true,
          license: true,
          licenseUrl: true,
        },
      },
    },
  });
}

// ─── Gated pricing ───────────────────────────────────────────────────────────

async function pricingCached(designId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog", "pricing");

  const design = await db.design.findFirst({
    where: { id: designId, status: "PUBLISHED" },
    select: {
      type: true,
      tiers: {
        select: { id: true, level: true, name: true, priceCents: true, currency: true },
      },
    },
  });
  if (!design) return null;

  const addons = await db.addon.findMany({
    where: {
      active: true,
      OR: [
        { designId },
        {
          designId: null,
          OR: [{ productTypes: { isEmpty: true } }, { productTypes: { has: design.type } }],
        },
      ],
    },
    orderBy: [{ designId: "asc" }, { priceCents: "asc" }],
    select: { id: true, name: true, description: true, priceCents: true, currency: true },
  });

  return {
    tiers: [...design.tiers].sort(
      (a, b) => TIER_ORDER.indexOf(a.level) - TIER_ORDER.indexOf(b.level),
    ),
    addons,
  };
}

export type DesignPricing = NonNullable<Awaited<ReturnType<typeof pricingCached>>>;

/** Tier prices and add-ons for one design, or null for visitors. */
export async function getDesignPricing(designId: string): Promise<DesignPricing | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return pricingCached(designId);
}

async function fromPricesCached(designIds: string[]) {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog", "pricing");

  const tiers = await db.tier.findMany({
    where: { designId: { in: designIds } },
    select: { designId: true, priceCents: true, currency: true },
  });
  const out: Record<string, { priceCents: number; currency: string }> = {};
  for (const t of tiers) {
    const cur = out[t.designId];
    if (!cur || t.priceCents < cur.priceCents) {
      out[t.designId] = { priceCents: t.priceCents, currency: t.currency };
    }
  }
  return out;
}

/** "From" price per design for catalog cards, or null for visitors. */
export async function getFromPrices(designIds: string[]) {
  const user = await getCurrentUser();
  if (!user || designIds.length === 0) return null;
  return fromPricesCached([...designIds].sort());
}
