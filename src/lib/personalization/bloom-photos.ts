import photos from "@/templates/bloomfield-gardens/photos.json";
export const BLOOM_PHOTO_KEYS = Object.keys(photos) as (keyof typeof photos)[];
export type BloomPhotoKey = keyof typeof photos;
export function isBloomPhotoKey(value: string): value is BloomPhotoKey { return Object.hasOwn(photos, value); }
