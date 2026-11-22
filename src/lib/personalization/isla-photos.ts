import photos from "@/templates/isla-verde-boutique/photos.json";
export const ISLA_PHOTO_KEYS = Object.keys(photos) as (keyof typeof photos)[];
export type IslaPhotoKey = keyof typeof photos;
export function isIslaPhotoKey(value: string): value is IslaPhotoKey { return Object.hasOwn(photos, value); }
