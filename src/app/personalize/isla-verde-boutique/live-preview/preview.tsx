"use client";
import { PHOTO_REGISTRY } from "@/templates/isla-verde-boutique/photo-placements";
import { PhotoOverlays } from "../../photo-overlays";
﻿

import { useEffect, useState } from "react";
import { emptyDraft, type IslaDraft } from "@/lib/personalization/harbor-draft";
import { PersonalizationContext } from "@/templates/isla-verde-boutique/personalization";
import { HomePage } from "@/templates/isla-verde-boutique/pages/home";
import { Shell } from "@/templates/isla-verde-boutique/shell";
import { RoomsPage } from "@/templates/isla-verde-boutique/pages/rooms";
import { RoomPage } from "@/templates/isla-verde-boutique/pages/room";
import { DiningPage } from "@/templates/isla-verde-boutique/pages/dining";
import { EventsPage } from "@/templates/isla-verde-boutique/pages/events";
import { StoryPage } from "@/templates/isla-verde-boutique/pages/story";
import { JournalPage, PostPage } from "@/templates/isla-verde-boutique/pages/journal";
import { BookPage } from "@/templates/isla-verde-boutique/pages/book";
import { ContactPage } from "@/templates/isla-verde-boutique/pages/contact";
import { isIslaPhotoKey } from "@/lib/personalization/isla-photos";

export function LivePreview() {
  const [draft, setDraft] = useState<IslaDraft>(() => emptyDraft("isla-verde-boutique") as IslaDraft);
  const [photoUrl, setPhotoUrl] = useState<string>();
  const [page, setPage] = useState("home");
  const [placementPhotos, setPlacementPhotos] = useState<Record<string, string>>({});
  const [photoEditing, setPhotoEditing] = useState(false);
  const [photoSelection, setPhotoSelection] = useState<string>();
  const [photos, setPhotos] = useState<Record<string, string>>({});

  useEffect(() => {
    const announce = () => { if (window.parent !== window) window.parent.postMessage({ type: "harbor-personalization-ready" }, location.origin); };
    const timer = window.setInterval(announce, 500);
    function receive(event: MessageEvent) {
      if (window.parent === window || event.source !== window.parent || event.origin !== location.origin || event.data?.type !== "harbor-personalization-preview") return;
      const { draft: next, photoUrl: image } = event.data;
      if (!next || next.version !== 1 || next.template !== "isla-verde-boutique" || !next.business || !next.home || !next.theme) return;
      // The editor sends only its own blob or the authenticated, same-origin photo route.
      if (image !== undefined && (typeof image !== "string" || !(image.startsWith(`blob:${location.origin}/`) || image.startsWith("/api/personalization/isla-verde-boutique/photo?")))) return;
      const nextPhotos = event.data.pinePhotos ?? {};
      if (!nextPhotos || typeof nextPhotos !== "object" || Array.isArray(nextPhotos) || Object.entries(nextPhotos).some(([key, value]) => !isIslaPhotoKey(key) || typeof value !== "string" || !(value.startsWith(`blob:${location.origin}/`) || value.startsWith(`/api/personalization/isla-verde-boutique/photos/${key}/image?`)))) return;
      if (event.data.readyAck === true) window.clearInterval(timer);
      const placements = event.data.placementPhotos ?? {};
      if (!placements || typeof placements !== "object" || Array.isArray(placements) || Object.entries(placements).some(([key, value]) => !PHOTO_REGISTRY.is(key) || typeof value !== "string" || !(value.startsWith(`blob:${location.origin}/`) || value.startsWith(`/api/personalization/isla-verde-boutique/placements/${key}/image?`)))) return;
      setPlacementPhotos(placements); setPhotoEditing(event.data.photoEditing === true); setPhotoSelection(PHOTO_REGISTRY.is(event.data.photoSelection) ? event.data.photoSelection : undefined);
      setDraft(next);
      setPhotoUrl(image);
      setPhotos(nextPhotos);
      if (["home", "rooms", "dining", "events", "story", "journal", "book", "contact", "casa-room", "courtyard-suite", "pool-suite", "mansion-suite", "a-morning-on-calle-crisologo", "restoring-the-capiz-windows", "the-longganisa-question"].includes(event.data.page)) setPage(event.data.page);
    }
    window.addEventListener("message", receive);
    announce();
    return () => { window.clearInterval(timer); window.removeEventListener("message", receive); };
  }, []);

  function previewLink(event: React.MouseEvent) {
    const anchor = (event.target as HTMLElement).closest("a"); if (!anchor) return;
    const url = new URL(anchor.href, location.origin);
    if (url.origin !== location.origin || !/^\/demo\/isla-verde-boutique(?:\/|$)/.test(url.pathname)) return;
    event.preventDefault(); if (photoEditing) return;
    const path = url.pathname.replace(/^\/demo\/isla-verde-boutique\/?/, "");
    const nextPage = path.split("/").at(-1) || "home";
    if (PHOTO_REGISTRY.pages.some(item => item.id === nextPage)) { window.history.replaceState(null, "", location.pathname + url.search + url.hash); window.parent.postMessage({ type: "isla-preview-page", page: nextPage }, location.origin); }
  }
  return <div onClickCapture={previewLink}>
    <PhotoOverlays template="isla-verde-boutique" enabled={photoEditing} selected={photoSelection} page={page} />
    <PersonalizationContext value={{ placementPhotos, photoPlacements: draft.photoPlacements, photoEditing, photoSelection, business: draft.business, home: draft.home, islaRooms: draft.islaRooms, islaPosts: draft.islaPosts, islaMenu: draft.islaMenu, islaSpaces: draft.islaSpaces, islaExtras: draft.islaExtras, islaStory: draft.islaStory, islaStayTimes: draft.islaStayTimes, islaCopy: draft.islaCopy, islaPhotos: photos, islaPhotoAlt: draft.islaPhotoAlt, accent: draft.theme.accent, heroImage: photoUrl }}><Shell languagePicker={false}>{page === "home" ? <HomePage /> : page === "rooms" ? <RoomsPage /> : page === "dining" ? <DiningPage /> : page === "events" ? <EventsPage /> : page === "story" ? <StoryPage /> : page === "journal" ? <JournalPage /> : page === "book" ? <BookPage /> : page === "contact" ? <ContactPage /> : ["casa-room", "courtyard-suite", "pool-suite", "mansion-suite"].includes(page) ? <RoomPage slug={page} /> : <PostPage slug={page} />}</Shell></PersonalizationContext>
  </div>;
}
