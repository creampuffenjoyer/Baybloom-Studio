import photos from "@/templates/lumen-lake-villas/photos.json";
export const LUMEN_PHOTO_KEYS = Object.keys(photos) as (keyof typeof photos)[];
export type LumenPhotoKey = keyof typeof photos;
export function isLumenPhotoKey(value: string): value is LumenPhotoKey { return Object.hasOwn(photos, value); }
