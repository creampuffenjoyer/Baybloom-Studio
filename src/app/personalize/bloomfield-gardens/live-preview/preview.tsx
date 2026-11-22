"use client";
import { PHOTO_REGISTRY } from "@/templates/bloomfield-gardens/photo-placements";
import { PhotoOverlays } from "../../photo-overlays";
﻿

import { useEffect, useState } from "react";
import { emptyDraft, type BloomfieldDraft } from "@/lib/personalization/harbor-draft";
import { PersonalizationContext } from "@/templates/bloomfield-gardens/personalization";
import { HomePage } from "@/templates/bloomfield-gardens/pages/home";
import { Shell } from "@/templates/bloomfield-gardens/shell";
import { SpacesPage } from "@/templates/bloomfield-gardens/pages/spaces";
import { SpacePage } from "@/templates/bloomfield-gardens/pages/space";
import { WeddingsPage } from "@/templates/bloomfield-gardens/pages/weddings";
import { PlanningPage } from "@/templates/bloomfield-gardens/pages/planning";
import { GalleryPage } from "@/templates/bloomfield-gardens/pages/gallery";
import { InquirePage } from "@/templates/bloomfield-gardens/pages/inquire";
import { spaces } from "@/templates/bloomfield-gardens/content";
import { isBloomPhotoKey } from "@/lib/personalization/bloom-photos";

export function LivePreview() {
  const [draft, setDraft] = useState<BloomfieldDraft>(() => emptyDraft("bloomfield-gardens") as BloomfieldDraft);
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
      if (!next || next.version !== 1 || next.template !== "bloomfield-gardens" || !next.business || !next.home || !next.theme) return;
      // The editor sends only its own blob or the authenticated, same-origin photo route.
      if (image !== undefined && (typeof image !== "string" || !(image.startsWith(`blob:${location.origin}/`) || image.startsWith("/api/personalization/bloomfield-gardens/photo?")))) return;
      const nextPhotos = event.data.pinePhotos ?? {};
      if (!nextPhotos || typeof nextPhotos !== "object" || Array.isArray(nextPhotos) || Object.entries(nextPhotos).some(([key, value]) => !isBloomPhotoKey(key) || typeof value !== "string" || !(value.startsWith(`blob:${location.origin}/`) || value.startsWith(`/api/personalization/bloomfield-gardens/photos/${key}/image?`)))) return;
      if (event.data.readyAck === true) window.clearInterval(timer);
      const placements = event.data.placementPhotos ?? {};
      if (!placements || typeof placements !== "object" || Array.isArray(placements) || Object.entries(placements).some(([key, value]) => !PHOTO_REGISTRY.is(key) || typeof value !== "string" || !(value.startsWith(`blob:${location.origin}/`) || value.startsWith(`/api/personalization/bloomfield-gardens/placements/${key}/image?`)))) return;
      setPlacementPhotos(placements); setPhotoEditing(event.data.photoEditing === true); setPhotoSelection(PHOTO_REGISTRY.is(event.data.photoSelection) ? event.data.photoSelection : undefined);
      setDraft(next);
      setPhotoUrl(image);
      setPhotos(nextPhotos);
      if (["home", "spaces", "weddings", "planning", "gallery", "inquire", ...spaces.map(space => space.slug)].includes(event.data.page)) setPage(event.data.page);
    }
    window.addEventListener("message", receive);
    announce();
    return () => { window.clearInterval(timer); window.removeEventListener("message", receive); };
  }, []);

  function previewLink(event: React.MouseEvent) {
    const anchor = (event.target as HTMLElement).closest("a"); if (!anchor) return;
    const url = new URL(anchor.href, location.origin);
    if (url.origin !== location.origin || !/^\/demo\/bloomfield-gardens(?:\/|$)/.test(url.pathname)) return;
    event.preventDefault(); if (photoEditing) return;
    const path = url.pathname.replace(/^\/demo\/bloomfield-gardens\/?/, "");
    const nextPage = path.split("/").at(-1) || "home";
    if (PHOTO_REGISTRY.pages.some(item => item.id === nextPage)) { window.history.replaceState(null, "", location.pathname + url.search + url.hash); window.parent.postMessage({ type: "bloom-preview-page", page: nextPage }, location.origin); }
  }
  return <div onClickCapture={previewLink}>
    <PhotoOverlays template="bloomfield-gardens" enabled={photoEditing} selected={photoSelection} page={page} />
    <PersonalizationContext value={{ placementPhotos, photoPlacements: draft.photoPlacements, photoEditing, photoSelection, ...draft, accent: draft.theme.accent, heroImage: photoUrl, bloomPhotos: photos }}><Shell languagePicker={false}>{page === "home" ? <HomePage /> : page === "spaces" ? <SpacesPage /> : page === "weddings" ? <WeddingsPage /> : page === "planning" ? <PlanningPage /> : page === "gallery" ? <GalleryPage /> : page === "inquire" ? <InquirePage /> : <SpacePage slug={page} />}</Shell></PersonalizationContext>
  </div>;
}
