"use client";
import { PHOTO_REGISTRY } from "@/templates/ember-and-salt/photo-placements";
import { PhotoOverlays } from "../../photo-overlays";
﻿

import { useEffect, useState } from "react";
import { emptyDraft, type EmberDraft } from "@/lib/personalization/harbor-draft";
import { PersonalizationContext } from "@/templates/ember-and-salt/personalization";
import { HomePage } from "@/templates/ember-and-salt/pages/home";
import { Shell } from "@/templates/ember-and-salt/shell";
import { MenuPage } from "@/templates/ember-and-salt/pages/menu";
import { PrivateDiningPage } from "@/templates/ember-and-salt/pages/private-dining";
import { StoryPage } from "@/templates/ember-and-salt/pages/story";
import { GiftCardsPage } from "@/templates/ember-and-salt/pages/gift-cards";
import { ReservePage } from "@/templates/ember-and-salt/pages/reserve";
import { VisitPage } from "@/templates/ember-and-salt/pages/visit";
import { isEmberPhotoKey } from "@/lib/personalization/ember-photos";

export function LivePreview() {
  const [draft, setDraft] = useState<EmberDraft>(() => emptyDraft("ember-and-salt") as EmberDraft);
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
      if (!next || next.version !== 1 || next.template !== "ember-and-salt" || !next.business || !next.home || !next.theme) return;
      // The editor sends only its own blob or the authenticated, same-origin photo route.
      if (image !== undefined && (typeof image !== "string" || !(image.startsWith(`blob:${location.origin}/`) || image.startsWith("/api/personalization/ember-and-salt/photo?")))) return;
      const nextPhotos = event.data.pinePhotos ?? {};
      if (!nextPhotos || typeof nextPhotos !== "object" || Array.isArray(nextPhotos) || Object.entries(nextPhotos).some(([key, value]) => !isEmberPhotoKey(key) || typeof value !== "string" || !(value.startsWith(`blob:${location.origin}/`) || value.startsWith(`/api/personalization/ember-and-salt/photos/${key}/image?`)))) return;
      if (event.data.readyAck === true) window.clearInterval(timer);
      const placements = event.data.placementPhotos ?? {};
      if (!placements || typeof placements !== "object" || Array.isArray(placements) || Object.entries(placements).some(([key, value]) => !PHOTO_REGISTRY.is(key) || typeof value !== "string" || !(value.startsWith(`blob:${location.origin}/`) || value.startsWith(`/api/personalization/ember-and-salt/placements/${key}/image?`)))) return;
      setPlacementPhotos(placements); setPhotoEditing(event.data.photoEditing === true); setPhotoSelection(PHOTO_REGISTRY.is(event.data.photoSelection) ? event.data.photoSelection : undefined);
      setDraft(next);
      setPhotoUrl(image);
      setPhotos(nextPhotos);
      if (["home", "menu", "private-dining", "story", "gift-cards", "reserve", "visit"].includes(event.data.page)) setPage(event.data.page);
    }
    window.addEventListener("message", receive);
    announce();
    return () => { window.clearInterval(timer); window.removeEventListener("message", receive); };
  }, []);

  function previewLink(event: React.MouseEvent) {
    const anchor = (event.target as HTMLElement).closest("a"); if (!anchor) return;
    const url = new URL(anchor.href, location.origin);
    if (url.origin !== location.origin || !/^\/demo\/ember-and-salt(?:\/|$)/.test(url.pathname)) return;
    event.preventDefault(); if (photoEditing) return;
    const path = url.pathname.replace(/^\/demo\/ember-and-salt\/?/, "");
    const nextPage = path.split("/").at(-1) || "home";
    if (PHOTO_REGISTRY.pages.some(item => item.id === nextPage)) { window.history.replaceState(null, "", location.pathname + url.search + url.hash); window.parent.postMessage({ type: "ember-preview-page", page: nextPage }, location.origin); }
  }
  return <div onClickCapture={previewLink}>
    <PhotoOverlays template="ember-and-salt" enabled={photoEditing} selected={photoSelection} page={page} />
    <PersonalizationContext value={{ placementPhotos, photoPlacements: draft.photoPlacements, photoEditing, photoSelection, business: draft.business, home: draft.home, emberMenus: draft.emberMenus, emberSections: draft.emberSections, emberDishes: draft.emberDishes, emberSpaces: draft.emberSpaces, emberHours: draft.emberHours, emberStory: draft.emberStory, emberCopy: draft.emberCopy, emberPress: draft.emberPress, emberPressHidden: draft.emberPressHidden, emberSignatures: draft.emberSignatures, emberPhotos: photos, emberPhotoAlt: draft.emberPhotoAlt, accent: draft.theme.accent, heroImage: photoUrl }}><Shell>{page === "home" ? <HomePage /> : page === "menu" ? <MenuPage /> : page === "private-dining" ? <PrivateDiningPage /> : page === "story" ? <StoryPage /> : page === "gift-cards" ? <GiftCardsPage /> : page === "reserve" ? <ReservePage /> : <VisitPage />}</Shell></PersonalizationContext>
  </div>;
}
