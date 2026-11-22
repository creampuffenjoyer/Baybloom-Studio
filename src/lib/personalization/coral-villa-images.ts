export const CORAL_VILLA_IMAGE_KEYS = ["overwater-villa", "garden-pool-villa", "beachfront-bungalow", "lagoon-family-villa"] as const;
export type CoralVillaImageKey = typeof CORAL_VILLA_IMAGE_KEYS[number];
export function isCoralVillaImageKey(value: string): value is CoralVillaImageKey {
  return (CORAL_VILLA_IMAGE_KEYS as readonly string[]).includes(value);
}
