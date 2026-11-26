export const LIFETIME_PRICE_CENTS = 1000;

// The Regular collection is curated by industry. New releases default to Premium.
const regular = new Set([
  "lumen-lake-villas", "harbor-house", "common-room", "ember-and-salt",
  "root-and-kettle", "fern-and-stone", "bloomfield-gardens", "form-and-field", "quiet-form",
]);

export function regularTemplate(slug: string) {
  return regular.has(slug);
}

export function includesFile(premium: boolean, slug: string, file: { storageKey: string; minTier: {level: string} | null }) {
  return premium || (regularTemplate(slug) && (
    file.storageKey === `deliverables/${slug}/${slug}-source.zip` ||
    !file.minTier || file.minTier.level === "STARTER"
  ));
}
