import "server-only";
import type { TierLevel } from "@prisma/client";
import { db } from "@/lib/db";
import { formatPrice, TIER_LABEL } from "@/lib/format";

/*
 * Cart pricing lives only on the server: every total is recomputed from the
 * database (tier prices, active add-ons, coupon rules). Client-sent prices are
 * never trusted.
 */

export const COUPON_COOKIE = "bb_coupon";
const TIER_RANK: Record<TierLevel, number> = { STARTER: 0, STANDARD: 1, PREMIUM: 2 };

export function tierRank(level: TierLevel) {
  return TIER_RANK[level];
}

export type CartLine = {
  id: string;
  design: { id: string; slug: string; title: string; heroImage: string; heroAlt: string };
  tier: { id: string; level: TierLevel; label: string; priceCents: number };
  addons: { id: string; name: string; priceCents: number }[];
  lineCents: number;
};

export type Cart = {
  lines: CartLine[];
  currency: string;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  coupon: { code: string; label: string } | null;
  couponError: string | null;
};

/** Add-ons with no designId apply to every design. */
function addonAllowed(addon: { designId: string | null; active: boolean }, designId: string) {
  return addon.active && (!addon.designId || addon.designId === designId);
}

async function loadLines(userId: string): Promise<CartLine[]> {
  const items = await db.cartItem.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      addonIds: true,
      design: {
        select: { id: true, slug: true, title: true, heroImage: true, heroAlt: true, status: true },
      },
      tier: { select: { id: true, level: true, priceCents: true, designId: true } },
    },
  });

  const addonIds = [...new Set(items.flatMap((i) => i.addonIds))];
  const addons = addonIds.length
    ? await db.addon.findMany({
        where: { id: { in: addonIds } },
        select: { id: true, name: true, priceCents: true, designId: true, active: true },
      })
    : [];

  return items
    .filter((i) => i.design.status === "PUBLISHED" && i.tier.designId === i.design.id)
    .map((i) => {
      const lineAddons = addons
        .filter((a) => i.addonIds.includes(a.id) && addonAllowed(a, i.design.id))
        .map(({ id, name, priceCents }) => ({ id, name, priceCents }));
      return {
        id: i.id,
        design: {
          id: i.design.id,
          slug: i.design.slug,
          title: i.design.title,
          heroImage: i.design.heroImage,
          heroAlt: i.design.heroAlt,
        },
        tier: {
          id: i.tier.id,
          level: i.tier.level,
          label: TIER_LABEL[i.tier.level],
          priceCents: i.tier.priceCents,
        },
        addons: lineAddons,
        lineCents: i.tier.priceCents + lineAddons.reduce((s, a) => s + a.priceCents, 0),
      };
    });
}

/** Validates a coupon against a subtotal. Returns the discount or why it doesn't apply. */
export async function evaluateCoupon(rawCode: string, subtotalCents: number) {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false as const, error: "Enter a code." };
  const coupon = await db.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.active) return { ok: false as const, error: "That code isn't valid." };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { ok: false as const, error: "That code has expired." };
  }
  if (coupon.maxRedemptions !== null && coupon.redemptions >= coupon.maxRedemptions) {
    return { ok: false as const, error: "That code has been fully used." };
  }
  if (coupon.minSubtotalCents && subtotalCents < coupon.minSubtotalCents) {
    return {
      ok: false as const,
      error: `This code needs a subtotal of at least ${formatPrice(coupon.minSubtotalCents)}.`,
    };
  }
  const discountCents = Math.min(
    subtotalCents,
    coupon.percentOff
      ? Math.round((subtotalCents * coupon.percentOff) / 100)
      : (coupon.amountOffCents ?? 0),
  );
  const label = coupon.percentOff
    ? `${coupon.percentOff}% off`
    : `${formatPrice(coupon.amountOffCents ?? 0)} off`;
  return { ok: true as const, code, label, discountCents };
}

export async function getCart(userId: string, couponCode?: string | null): Promise<Cart> {
  const lines = await loadLines(userId);
  const subtotalCents = lines.reduce((s, l) => s + l.lineCents, 0);

  let coupon: Cart["coupon"] = null;
  let couponError: string | null = null;
  let discountCents = 0;
  if (couponCode && lines.length > 0) {
    const result = await evaluateCoupon(couponCode, subtotalCents);
    if (result.ok) {
      coupon = { code: result.code, label: result.label };
      discountCents = result.discountCents;
    } else {
      couponError = result.error;
    }
  }

  return {
    lines,
    currency: "PHP",
    subtotalCents,
    discountCents,
    totalCents: subtotalCents - discountCents,
    coupon,
    couponError,
  };
}

export class CartError extends Error {}

/** Adds a design (one line per design; re-adding replaces its tier/add-ons). */
export async function addToCart(
  userId: string,
  input: { designId: string; tierId: string; addonIds: string[] },
) {
  const design = await db.design.findFirst({
    where: { id: input.designId, status: "PUBLISHED" },
    select: { id: true, tiers: { where: { id: input.tierId }, select: { id: true } } },
  });
  if (!design || design.tiers.length === 0) throw new CartError("That design or tier isn't available.");

  const addons = input.addonIds.length
    ? await db.addon.findMany({
        where: { id: { in: input.addonIds } },
        select: { id: true, designId: true, active: true },
      })
    : [];
  const addonIds = addons.filter((a) => addonAllowed(a, design.id)).map((a) => a.id);

  await db.cartItem.upsert({
    where: { userId_designId: { userId, designId: design.id } },
    create: { userId, designId: design.id, tierId: input.tierId, addonIds },
    update: { tierId: input.tierId, addonIds, createdAt: new Date() },
  });
}

export async function removeFromCart(userId: string, itemId: string) {
  await db.cartItem.deleteMany({ where: { id: itemId, userId } });
}

export async function cartCount(userId: string) {
  return db.cartItem.count({ where: { userId } });
}
