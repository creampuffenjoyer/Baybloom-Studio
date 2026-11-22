import photos from "@/templates/harbor-house/photos.json";
export const HOUSE_PHOTO_KEYS = Object.keys(photos) as (keyof typeof photos)[];
export type HousePhotoKey = keyof typeof photos;
export function isHousePhotoKey(value: string): value is HousePhotoKey { return Object.hasOwn(photos, value); }
