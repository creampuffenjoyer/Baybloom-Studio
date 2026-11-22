import photos from "@/templates/ember-and-salt/photos.json";
export const EMBER_PHOTO_KEYS = Object.keys(photos) as (keyof typeof photos)[];
export type EmberPhotoKey = keyof typeof photos;
export function isEmberPhotoKey(value: string): value is EmberPhotoKey { return Object.hasOwn(photos, value); }
