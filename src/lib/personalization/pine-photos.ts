import photos from "@/templates/pine-ridge-lodge/photos.json";

export const PINE_PHOTO_KEYS = Object.keys(photos) as (keyof typeof photos)[];
export type PinePhotoKey = keyof typeof photos;
export function isPinePhotoKey(value: string): value is PinePhotoKey {
  return Object.hasOwn(photos, value);
}
