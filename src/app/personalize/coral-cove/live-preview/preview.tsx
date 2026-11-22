"use client";
import { isCoralPhotoKey } from "@/lib/personalization/coral-photos";
﻿import { useEffect, useState } from "react";
import { emptyDraft, type CoralDraft } from "@/lib/personalization/harbor-draft";
import { PersonalizationContext } from "@/templates/coral-cove/personalization";
import { HomePage } from "@/templates/coral-cove/pages/home";
import { VillasPage } from "@/templates/coral-cove/pages/villas";
import { VillaPage } from "@/templates/coral-cove/pages/villa";
import { BookPage } from "@/templates/coral-cove/pages/book";
import { ContactPage } from "@/templates/coral-cove/pages/contact";
import { ExperiencesPage } from "@/templates/coral-cove/pages/experiences";
import { OffersPage } from "@/templates/coral-cove/pages/offers";
import { GalleryPage } from "@/templates/coral-cove/pages/gallery";
import { Shell } from "@/templates/coral-cove/shell";
import { isCoralVillaImageKey } from "@/lib/personalization/coral-villa-images";
import { isCoralGalleryImageKey } from "@/lib/personalization/coral-gallery-images";
import { isCoralPhotoPlacement } from "@/templates/coral-cove/photo-placements";
import { PhotoOverlays } from "../../photo-overlays";

export function LivePreview() {
  const [draft, setDraft] = useState<CoralDraft>(() => emptyDraft("coral-cove") as CoralDraft);
  const [websitePhotos, setWebsitePhotos] = useState<Record<string, string>>({});
  const [photoUrl, setPhotoUrl] = useState<string>();
  const [page, setPage] = useState("home");
  const [villaPhotos, setVillaPhotos] = useState<Record<string, string>>({});
  const [galleryPhotos, setGalleryPhotos] = useState<Record<string, string>>({});
  const [placementPhotos, setPlacementPhotos] = useState<Record<string, string>>({});
  const [photoEditing, setPhotoEditing] = useState(false);
  const [photoSelection, setPhotoSelection] = useState<string>();

  useEffect(() => {
    const announce = () => { if (window.parent !== window) window.parent.postMessage({ type: "harbor-personalization-ready" }, location.origin); };
    const timer = window.setInterval(announce, 500);
    function receive(event: MessageEvent) {
      if (window.parent === window || event.source !== window.parent || event.origin !== location.origin || event.data?.type !== "harbor-personalization-preview") return;
      const { draft: next, photoUrl: image } = event.data;
      if (!next || next.version !== 1 || next.template !== "coral-cove" || !next.business || !next.home || !next.theme) return;
      // The editor sends only its own blob or the authenticated, same-origin photo route.
      if (image !== undefined && (typeof image !== "string" || !(image.startsWith(`blob:${location.origin}/`) || image.startsWith("/api/personalization/coral-cove/photo?")))) return;
      const photos = event.data.villaPhotos ?? {};
      if (!photos || typeof photos !== "object" || Array.isArray(photos) || Object.entries(photos).some(([key, value]) => !isCoralVillaImageKey(key) || typeof value !== "string" || !(value.startsWith(`blob:${location.origin}/`) || value.startsWith(`/api/personalization/coral-cove/villas/${key}/photo?`)))) return;
      const gallery = event.data.galleryPhotos ?? {};
      if (!gallery || typeof gallery !== "object" || Array.isArray(gallery) || Object.entries(gallery).some(([key, value]) => !isCoralGalleryImageKey(key) || typeof value !== "string" || !(value.startsWith(`blob:${location.origin}/`) || value.startsWith(`/api/personalization/coral-cove/gallery/${key}/photo?`)))) return;
      const website = event.data.pinePhotos ?? {};
      if (!website || typeof website !== "object" || Array.isArray(website) || Object.entries(website).some(([key, value]) => !isCoralPhotoKey(key) || typeof value !== "string" || !(value.startsWith(`blob:${location.origin}/`) || value.startsWith(`/api/personalization/coral-cove/photos/${key}/image?`)))) return;
      setWebsitePhotos(website);
      const placements = event.data.placementPhotos ?? {};
      if (!placements || typeof placements !== "object" || Array.isArray(placements) || Object.entries(placements).some(([key, value]) => !isCoralPhotoPlacement(key) || typeof value !== "string" || !(value.startsWith(`blob:${location.origin}/`) || value.startsWith(`/api/personalization/coral-cove/placements/${key}/image?`)))) return;
      setPlacementPhotos(placements);
      setPhotoEditing(event.data.photoEditing === true);
      setPhotoSelection(isCoralPhotoPlacement(event.data.photoSelection) ? event.data.photoSelection : undefined);
      if (event.data.readyAck === true) window.clearInterval(timer);
      setDraft(next);
      setPhotoUrl(image);
      setVillaPhotos(photos);
      setGalleryPhotos(gallery);
      if (["home", "villas", "experiences", "offers", "gallery", "book", "contact", "overwater-villa", "garden-pool-villa", "beachfront-bungalow", "lagoon-family-villa"].includes(event.data.page)) setPage(event.data.page);
    }
    window.addEventListener("message", receive);
    announce();
    return () => { window.clearInterval(timer); window.removeEventListener("message", receive); };
  }, []);

  function followPreview(href: string) {
    const url = new URL(href, location.origin);
    if (url.origin !== location.origin || !url.pathname.startsWith("/demo/coral-cove")) return;
    const path = url.pathname.replace(/^\/demo\/coral-cove\/?/, "");
    const nextPage = path.startsWith("villas/") ? path.slice(7) : path || "home";
    if (["home", "villas", "experiences", "offers", "gallery", "book", "contact", "overwater-villa", "garden-pool-villa", "beachfront-bungalow", "lagoon-family-villa"].includes(nextPage)) {
      window.history.replaceState(null, "", `${location.pathname}${url.search}`);
      window.parent.postMessage({ type: "coral-preview-page", page: nextPage }, location.origin);
    }
  }
  function previewLink(event: React.MouseEvent) {
    const anchor = (event.target as HTMLElement).closest("a");
    if (!anchor) return;
    const url = new URL(anchor.href, location.origin);
    if (url.origin !== location.origin || !url.pathname.startsWith("/demo/coral-cove")) return;
    event.preventDefault();
    if (!photoEditing) followPreview(anchor.href);
  }
  return <div onClickCapture={previewLink}>
    <PhotoOverlays template="coral-cove" enabled={photoEditing} selected={photoSelection} page={page} />
    <PersonalizationContext value={{ previewNavigate: followPreview, placementPhotos, photoPlacements: draft.photoPlacements, photoEditing, photoSelection, websitePhotos, coralPhotoAlt: draft.coralPhotoAlt, business: draft.business, home: draft.home, homeSections: draft.homeSections, reviews: draft.reviews, reviewsHidden: draft.reviewsHidden, villas: draft.villas, experiences: draft.experiences, offers: draft.offers, contactFaqs: draft.contactFaqs, villaPhotos, galleryPhotos, galleryAlt: draft.galleryAlt, accent: draft.theme.accent, heroImage: photoUrl }}><Shell languagePicker={false}>{page === "home" ? <HomePage /> : page === "villas" ? <VillasPage /> : page === "experiences" ? <ExperiencesPage /> : page === "offers" ? <OffersPage /> : page === "gallery" ? <GalleryPage /> : page === "book" ? <BookPage /> : page === "contact" ? <ContactPage /> : <VillaPage slug={page} />}</Shell></PersonalizationContext>
  </div>;
}
