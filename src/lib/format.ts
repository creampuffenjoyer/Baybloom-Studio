import type { ImageKind, ProductType, TierLevel } from "@prisma/client";

export function formatPrice(cents: number, currency = "PHP") {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export const TYPE_LABEL: Record<ProductType, string> = {
  WEBSITE: "Website design",
  ARCHITECTURE: "Architecture",
  INTERIOR: "Interior design",
};

export const TYPE_LABEL_PLURAL: Record<ProductType, string> = {
  WEBSITE: "Website designs",
  ARCHITECTURE: "Architecture",
  INTERIOR: "Interiors",
};

export const TIER_LABEL: Record<TierLevel, string> = {
  STARTER: "Starter",
  STANDARD: "Standard",
  PREMIUM: "Premium",
};

export const IMAGE_KIND_LABEL: Record<ImageKind, string> = {
  PHOTO: "Photo",
  RENDER: "Render",
  PLAN: "Plan preview",
  MOCKUP: "Mockup",
};
