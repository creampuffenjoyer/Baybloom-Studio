import { rooms, type PhotoKey } from "./content";
import photos from "./photos.json";

export type HarborPhotoPlacement = { id: string; page: string; pageName: string; name: string; photo: PhotoKey; ratio: string };
const placement = (id: string, page: string, pageName: string, name: string, photo: PhotoKey, ratio = "4:3"): HarborPhotoPlacement => ({ id, page, pageName, name, photo, ratio });

export const HARBOR_PHOTO_PLACEMENTS: readonly HarborPhotoPlacement[] = [
  placement("home.hero", "home", "Home", "Main banner", "cove", "21:10"),
  ...rooms.map(room => placement(`home.room.${room.slug}`, "home", "Home", `${room.name} — Card photo`, room.photos[0])),
  placement("home.breakfast", "home", "Home", "Breakfast section", "breakfast", "1:1"),
  placement("home.guide", "home", "Home", "Local guide section", "lighthouse"),
  ...rooms.flatMap(room => [
    placement(`rooms.${room.slug}`, "rooms", "Rooms", `${room.name} — Card photo`, room.photos[0]),
    ...room.photos.map((key, index) => placement(`room.${room.slug}.photo.${index + 1}`, room.slug, room.name, index === 0 ? "Main room photo" : `Room gallery — Photo ${index + 1}`, key)),
  ]),
  placement("breakfast.breakfast", "breakfast", "Breakfast", "Breakfast table", "breakfast", "1:1"),
  placement("breakfast.tray", "breakfast", "Breakfast", "Breakfast tray", "tray", "1:1"),
  placement("breakfast.pastries", "breakfast", "Breakfast", "Pastries", "pastries", "1:1"),
  placement("guide.headland", "guide", "Local guide", "Main landscape", "headland", "16:10"),
  placement("guide.cliff-walk", "guide", "Local guide", "Cliff walk", "cliff-walk"),
  placement("guide.beach", "guide", "Local guide", "Beach", "beach"),
  placement("contact.harbour", "contact", "Contact", "Harbour photo", "harbour-wall"),
  ...rooms.map(room => placement(`book.room.${room.slug}`, "book", "Sample booking", `${room.name} — Choice photo`, room.photos[0], "1:1")),
];
export const HARBOR_PLACEMENT_KEYS = HARBOR_PHOTO_PLACEMENTS.map(item => item.id);
const byId = new Map(HARBOR_PHOTO_PLACEMENTS.map(item => [item.id, item]));
export const getHarborPhotoPlacement = (id: string) => byId.get(id);
export const isHarborPhotoPlacement = (id: unknown): id is string => typeof id === "string" && byId.has(id);
export const originalHarborPhoto = (id: string) => { const item = byId.get(id); return item ? photos[item.photo] : undefined; };
export const HARBOR_PHOTO_PAGES = [
  { id: "home", name: "Home" }, { id: "rooms", name: "Rooms" }, { id: "breakfast", name: "Breakfast" },
  { id: "guide", name: "Local guide" }, { id: "contact", name: "Contact" }, { id: "guestbook", name: "Guestbook" }, { id: "book", name: "Sample booking" },
  ...rooms.map(room => ({ id: room.slug, name: room.name })),
];

export function resolveHarborPhoto<T extends { src: string; alt: string }>(id: string, photo: T, personalization: {
  photoPlacements?: Record<string, { alt?: string; original?: boolean } | undefined>;
  placementPhotos?: Record<string, string | undefined>;
}): T {
  const options = personalization.photoPlacements?.[id]; const original = originalHarborPhoto(id);
  return { ...photo, src: options?.original && original ? original.src : personalization.placementPhotos?.[id] || photo.src,
    alt: options?.alt ?? (options?.original && original ? original.alt : photo.alt) };
}
