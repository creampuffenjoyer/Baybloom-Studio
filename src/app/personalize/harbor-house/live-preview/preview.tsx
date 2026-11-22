"use client";
import { isHousePhotoKey } from "@/lib/personalization/house-photos";
import { useEffect, useState } from "react";
import { emptyHarborDraft, type HarborDraft } from "@/lib/personalization/harbor-draft";
import { isHarborRoomImageKey, type HarborRoomImageKey } from "@/lib/personalization/harbor-room-images";
import { PersonalizationContext } from "@/templates/harbor-house/personalization";
import { HomePage } from "@/templates/harbor-house/pages/home";
import { RoomsPage } from "@/templates/harbor-house/pages/rooms";
import { RoomPage } from "@/templates/harbor-house/pages/room";
import { ContactPage } from "@/templates/harbor-house/pages/contact";
import { BreakfastPage } from "@/templates/harbor-house/pages/breakfast";
import { GuidePage } from "@/templates/harbor-house/pages/guide";
import { BookPage } from "@/templates/harbor-house/pages/book";
import { Shell } from "@/templates/harbor-house/shell";
import { GuestbookPage } from "@/templates/harbor-house/pages/guestbook";
import { HARBOR_PHOTO_PAGES, isHarborPhotoPlacement } from "@/templates/harbor-house/photo-placements";
import { PhotoOverlays } from "../../photo-overlays";

export function LivePreview() {
  const [draft, setDraft] = useState<HarborDraft>(emptyHarborDraft);
  const [websitePhotos, setWebsitePhotos] = useState<Record<string, string>>({});
  const [photoUrl, setPhotoUrl] = useState<string>();
  const [roomPhotos, setRoomPhotos] = useState<Partial<Record<HarborRoomImageKey, string>>>({});
  const [page, setPage] = useState("home");
  const [placementPhotos, setPlacementPhotos] = useState<Record<string, string>>({});
  const [photoEditing, setPhotoEditing] = useState(false);
  const [photoSelection, setPhotoSelection] = useState<string>();

  useEffect(() => {
    const announce = () => { if (window.parent !== window) window.parent.postMessage({ type: "harbor-personalization-ready" }, location.origin); };
    const timer = window.setInterval(announce, 500);
    function receive(event: MessageEvent) {
      if (window.parent === window || event.source !== window.parent || event.origin !== location.origin || event.data?.type !== "harbor-personalization-preview") return;
      const { draft: next, photoUrl: image } = event.data;
      if (!next || next.version !== 1 || next.template !== "harbor-house" || !next.business || !next.home || !next.theme) return;
      // The editor sends only its own blob or the authenticated, same-origin photo route.
      if (image !== undefined && (typeof image !== "string" || !(image.startsWith(`blob:${location.origin}/`) || image.startsWith("/api/personalization/harbor-house/photo?")))) return;
      const photos = event.data.roomPhotos ?? {};
      if (!photos || typeof photos !== "object" || Array.isArray(photos) || Object.entries(photos).some(([key, value]) => !isHarborRoomImageKey(key) || typeof value !== "string" || !(value.startsWith(`blob:${location.origin}/`) || value.startsWith(`/api/personalization/harbor-house/rooms/${key}/photo?`)))) return;
      const website = event.data.pinePhotos ?? {};
      if (!website || typeof website !== "object" || Array.isArray(website) || Object.entries(website).some(([key, value]) => !isHousePhotoKey(key) || typeof value !== "string" || !(value.startsWith(`blob:${location.origin}/`) || value.startsWith(`/api/personalization/harbor-house/photos/${key}/image?`)))) return;
      setWebsitePhotos(website);
      const placements = event.data.placementPhotos ?? {};
      if (!placements || typeof placements !== "object" || Array.isArray(placements) || Object.entries(placements).some(([key, value]) => !isHarborPhotoPlacement(key) || typeof value !== "string" || !(value.startsWith(`blob:${location.origin}/`) || value.startsWith(`/api/personalization/harbor-house/placements/${key}/image?`)))) return;
      setPlacementPhotos(placements);
      setPhotoEditing(event.data.photoEditing === true);
      setPhotoSelection(isHarborPhotoPlacement(event.data.photoSelection) ? event.data.photoSelection : undefined);
      if (event.data.readyAck === true) window.clearInterval(timer);
      setDraft(next);
      setPhotoUrl(image);
      setRoomPhotos(photos);
      const nextPage = event.data.page;
      if (HARBOR_PHOTO_PAGES.some(item => item.id === nextPage)) setPage(nextPage);
    }
    window.addEventListener("message", receive);
    announce();
    return () => { window.clearInterval(timer); window.removeEventListener("message", receive); };
  }, []);

  function previewLink(event: React.MouseEvent) {
    const anchor = (event.target as HTMLElement).closest("a");
    if (!anchor) return;
    const url = new URL(anchor.href, location.origin);
    if (url.origin !== location.origin || !/^\/demo\/harbor-house(?:\/|$)/.test(url.pathname)) return;
    event.preventDefault();
    if (photoEditing) return;
    const path = url.pathname.replace(/^\/demo\/harbor-house\/?/, "");
    const nextPage = path.startsWith("rooms/") ? path.slice(6) : path || "home";
    if (HARBOR_PHOTO_PAGES.some(item => item.id === nextPage)) {
      window.history.replaceState(null, "", `${location.pathname}${url.search}`);
      window.parent.postMessage({ type: "harbor-preview-page", page: nextPage }, location.origin);
    }
  }
  return <div onClickCapture={previewLink}>
    <PhotoOverlays template="harbor-house" enabled={photoEditing} selected={photoSelection} page={page} />
    <PersonalizationContext value={{ placementPhotos, photoPlacements: draft.photoPlacements, photoEditing, photoSelection, websitePhotos, housePhotoAlt: draft.housePhotoAlt, business: draft.business, home: draft.home, rooms: draft.rooms, breakfast: draft.breakfast, guide: draft.guide, roomPhotos, accent: draft.theme.accent, heroImage: photoUrl }}><Shell languagePicker={false}>{page === "home" ? <HomePage /> : page === "rooms" ? <RoomsPage /> : page === "contact" ? <ContactPage /> : page === "breakfast" ? <BreakfastPage /> : page === "guide" ? <GuidePage /> : page === "guestbook" ? <GuestbookPage /> : page === "book" ? <BookPage /> : <RoomPage slug={page} />}</Shell></PersonalizationContext>
  </div>;
}
