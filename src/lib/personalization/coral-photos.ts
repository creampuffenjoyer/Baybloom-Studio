import photos from "@/templates/coral-cove/photos.json";
export const CORAL_PHOTO_KEYS = Object.keys(photos) as (keyof typeof photos)[];
export type CoralPhotoKey = keyof typeof photos;
export function isCoralPhotoKey(value: string): value is CoralPhotoKey { return Object.hasOwn(photos, value); }
