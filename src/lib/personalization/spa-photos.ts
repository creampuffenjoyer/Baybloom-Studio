import photos from "@/templates/still-water-spa/photos.json";
export const SPA_PHOTO_KEYS = Object.keys(photos) as (keyof typeof photos)[];
export type SpaPhotoKey = keyof typeof photos;
export function isSpaPhotoKey(value: string): value is SpaPhotoKey { return Object.hasOwn(photos, value); }
