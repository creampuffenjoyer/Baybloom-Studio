"use client";
import { PHOTO_REGISTRY } from "@/templates/still-water-spa/photo-placements";
import { PhotoOverlays } from "../../photo-overlays";
﻿

import { useEffect, useState } from "react";
import { emptyDraft, type StillWaterDraft } from "@/lib/personalization/harbor-draft";
import { PersonalizationContext } from "@/templates/still-water-spa/personalization";
import { HomePage } from "@/templates/still-water-spa/pages/home";
import { TreatmentsPage } from "@/templates/still-water-spa/pages/treatments";
import { TreatmentPage } from "@/templates/still-water-spa/pages/treatment";
import { PackagesPage } from "@/templates/still-water-spa/pages/packages";
import { AboutPage } from "@/templates/still-water-spa/pages/about";
import { VisitPage } from "@/templates/still-water-spa/pages/visit";
import { GiftCardsPage } from "@/templates/still-water-spa/pages/gift-cards";
import { BookPage } from "@/templates/still-water-spa/pages/book";
import { treatments } from "@/templates/still-water-spa/content";
import { isSpaPhotoKey } from "@/lib/personalization/spa-photos";
import { Shell } from "@/templates/still-water-spa/shell";

export function LivePreview() {
  const [draft, setDraft] = useState<StillWaterDraft>(() => emptyDraft("still-water-spa") as StillWaterDraft);
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
      if (!next || next.version !== 1 || next.template !== "still-water-spa" || !next.business || !next.home || !next.theme) return;
      // The editor sends only its own blob or the authenticated, same-origin photo route.
      if (image !== undefined && (typeof image !== "string" || !(image.startsWith(`blob:${location.origin}/`) || image.startsWith("/api/personalization/still-water-spa/photo?")))) return;
      if (event.data.readyAck === true) window.clearInterval(timer);
      const nextPhotos = event.data.pinePhotos ?? {};
      if (!nextPhotos || typeof nextPhotos !== "object" || Array.isArray(nextPhotos) || Object.entries(nextPhotos).some(([key, value]) => !isSpaPhotoKey(key) || typeof value !== "string" || !(value.startsWith(`blob:${location.origin}/`) || value.startsWith(`/api/personalization/still-water-spa/photos/${key}/image?`)))) return;
      const placements = event.data.placementPhotos ?? {};
      if (!placements || typeof placements !== "object" || Array.isArray(placements) || Object.entries(placements).some(([key, value]) => !PHOTO_REGISTRY.is(key) || typeof value !== "string" || !(value.startsWith(`blob:${location.origin}/`) || value.startsWith(`/api/personalization/still-water-spa/placements/${key}/image?`)))) return;
      setPlacementPhotos(placements); setPhotoEditing(event.data.photoEditing === true); setPhotoSelection(PHOTO_REGISTRY.is(event.data.photoSelection) ? event.data.photoSelection : undefined);
      setDraft(next);
      setPhotos(nextPhotos);
      setPhotoUrl(image);
      if (["home", "treatments", "packages", "about", "visit", "gift-cards", "book", ...treatments.map(item => item.slug)].includes(event.data.page)) setPage(event.data.page);
    }
    window.addEventListener("message", receive);
    announce();
    return () => { window.clearInterval(timer); window.removeEventListener("message", receive); };
  }, []);

  function previewLink(event: React.MouseEvent) {
    const anchor = (event.target as HTMLElement).closest("a"); if (!anchor) return;
    const url = new URL(anchor.href, location.origin);
    if (url.origin !== location.origin || !/^\/demo\/still-water-spa(?:\/|$)/.test(url.pathname)) return;
    event.preventDefault(); if (photoEditing) return;
    const path = url.pathname.replace(/^\/demo\/still-water-spa\/?/, "");
    const nextPage = path.split("/").at(-1) || "home";
    if (PHOTO_REGISTRY.pages.some(item => item.id === nextPage)) { window.history.replaceState(null, "", location.pathname + url.search + url.hash); window.parent.postMessage({ type: "spa-preview-page", page: nextPage }, location.origin); }
  }
  return <div onClickCapture={previewLink}>
    <PhotoOverlays template="still-water-spa" enabled={photoEditing} selected={photoSelection} page={page} />
    <PersonalizationContext value={{ placementPhotos, photoPlacements: draft.photoPlacements, photoEditing, photoSelection, business: draft.business, home: draft.home, spaTreatments: draft.spaTreatments, spaPackages: draft.spaPackages, spaTherapists: draft.spaTherapists, spaReviews: draft.spaReviews, spaCopy: draft.spaCopy, spaHours: draft.spaHours, spaPhotos: photos, spaPhotoAlt: draft.spaPhotoAlt, spaMemberships: draft.spaMemberships, spaReviewsHidden: draft.spaReviewsHidden, accent: draft.theme.accent, heroImage: photoUrl }}><Shell>{page === "home" ? <HomePage /> : page === "treatments" ? <TreatmentsPage /> : page === "packages" ? <PackagesPage /> : page === "about" ? <AboutPage /> : page === "visit" ? <VisitPage /> : page === "gift-cards" ? <GiftCardsPage /> : page === "book" ? <BookPage /> : <TreatmentPage slug={page} />}</Shell></PersonalizationContext>
  </div>;
}
