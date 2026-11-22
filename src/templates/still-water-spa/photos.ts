"use client";
import photos from "./photos.json";
import { usePersonalization } from "./personalization";
export function useSpaPhoto() {
  const draft = usePersonalization();
  return (key: keyof typeof photos) => ({ ...photos[key], src: draft.spaPhotos?.[key] || photos[key].src, alt: draft.spaPhotoAlt?.[key] || photos[key].alt });
}
