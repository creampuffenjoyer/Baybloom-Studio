import type { ImageKind, TierLevel } from "@prisma/client";

export function formatPrice(cents: number, currency = "PHP") {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export const TIER_LABEL: Record<TierLevel, string> = {
  STARTER: "Starter",
  STANDARD: "Standard",
  PREMIUM: "Premium",
};

export const IMAGE_KIND_LABEL: Record<ImageKind, string> = {
  PHOTO: "Photo",
  MOCKUP: "Mockup",
  SCREENSHOT: "Screenshot",
};
