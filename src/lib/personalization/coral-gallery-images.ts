export const CORAL_GALLERY_IMAGE_KEYS = ["hero", "overwater-row", "villas-row", "snorkeler", "pool", "bedroom", "sandbar", "palms-dusk", "coral", "boardwalk", "dining", "paraw", "beach-bar", "plunge-pool", "bangka", "sunset"] as const;
export type CoralGalleryImageKey = typeof CORAL_GALLERY_IMAGE_KEYS[number];
export function isCoralGalleryImageKey(value: string): value is CoralGalleryImageKey {
  return (CORAL_GALLERY_IMAGE_KEYS as readonly string[]).includes(value);
}
