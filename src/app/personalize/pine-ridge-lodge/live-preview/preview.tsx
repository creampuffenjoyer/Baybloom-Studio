"use client";
import { PHOTO_REGISTRY } from "@/templates/pine-ridge-lodge/photo-placements";
import { PhotoOverlays } from "../../photo-overlays";
﻿

import { useEffect, useState } from "react";
import { emptyDraft, type PineDraft } from "@/lib/personalization/harbor-draft";
import { PersonalizationContext } from "@/templates/pine-ridge-lodge/personalization";
import { HomePage } from "@/templates/pine-ridge-lodge/pages/home";
import { Shell } from "@/templates/pine-ridge-lodge/shell";
import { RoomsPage, RoomPage } from "@/templates/pine-ridge-lodge/pages/rooms";
import { ActivitiesPage } from "@/templates/pine-ridge-lodge/pages/activities";
import { DiningPage } from "@/templates/pine-ridge-lodge/pages/dining";
import { JournalPage, PostPage } from "@/templates/pine-ridge-lodge/pages/journal";
import { BookPage } from "@/templates/pine-ridge-lodge/pages/book";
import { ContactPage } from "@/templates/pine-ridge-lodge/pages/contact";
import { isPinePhotoKey } from "@/lib/personalization/pine-photos";

export function LivePreview() {
  const [draft, setDraft] = useState<PineDraft>(() => emptyDraft("pine-ridge-lodge") as PineDraft);
  const [photoUrl, setPhotoUrl] = useState<string>();
  const [page, setPage] = useState("home");
  const [placementPhotos, setPlacementPhotos] = useState<Record<string, string>>({});
  const [photoEditing, setPhotoEditing] = useState(false);
  const [photoSelection, setPhotoSelection] = useState<string>();
  const [pinePhotos, setPinePhotos] = useState<Record<string, string>>({});

  useEffect(() => {
    const announce = () => { if (window.parent !== window) window.parent.postMessage({ type: "harbor-personalization-ready" }, location.origin); };
    const timer = window.setInterval(announce, 500);
    function receive(event: MessageEvent) {
      if (window.parent === window || event.source !== window.parent || event.origin !== location.origin || event.data?.type !== "harbor-personalization-preview") return;
      const { draft: next, photoUrl: image } = event.data;
      if (!next || next.version !== 1 || next.template !== "pine-ridge-lodge" || !next.business || !next.home || !next.theme) return;
      // The editor sends only its own blob or the authenticated, same-origin photo route.
      if (image !== undefined && (typeof image !== "string" || !(image.startsWith(`blob:${location.origin}/`) || image.startsWith("/api/personalization/pine-ridge-lodge/photo?")))) return;
      const photos = event.data.pinePhotos ?? {};
      if (!photos || typeof photos !== "object" || Array.isArray(photos) || Object.entries(photos).some(([key, value]) => !isPinePhotoKey(key) || typeof value !== "string" || !(value.startsWith(`blob:${location.origin}/`) || value.startsWith(`/api/personalization/pine-ridge-lodge/photos/${key}/image?`)))) return;
      if (event.data.readyAck === true) window.clearInterval(timer);
      const placements = event.data.placementPhotos ?? {};
      if (!placements || typeof placements !== "object" || Array.isArray(placements) || Object.entries(placements).some(([key, value]) => !PHOTO_REGISTRY.is(key) || typeof value !== "string" || !(value.startsWith(`blob:${location.origin}/`) || value.startsWith(`/api/personalization/pine-ridge-lodge/placements/${key}/image?`)))) return;
      setPlacementPhotos(placements); setPhotoEditing(event.data.photoEditing === true); setPhotoSelection(PHOTO_REGISTRY.is(event.data.photoSelection) ? event.data.photoSelection : undefined);
      setDraft(next);
      setPhotoUrl(image);
      setPinePhotos(photos);
      if (["home", "rooms", "activities", "dining", "journal", "book", "contact", "trapper-twin", "hearth-room", "family-loft", "ridge-chalet", "how-to-dress-for-a-bluebird-day", "larch-season-is-coming"].includes(event.data.page)) setPage(event.data.page);
    }
    window.addEventListener("message", receive);
    announce();
    return () => { window.clearInterval(timer); window.removeEventListener("message", receive); };
  }, []);

  function previewLink(event: React.MouseEvent) {
    const anchor = (event.target as HTMLElement).closest("a"); if (!anchor) return;
    const url = new URL(anchor.href, location.origin);
    if (url.origin !== location.origin || !/^\/demo\/pine-ridge-lodge(?:\/|$)/.test(url.pathname)) return;
    event.preventDefault(); if (photoEditing) return;
    const path = url.pathname.replace(/^\/demo\/pine-ridge-lodge\/?/, "");
    const nextPage = path.split("/").at(-1) || "home";
    if (PHOTO_REGISTRY.pages.some(item => item.id === nextPage)) { window.history.replaceState(null, "", location.pathname + url.search + url.hash); window.parent.postMessage({ type: "pine-preview-page", page: nextPage }, location.origin); }
  }
  return <div onClickCapture={previewLink}>
    <PhotoOverlays template="pine-ridge-lodge" enabled={photoEditing} selected={photoSelection} page={page} />
    <PersonalizationContext value={{ placementPhotos, photoPlacements: draft.photoPlacements, photoEditing, photoSelection, business: draft.business, home: draft.home, pineRooms: draft.pineRooms, pineActivities: draft.pineActivities, pineMenu: draft.pineMenu, pinePosts: draft.pinePosts, pineSeasons: draft.pineSeasons, pineExtras: draft.pineExtras, pineStayTimes: draft.pineStayTimes, pinePages: draft.pinePages, pineCopy: draft.pineCopy, pinePhotos, pinePhotoAlt: draft.pinePhotoAlt, accent: draft.theme.accent, heroImage: photoUrl }}><Shell languagePicker={false}>{page === "home" ? <HomePage /> : page === "rooms" ? <RoomsPage /> : page === "activities" ? <ActivitiesPage /> : page === "dining" ? <DiningPage /> : page === "journal" ? <JournalPage /> : page === "book" ? <BookPage /> : page === "contact" ? <ContactPage /> : ["trapper-twin", "hearth-room", "family-loft", "ridge-chalet"].includes(page) ? <RoomPage slug={page} /> : <PostPage slug={page} />}</Shell></PersonalizationContext>
  </div>;
}
