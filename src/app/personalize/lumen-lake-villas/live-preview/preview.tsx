"use client";
import { PHOTO_REGISTRY } from "@/templates/lumen-lake-villas/photo-placements";
import { PhotoOverlays } from "../../photo-overlays";
﻿

import { useEffect, useState } from "react";
import { emptyDraft, type LumenDraft } from "@/lib/personalization/harbor-draft";
import { PersonalizationContext } from "@/templates/lumen-lake-villas/personalization";
import { HomePage } from "@/templates/lumen-lake-villas/pages/home";
import { Shell } from "@/templates/lumen-lake-villas/shell";
import { VillasPage, VillaPage } from "@/templates/lumen-lake-villas/pages/villas";
import { ExperiencesPage } from "@/templates/lumen-lake-villas/pages/experiences";
import { TourPage } from "@/templates/lumen-lake-villas/pages/tour";
import { BookPage } from "@/templates/lumen-lake-villas/pages/book";
import { ContactPage } from "@/templates/lumen-lake-villas/pages/contact";
import { isLumenPhotoKey } from "@/lib/personalization/lumen-photos";

export function LivePreview() {
  const [draft, setDraft] = useState<LumenDraft>(() => emptyDraft("lumen-lake-villas") as LumenDraft);
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
      if (!next || next.version !== 1 || next.template !== "lumen-lake-villas" || !next.business || !next.home || !next.theme) return;
      // The editor sends only its own blob or the authenticated, same-origin photo route.
      if (image !== undefined && (typeof image !== "string" || !(image.startsWith(`blob:${location.origin}/`) || image.startsWith("/api/personalization/lumen-lake-villas/photo?")))) return;
      const nextPhotos = event.data.pinePhotos ?? {};
      if (!nextPhotos || typeof nextPhotos !== "object" || Array.isArray(nextPhotos) || Object.entries(nextPhotos).some(([key, value]) => !isLumenPhotoKey(key) || typeof value !== "string" || !(value.startsWith(`blob:${location.origin}/`) || value.startsWith(`/api/personalization/lumen-lake-villas/photos/${key}/image?`)))) return;
      if (event.data.readyAck === true) window.clearInterval(timer);
      const placements = event.data.placementPhotos ?? {};
      if (!placements || typeof placements !== "object" || Array.isArray(placements) || Object.entries(placements).some(([key, value]) => !PHOTO_REGISTRY.is(key) || typeof value !== "string" || !(value.startsWith(`blob:${location.origin}/`) || value.startsWith(`/api/personalization/lumen-lake-villas/placements/${key}/image?`)))) return;
      setPlacementPhotos(placements); setPhotoEditing(event.data.photoEditing === true); setPhotoSelection(PHOTO_REGISTRY.is(event.data.photoSelection) ? event.data.photoSelection : undefined);
      setDraft(next);
      setPhotoUrl(image);
      setPhotos(nextPhotos);
      if (["home", "villas", "experiences", "tour", "book", "contact", "shore-villa", "garden-villa", "family-villa", "boathouse"].includes(event.data.page)) setPage(event.data.page);
    }
    window.addEventListener("message", receive);
    announce();
    return () => { window.clearInterval(timer); window.removeEventListener("message", receive); };
  }, []);

  function previewLink(event: React.MouseEvent) {
    const anchor = (event.target as HTMLElement).closest("a"); if (!anchor) return;
    const url = new URL(anchor.href, location.origin);
    if (url.origin !== location.origin || !/^\/demo\/lumen-lake-villas(?:\/|$)/.test(url.pathname)) return;
    event.preventDefault(); if (photoEditing) return;
    const path = url.pathname.replace(/^\/demo\/lumen-lake-villas\/?/, "");
    const nextPage = path.split("/").at(-1) || "home";
    if (PHOTO_REGISTRY.pages.some(item => item.id === nextPage)) { window.history.replaceState(null, "", location.pathname + url.search + url.hash); window.parent.postMessage({ type: "lumen-preview-page", page: nextPage }, location.origin); }
  }
  return <div onClickCapture={previewLink}>
    <PhotoOverlays template="lumen-lake-villas" enabled={photoEditing} selected={photoSelection} page={page} />
    <PersonalizationContext value={{ placementPhotos, photoPlacements: draft.photoPlacements, photoEditing, photoSelection, business: draft.business, home: draft.home, lumenVillas: draft.lumenVillas, lumenExperiences: draft.lumenExperiences, lumenExtras: draft.lumenExtras, lumenTour: draft.lumenTour, lumenStayTimes: draft.lumenStayTimes, lumenCopy: draft.lumenCopy, lumenPhotos: photos, lumenPhotoAlt: draft.lumenPhotoAlt, accent: draft.theme.accent, heroImage: photoUrl }}><Shell languagePicker={false}>{page === "home" ? <HomePage /> : page === "villas" ? <VillasPage /> : page === "experiences" ? <ExperiencesPage /> : page === "tour" ? <TourPage /> : page === "book" ? <BookPage /> : page === "contact" ? <ContactPage /> : <VillaPage slug={page} />}</Shell></PersonalizationContext>
  </div>;
}
