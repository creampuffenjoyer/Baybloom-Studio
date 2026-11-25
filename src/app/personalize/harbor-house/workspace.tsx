"use client";

import { BloomGuide } from "@/components/bloom-guide";
import Link from "next/link";
import { useLocationPhotoEditor } from "../photo-editor";
import { PHOTO_TEMPLATES } from "../photo-templates";
import { useEffect, useMemo, useRef, useState } from "react";
import { emptyDraft, parseDraft, type CoralDraft, type HarborDraft, type PersonalizationDraft } from "@/lib/personalization/harbor-draft";
import { HARBOR_ROOM_IMAGE_KEYS, isHarborRoomImageKey, type HarborRoomImageKey } from "@/lib/personalization/harbor-room-images";
import { isCoralVillaImageKey } from "@/lib/personalization/coral-villa-images";
import { isCoralGalleryImageKey, type CoralGalleryImageKey } from "@/lib/personalization/coral-gallery-images";
import { breakfast as harborBreakfast, places as harborPlaces, rooms as harborRooms } from "@/templates/harbor-house/content";
import { site as harborSite } from "@/templates/harbor-house/site";
import { site as coralSite } from "@/templates/coral-cove/site";
import { site as pineSite } from "@/templates/pine-ridge-lodge/site";
import { villas as coralVillas, experiences as coralExperiences, offers as coralOffers, photo as coralPhoto } from "@/templates/coral-cove/content";
import { PineContentControls } from "@/app/personalize/pine-ridge-lodge/content-controls";
import { LumenContentControls } from "@/app/personalize/lumen-lake-villas/content-controls";
import { villas as lumenVillas } from "@/templates/lumen-lake-villas/content";
import { site as lumenSite } from "@/templates/lumen-lake-villas/site";
import { IslaContentControls } from "@/app/personalize/isla-verde-boutique/content-controls";
import { rooms as islaRooms, posts as islaPosts } from "@/templates/isla-verde-boutique/content";
import { site as islaSite } from "@/templates/isla-verde-boutique/site";
import { BloomfieldContentControls } from "@/app/personalize/bloomfield-gardens/content-controls";
import { spaces as bloomSpaces, photo as bloomPhoto } from "@/templates/bloomfield-gardens/content";
import { HOUSE_PHOTO_KEYS, isHousePhotoKey, type HousePhotoKey } from "@/lib/personalization/house-photos";
import { CORAL_PHOTO_KEYS, isCoralPhotoKey, type CoralPhotoKey } from "@/lib/personalization/coral-photos";
import { photo as housePhoto } from "@/templates/harbor-house/content";
import { BLOOM_PHOTO_KEYS, isBloomPhotoKey, type BloomPhotoKey } from "@/lib/personalization/bloom-photos";
import { SPA_PHOTO_KEYS, isSpaPhotoKey, type SpaPhotoKey } from "@/lib/personalization/spa-photos";
import { photo as spaPhoto } from "@/templates/still-water-spa/content";
import { EmberContentControls } from "@/app/personalize/ember-and-salt/content-controls";
import { StillWaterContentControls } from "@/app/personalize/still-water-spa/content-controls";
import { treatments as spaTreatments } from "@/templates/still-water-spa/content";
import { site as emberSite } from "@/templates/ember-and-salt/site";
import { rooms as pineRooms, posts as pinePosts } from "@/templates/pine-ridge-lodge/content";
import { PINE_PHOTO_KEYS, isPinePhotoKey, type PinePhotoKey } from "@/lib/personalization/pine-photos";
import { photo as pinePhoto } from "@/templates/pine-ridge-lodge/content";
import { LUMEN_PHOTO_KEYS, isLumenPhotoKey, type LumenPhotoKey } from "@/lib/personalization/lumen-photos";
import { photo as lumenPhoto } from "@/templates/lumen-lake-villas/content";
import { ISLA_PHOTO_KEYS, isIslaPhotoKey, type IslaPhotoKey } from "@/lib/personalization/isla-photos";
import { photo as islaPhoto } from "@/templates/isla-verde-boutique/content";
import { EMBER_PHOTO_KEYS, isEmberPhotoKey, type EmberPhotoKey } from "@/lib/personalization/ember-photos";
import { photo as emberPhoto } from "@/templates/ember-and-salt/content";

const fieldClass = "mt-1 w-full rounded-lg border border-[#c9d1cf] bg-white px-3 py-2 text-sm text-[#203b3b]";
type HarborRoomKey = keyof NonNullable<HarborDraft["rooms"]>;
const harborRoomKeys: readonly HarborRoomKey[] = HARBOR_ROOM_IMAGE_KEYS;
type RoomPhoto = { url?: string; savedUrl?: string; file?: File; changed: boolean };
type HarborPlaceKey = keyof NonNullable<NonNullable<HarborDraft["guide"]>["places"]>;
const harborPlaceKeys: HarborPlaceKey[] = ["naidi-hills", "vayang-hills", "valugan-beach", "honesty-coffee", "chawa-view", "kusina"];
type CoralVillaKey = keyof NonNullable<CoralDraft["villas"]>;
const coralVillaKeys: CoralVillaKey[] = ["overwater-villa", "garden-pool-villa", "beachfront-bungalow", "lagoon-family-villa"];
type CoralExperienceKey = keyof NonNullable<CoralDraft["experiences"]>;
const coralExperienceKeys: CoralExperienceKey[] = ["house-reef", "island-hopping", "diving", "sailing", "spa", "sandbar-dinner"];
type CoralOfferKey = keyof NonNullable<CoralDraft["offers"]>;
const coralOfferKeys: CoralOfferKey[] = ["stay-longer", "honeymoon", "dive-and-stay"];
type CoralFaqKey = keyof NonNullable<CoralDraft["contactFaqs"]>;
const coralFaqs: readonly [CoralFaqKey, string][] = [["gettingHere", "Getting here"], ["breakfast", "Breakfast"], ["cancellation", "Cancellation"], ["children", "Children"]];

export function HarborEditor({ template = "harbor-house" }: { template?: PersonalizationDraft["template"] }) {
  const coral = template === "coral-cove";
  const locationEnabled = true;
  const photoTemplate = PHOTO_TEMPLATES[template];
  const pine = template === "pine-ridge-lodge";
  const lumen = template === "lumen-lake-villas";
  const isla = template === "isla-verde-boutique";
  const ember = template === "ember-and-salt";
  const stillWater = template === "still-water-spa";
  const bloomfield = template === "bloomfield-gardens";
  const title = bloomfield ? "Bloomfield Gardens" : stillWater ? "Still Water Spa" : ember ? "Ember & Salt" : isla ? "Isla Verde" : lumen ? "Lumen Lake Villas" : pine ? "Pine Ridge Lodge" : coral ? "Coral Cove" : "Harbor House";
  const [draft, setDraft] = useState<PersonalizationDraft>(() => emptyDraft(template));
  const [photoUrl, setPhotoUrl] = useState<string>();
  const [photoChange, setPhotoChange] = useState<{ action: "keep" | "remove" } | { action: "replace"; file: File }>({ action: "keep" });
  const photoUrlRef = useRef<string | undefined>(undefined);
  const [error, setError] = useState("");
  const [fileKey, setFileKey] = useState(0);
  const [saveStatus, setSaveStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [signInNeeded, setSignInNeeded] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewReady, setPreviewReady] = useState(false);
  const [previewPage, setPreviewPage] = useState("home");
  const [roomKey, setRoomKey] = useState<HarborRoomKey>("lighthouse-room");
  const [villaKey, setVillaKey] = useState<CoralVillaKey>("overwater-villa");
  const [experienceKey, setExperienceKey] = useState<CoralExperienceKey>("house-reef");
  const [offerKey, setOfferKey] = useState<CoralOfferKey>("stay-longer");
  const [faqKey, setFaqKey] = useState<CoralFaqKey>("gettingHere");
  const [reviewKey, setReviewKey] = useState<"first" | "second" | "third">("first");
  const [roomPhotos, setRoomPhotos] = useState<Partial<Record<HarborRoomImageKey, RoomPhoto>>>({});
  const [villaPhotos, setVillaPhotos] = useState<Partial<Record<CoralVillaKey, RoomPhoto>>>({});
  const [galleryPhotos, setGalleryPhotos] = useState<Partial<Record<CoralGalleryImageKey, RoomPhoto>>>({});
  const [pinePhotoKey, setPinePhotoKey] = useState<PinePhotoKey | LumenPhotoKey | IslaPhotoKey | EmberPhotoKey | SpaPhotoKey | BloomPhotoKey | HousePhotoKey | CoralPhotoKey>(template === "harbor-house" ? HOUSE_PHOTO_KEYS[0] : coral ? CORAL_PHOTO_KEYS[0] : bloomfield ? BLOOM_PHOTO_KEYS[0] : stillWater ? SPA_PHOTO_KEYS[0] : ember ? EMBER_PHOTO_KEYS[0] : isla ? ISLA_PHOTO_KEYS[0] : lumen ? LUMEN_PHOTO_KEYS[0] : PINE_PHOTO_KEYS[0]);
  const [pinePhotos, setPinePhotos] = useState<Partial<Record<PinePhotoKey | LumenPhotoKey | IslaPhotoKey | EmberPhotoKey | SpaPhotoKey | BloomPhotoKey | HousePhotoKey | CoralPhotoKey, RoomPhoto>>>({});
  const pineBlobUrls = useRef<Partial<Record<PinePhotoKey | LumenPhotoKey | IslaPhotoKey | EmberPhotoKey | SpaPhotoKey | BloomPhotoKey | HousePhotoKey | CoralPhotoKey, string>>>({});
  const [pineFileKey, setPineFileKey] = useState(0);
  const roomBlobUrls = useRef<Partial<Record<HarborRoomImageKey, string>>>({});
  const [placeKey, setPlaceKey] = useState<HarborPlaceKey>("naidi-hills");
  const previewRef = useRef<HTMLIFrameElement>(null);
  const roomPhotoUrls = useMemo(() => Object.fromEntries(Object.entries(roomPhotos).flatMap(([key, photo]) => photo?.url ? [[key, photo.url]] : [])), [roomPhotos]);
  const villaPhotoUrls = useMemo(() => Object.fromEntries(Object.entries(villaPhotos).flatMap(([key, photo]) => photo?.url ? [[key, photo.url]] : [])), [villaPhotos]);
  const galleryPhotoUrls = useMemo(() => Object.fromEntries(Object.entries(galleryPhotos).flatMap(([key, photo]) => photo?.url ? [[key, photo.url]] : [])), [galleryPhotos]);
  const pinePhotoUrls = useMemo(() => Object.fromEntries(Object.entries(pinePhotos).flatMap(([key, photo]) => photo?.url ? [[key, photo.url]] : [])), [pinePhotos]);

  const locationPhotos = useLocationPhotoEditor({ draft, setDraft, page: previewPage, setPage: setPreviewPage, busy, ready: previewReady, saveChanges: () => void draftRequest("save"), saveStatus, signInNeeded, legacy: { hero: photoUrl, library: pinePhotoUrls, rooms: roomPhotoUrls, villas: villaPhotoUrls, gallery: galleryPhotoUrls } });
  const { urls: placementUrls, editing: photoEditing, selected: photoSelection, select: selectPhoto } = locationPhotos;

  useEffect(() => {
    previewRef.current?.contentWindow?.postMessage({ type: "harbor-personalization-preview", draft, photoUrl, roomPhotos: roomPhotoUrls, villaPhotos: villaPhotoUrls, galleryPhotos: galleryPhotoUrls, pinePhotos: pinePhotoUrls, page: previewPage, ...(locationEnabled ? { placementPhotos: placementUrls, photoEditing: photoEditing, photoSelection: photoSelection } : {}) }, window.location.origin);
    function receive(event: MessageEvent) {
      if (locationEnabled && event.origin === window.location.origin && event.source === previewRef.current?.contentWindow) {
        if (event.data?.type === `${photoTemplate.prefix}-photo-selected` && photoTemplate.is(event.data.placement)) selectPhoto(event.data.placement, true);
        if (event.data?.type === `${photoTemplate.prefix}-preview-page` && photoTemplate.pages.some(page => page.id === event.data.page)) setPreviewPage(event.data.page);
      }
      if (event.origin === window.location.origin && event.source === previewRef.current?.contentWindow && event.data?.type === "harbor-personalization-ready") {
        setPreviewReady(true);
        previewRef.current?.contentWindow?.postMessage({ type: "harbor-personalization-preview", draft, photoUrl, roomPhotos: roomPhotoUrls, villaPhotos: villaPhotoUrls, galleryPhotos: galleryPhotoUrls, pinePhotos: pinePhotoUrls, page: previewPage, ...(locationEnabled ? { placementPhotos: placementUrls, photoEditing: photoEditing, photoSelection: photoSelection } : {}), readyAck: true }, window.location.origin);
      }
    }
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [draft, photoUrl, roomPhotoUrls, villaPhotoUrls, galleryPhotoUrls, pinePhotoUrls, previewPage, locationEnabled, photoTemplate, placementUrls, photoEditing, photoSelection, selectPhoto]);

  useEffect(() => () => { if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current); }, []);
  useEffect(() => { const urls = roomBlobUrls.current; return () => { Object.values(urls).forEach((url) => URL.revokeObjectURL(url)); }; }, []);
  useEffect(() => { const urls = pineBlobUrls.current; return () => { Object.values(urls).forEach((url) => URL.revokeObjectURL(url)); }; }, []);

  function clearPineBlob(key: PinePhotoKey | LumenPhotoKey | IslaPhotoKey | EmberPhotoKey | SpaPhotoKey | BloomPhotoKey | HousePhotoKey | CoralPhotoKey) { const url = pineBlobUrls.current[key]; if (url) URL.revokeObjectURL(url); delete pineBlobUrls.current[key]; }

  function clearRoomBlob(key: HarborRoomImageKey) {
    const url = roomBlobUrls.current[key];
    if (url) URL.revokeObjectURL(url);
    delete roomBlobUrls.current[key];
  }

  function clearAllRoomBlobs() {
    for (const key of HARBOR_ROOM_IMAGE_KEYS) clearRoomBlob(key);
  }

  function replacePhoto(file?: File) {
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    const url = file ? URL.createObjectURL(file) : undefined;
    photoUrlRef.current = url;
    setPhotoUrl(url);
  }

  function reset() {
    setDraft(emptyDraft(template));
    if (locationEnabled) locationPhotos.reset();
    replacePhoto();
    setPhotoChange({ action: "remove" });
    clearAllRoomBlobs();
    setVillaPhotos((current) => Object.fromEntries(Object.entries(current).flatMap(([key, photo]) => photo?.savedUrl ? [[key, { url: photo.savedUrl, savedUrl: photo.savedUrl, changed: false }]] : [])));
    setGalleryPhotos((current) => Object.fromEntries(Object.entries(current).flatMap(([key, photo]) => photo?.savedUrl ? [[key, { url: photo.savedUrl, savedUrl: photo.savedUrl, changed: false }]] : [])));
    [...PINE_PHOTO_KEYS, ...LUMEN_PHOTO_KEYS, ...ISLA_PHOTO_KEYS, ...EMBER_PHOTO_KEYS, ...SPA_PHOTO_KEYS, ...BLOOM_PHOTO_KEYS, ...HOUSE_PHOTO_KEYS, ...CORAL_PHOTO_KEYS].forEach(clearPineBlob);
    setPinePhotos((current) => Object.fromEntries(Object.entries(current).flatMap(([key, photo]) => photo?.savedUrl ? [[key, { url: photo.savedUrl, savedUrl: photo.savedUrl, changed: false }]] : [])));
    setPineFileKey((value) => value + 1);
    setRoomPhotos((current) => Object.fromEntries(Object.entries(current).flatMap(([key, photo]) => photo?.savedUrl ? [[key, { url: photo.savedUrl, savedUrl: photo.savedUrl, changed: false }]] : [])));

    setError("");
    setSaveStatus("Changes reset in this preview. Your saved draft has not been changed.");
    setFileKey((value) => value + 1);
  }

  function updateAddress(index: number, value: string) {
    setDraft((current) => {
      if (current.template !== "harbor-house" && current.template !== "coral-cove" && current.template !== "pine-ridge-lodge" && current.template !== "lumen-lake-villas" && current.template !== "isla-verde-boutique" && current.template !== "ember-and-salt") return current;
      const address = [...(current.business.address ?? (current.template === "coral-cove" ? coralSite.address : current.template === "pine-ridge-lodge" ? pineSite.address : current.template === "lumen-lake-villas" ? lumenSite.address : current.template === "isla-verde-boutique" ? islaSite.address : current.template === "ember-and-salt" ? emberSite.address : harborSite.address))];
      address[index] = value;
      const business = { ...current.business };
      if (address.some((line) => line.trim())) business.address = address;
      else delete business.address;
      return { ...current, business };
    });
  }

  function updateBusiness(field: "name" | "tagline" | "hosts" | "phone" | "email", value: string) {
    setDraft((current) => {
      const business = { ...current.business };
      if (value) business[field] = value;
      else delete business[field];
      return { ...current, business };
    });
  }

  function updateRoom(field: "name" | "postcard" | "description" | "bed" | "view" | "features", value: string) {
    setDraft((current) => {
      if (current.template !== "harbor-house") return current;
      const room: NonNullable<NonNullable<HarborDraft["rooms"]>[HarborRoomKey]> = { ...current.rooms?.[roomKey] };
      if (value) room[field] = value;
      else delete room[field];
      const rooms = { ...current.rooms };
      if (Object.keys(room).length) rooms[roomKey] = room;
      else delete rooms[roomKey];
      return { ...current, rooms: Object.keys(rooms).length ? rooms : undefined };
    });
  }

  function updateRoomNumber(field: "price" | "maxGuests", value: string) {
    setDraft((current) => {
      if (current.template !== "harbor-house") return current;
      const room: NonNullable<NonNullable<HarborDraft["rooms"]>[HarborRoomKey]> = { ...current.rooms?.[roomKey] };
      if (value !== "") room[field] = Number(value); else delete room[field];
      const rooms = { ...current.rooms };
      if (Object.keys(room).length) rooms[roomKey] = room; else delete rooms[roomKey];
      return { ...current, rooms: Object.keys(rooms).length ? rooms : undefined };
    });
  }

  function updateVilla(field: "name" | "short" | "description" | "beds" | "view" | "amenities" | "price" | "size" | "maxGuests", value: string) {
    setDraft((current) => {
      if (current.template !== "coral-cove") return current;
      const villa = { ...current.villas?.[villaKey] };
      if (field === "price" || field === "size" || field === "maxGuests") {
        if (value !== "") villa[field] = Number(value); else delete villa[field];
      } else if (value) villa[field] = value; else delete villa[field];
      const villas = { ...current.villas };
      if (Object.keys(villa).length) villas[villaKey] = villa; else delete villas[villaKey];
      return { ...current, villas: Object.keys(villas).length ? villas : undefined };
    });
  }

  function updateExperience(field: "name" | "summary" | "detail" | "duration" | "price", value: string) {
    setDraft((current) => {
      if (current.template !== "coral-cove") return current;
      const experience = { ...current.experiences?.[experienceKey] };
      if (value) experience[field] = value; else delete experience[field];
      const experiences = { ...current.experiences };
      if (Object.keys(experience).length) experiences[experienceKey] = experience; else delete experiences[experienceKey];
      return { ...current, experiences: Object.keys(experiences).length ? experiences : undefined };
    });
  }

  function updateOffer(field: "name" | "headline" | "body" | "includes" | "terms", value: string) {
    setDraft((current) => {
      if (current.template !== "coral-cove") return current;
      const offer = { ...current.offers?.[offerKey] };
      if (value) offer[field] = value; else delete offer[field];
      const offers = { ...current.offers };
      if (Object.keys(offer).length) offers[offerKey] = offer; else delete offers[offerKey];
      return { ...current, offers: Object.keys(offers).length ? offers : undefined };
    });
  }

  function updateFaq(field: "question" | "answer", value: string) {
    setDraft((current) => {
      if (current.template !== "coral-cove") return current;
      const entry = { ...current.contactFaqs?.[faqKey] };
      if (value) entry[field] = value; else delete entry[field];
      const contactFaqs = { ...current.contactFaqs };
      if (Object.keys(entry).length) contactFaqs[faqKey] = entry; else delete contactFaqs[faqKey];
      return { ...current, contactFaqs: Object.keys(contactFaqs).length ? contactFaqs : undefined };
    });
  }

  function updateCoralHome(field: "travelHeading" | "reefHeading" | "reefText", value: string) {
    setDraft((current) => {
      if (current.template !== "coral-cove") return current;
      const homeSections = { ...current.homeSections };
      if (value) homeSections[field] = value; else delete homeSections[field];
      return { ...current, homeSections: Object.keys(homeSections).length ? homeSections : undefined };
    });
  }

  function updateTravelStep(step: "first" | "second" | "third", field: "title" | "text", value: string) {
    setDraft((current) => {
      if (current.template !== "coral-cove") return current;
      const homeSections = { ...current.homeSections };
      const travel = { ...homeSections.travel };
      const entry = { ...travel[step] };
      if (value) entry[field] = value; else delete entry[field];
      if (Object.keys(entry).length) travel[step] = entry; else delete travel[step];
      if (Object.keys(travel).length) homeSections.travel = travel; else delete homeSections.travel;
      return { ...current, homeSections: Object.keys(homeSections).length ? homeSections : undefined };
    });
  }

  function updateReview(field: "quote" | "name" | "from" | "stay", value: string) {
    setDraft((current) => {
      if (current.template !== "coral-cove") return current;
      const review = { ...current.reviews?.[reviewKey] };
      if (value) review[field] = value; else delete review[field];
      const reviews = { ...current.reviews };
      if (Object.keys(review).length) reviews[reviewKey] = review; else delete reviews[reviewKey];
      return { ...current, reviews: Object.keys(reviews).length ? reviews : undefined };
    });
  }

  function updateBreakfast(field: "heading" | "intro" | "takeaway", value: string) {
    setDraft((current) => {
      if (current.template !== "harbor-house") return current;
      const breakfast = { ...current.breakfast };
      if (value) breakfast[field] = value; else delete breakfast[field];
      return { ...current, breakfast: Object.keys(breakfast).length ? breakfast : undefined };
    });
  }

  function updateBreakfastSection(section: "morning" | "advance", field: "title" | "items", value: string) {
    setDraft((current) => {
      if (current.template !== "harbor-house") return current;
      const breakfast = { ...current.breakfast };
      const entry = { ...breakfast[section] };
      if (value) entry[field] = value; else delete entry[field];
      if (Object.keys(entry).length) breakfast[section] = entry; else delete breakfast[section];
      return { ...current, breakfast: Object.keys(breakfast).length ? breakfast : undefined };
    });
  }

  function updateGuide(field: "heading" | "intro", value: string) {
    setDraft((current) => {
      if (current.template !== "harbor-house") return current;
      const guide = { ...current.guide };
      if (value) guide[field] = value; else delete guide[field];
      return { ...current, guide: Object.keys(guide).length ? guide : undefined };
    });
  }

  function updatePlace(field: "name" | "distance" | "note", value: string) {
    setDraft((current) => {
      if (current.template !== "harbor-house") return current;
      const guide = { ...current.guide };
      const places = { ...guide.places };
      const place: NonNullable<NonNullable<NonNullable<HarborDraft["guide"]>["places"]>[HarborPlaceKey]> = { ...places[placeKey] };
      if (value) place[field] = value; else delete place[field];
      if (Object.keys(place).length) places[placeKey] = place; else delete places[placeKey];
      if (Object.keys(places).length) guide.places = places; else delete guide.places;
      return { ...current, guide: Object.keys(guide).length ? guide : undefined };
    });
  }

  async function draftRequest(action: "load" | "save") {
    if (action === "load" && locationEnabled && locationPhotos.pending && !window.confirm("Discard unsaved changes and load your saved draft?")) return;
    setBusy(true);
    setSaveStatus("");
    setSignInNeeded(false);
    try {
      let photo: { action: "keep" | "remove" } | { action: "replace"; base64: string } = { action: "keep" };
      if (action === "save") {
        if (photoChange.action === "replace") {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => typeof reader.result === "string" ? resolve(reader.result.slice(reader.result.indexOf(",") + 1)) : reject(new Error("Image could not be read"));
            reader.onerror = () => reject(new Error("Image could not be read"));
            reader.readAsDataURL(photoChange.file);
          });
          photo = { action: "replace", base64 };
        } else photo = photoChange;
      }
      const response = await fetch(`/api/personalization/${template}`, action === "save" ? {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ draft, photo }),
      } : { cache: "no-store" });
      const data = await response.json();
      if (response.status === 401) setSignInNeeded(true);
      if (!response.ok) { setSaveStatus(data.error || "Could not access your draft. Please try again."); return; }
      if (action === "save" && locationEnabled) {
        setPhotoChange({ action: "keep" });
        const complete = await locationPhotos.save(draft);
        setSaveStatus(complete ? "All text and photo changes saved." : "Your text was saved, but some photos failed. Check the photo status and retry Save changes.");
        return;
      }
      if (action === "save") { setPhotoChange({ action: "keep" }); setSaveStatus(Object.values(roomPhotos).some((photo) => photo?.changed) ? "Draft saved. Save each changed room photo separately." : Object.values(galleryPhotos).some((photo) => photo?.changed) ? "Draft saved. Save each changed villa or gallery photo separately." : Object.values(villaPhotos).some((photo) => photo?.changed) ? "Draft saved. Save each changed villa photo separately." : Object.values(pinePhotos).some((photo) => photo?.changed) ? "Draft saved. Save each changed website photo separately." : "Draft and photo changes saved to your account."); return; }
      if (!data.draft) { setSaveStatus(`You don't have a saved ${title} draft yet.`); return; }
      const parsed = parseDraft(data.draft, template);
      if (!parsed.success) { setSaveStatus("This draft could not be opened. Please contact support."); return; }
      setDraft(parsed.data);
      if (locationEnabled) locationPhotos.load({ ...data, draft: parsed.data });
      replacePhoto();
      setPhotoUrl(data.hasPhoto ? `/api/personalization/${template}/photo?v=${encodeURIComponent(data.updatedAt)}` : undefined);
      setPhotoChange({ action: "keep" });
      if (template === "harbor-house") {
        clearAllRoomBlobs();
        const images: Partial<Record<HarborRoomImageKey, RoomPhoto>> = {};
        if (Array.isArray(data.roomPhotos)) for (const item of data.roomPhotos) {
          const slot: unknown = item?.slot;
          if (typeof slot === "string" && isHarborRoomImageKey(slot) && typeof item.updatedAt === "string") {
            const url = `/api/personalization/harbor-house/rooms/${slot}/photo?v=${encodeURIComponent(item.updatedAt)}`;
            images[slot] = { url, savedUrl: url, changed: false };
          }
        }
        setRoomPhotos(images);

      }
      if (template === "coral-cove") {
        const images: Partial<Record<CoralVillaKey, RoomPhoto>> = {};
        if (Array.isArray(data.villaPhotos)) for (const item of data.villaPhotos) {
          const slot: unknown = item?.slot;
          if (typeof slot === "string" && isCoralVillaImageKey(slot) && typeof item.updatedAt === "string") {
            const url = `/api/personalization/coral-cove/villas/${slot}/photo?v=${encodeURIComponent(item.updatedAt)}`;
            images[slot] = { url, savedUrl: url, changed: false };
          }
        }
        setVillaPhotos(images);
        const galleryImages: Partial<Record<CoralGalleryImageKey, RoomPhoto>> = {};
        if (Array.isArray(data.galleryPhotos)) for (const item of data.galleryPhotos) {
          const slot: unknown = item?.slot;
          if (typeof slot === "string" && isCoralGalleryImageKey(slot) && typeof item.updatedAt === "string") {
            const url = `/api/personalization/coral-cove/gallery/${slot}/photo?v=${encodeURIComponent(item.updatedAt)}`;
            galleryImages[slot] = { url, savedUrl: url, changed: false };
          }
        }
        setGalleryPhotos(galleryImages);
      }
      if (template === "pine-ridge-lodge" || template === "lumen-lake-villas" || template === "isla-verde-boutique" || template === "ember-and-salt" || template === "still-water-spa" || template === "bloomfield-gardens" || template === "harbor-house" || template === "coral-cove") {
        [...PINE_PHOTO_KEYS, ...LUMEN_PHOTO_KEYS, ...ISLA_PHOTO_KEYS, ...EMBER_PHOTO_KEYS, ...SPA_PHOTO_KEYS, ...BLOOM_PHOTO_KEYS, ...HOUSE_PHOTO_KEYS, ...CORAL_PHOTO_KEYS].forEach(clearPineBlob);
        const images: Partial<Record<PinePhotoKey | LumenPhotoKey | IslaPhotoKey | EmberPhotoKey | SpaPhotoKey | BloomPhotoKey | HousePhotoKey | CoralPhotoKey, RoomPhoto>> = {};
        if (Array.isArray(data.photos)) for (const item of data.photos) {
          const slot: unknown = item?.slot;
          if (typeof slot === "string" && (isPinePhotoKey(slot) || isLumenPhotoKey(slot) || isIslaPhotoKey(slot) || isEmberPhotoKey(slot) || isSpaPhotoKey(slot) || isBloomPhotoKey(slot) || isHousePhotoKey(slot) || isCoralPhotoKey(slot)) && (template === "harbor-house" ? isHousePhotoKey(slot) : template === "coral-cove" ? isCoralPhotoKey(slot) : template === "pine-ridge-lodge" ? isPinePhotoKey(slot) : template === "lumen-lake-villas" ? isLumenPhotoKey(slot) : template === "isla-verde-boutique" ? isIslaPhotoKey(slot) : template === "bloomfield-gardens" ? isBloomPhotoKey(slot) : template === "still-water-spa" ? isSpaPhotoKey(slot) : isEmberPhotoKey(slot)) && typeof item.updatedAt === "string") {
            const url = `/api/personalization/${template}/photos/${slot}/image?v=${encodeURIComponent(item.updatedAt)}`;
            images[slot] = { url, savedUrl: url, changed: false };
          }
        }
        setPinePhotos(images); setPineFileKey((value) => value + 1);
      }
      setFileKey((value) => value + 1);
      setSaveStatus("Saved draft and photo loaded.");
    } catch { setSaveStatus("Could not access your draft. Check your connection and try again."); }
    finally { setBusy(false); }
  }

  async function savePinePhoto() {
    const current = pinePhotos[pinePhotoKey];
    if (!current?.changed) return;
    setBusy(true); setSignInNeeded(false); setSaveStatus("");
    try {
      const endpoint = `/api/personalization/${template}/photos/${pinePhotoKey}/image`;
      const response = await fetch(endpoint, current.file ? { method: "PUT", headers: { "Content-Type": current.file.type }, body: current.file } : { method: "DELETE" });
      const data = await response.json();
      if (response.status === 401) setSignInNeeded(true);
      if (!response.ok) { setSaveStatus(data.error || "Could not save the website photo."); return; }
      const url = current.file ? `${endpoint}?v=${encodeURIComponent(data.updatedAt)}` : undefined;
      clearPineBlob(pinePhotoKey);
      setPinePhotos((photos) => ({ ...photos, [pinePhotoKey]: { url, savedUrl: url, changed: false } }));
      setPineFileKey((value) => value + 1); setSaveStatus("Website photo saved. Text changes still need Save draft.");
    } catch { setSaveStatus("Could not save the website photo. Check your connection and try again."); }
    finally { setBusy(false); }
  }


  return <main className="min-h-dvh bg-[#eff2ed] text-[#203b3b]">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d7dfd8] bg-white px-5 py-4 sm:px-8">
      <div><Link href={`/preview/${template}`} className="text-sm underline underline-offset-4">Back to preview</Link><h1 className="mt-1 font-serif text-2xl">Make {title} yours</h1></div>
      <Link href={`/designs/${template}#tiers`} onClick={event => { if (locationEnabled && locationPhotos.pending) { event.preventDefault(); setSaveStatus("Save changes before continuing to packages so your photos are included."); } }} className="rounded-full bg-[#0f4c5c] px-5 py-3 text-sm font-semibold text-white">View packages</Link>
    </header>
    <div className="grid gap-0 lg:h-[calc(100dvh-90px)] lg:grid-cols-[340px_minmax(0,1fr)]">
      <aside aria-label="Personalization controls" className="overflow-y-auto border-b border-[#d7dfd8] bg-white p-5 lg:border-r lg:border-b-0">
        <p className="text-sm leading-6">Try a few ideas on {template === "harbor-house" || coral || pine || lumen || isla || ember ? "the website" : "the home page"}. Sign in to save your text, color, and photo to your account.</p>
        <p className="mt-2 text-sm leading-6">{coral ? "Choose your saved draft at checkout to include your saved changes." : "Saved changes can be selected at checkout."} {template === "harbor-house" || coral || pine || lumen || isla || ember ? "Only the fields shown are editable; other content and languages remain sample content." : "Other pages and languages are not editable here."}</p>
        {pine && <p className="mt-2 text-sm leading-6">The headline, welcome message, and photo apply to both summer and winter. Switch seasons in the preview to see them.</p>}
        {bloomfield && <p className="mt-2 text-sm leading-6">The home page photo replaces the center image in the three-photo arrangement.</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" data-bloom-target="save" disabled={busy || !previewReady} onClick={() => void draftRequest("save")} className="rounded-full bg-[#0f4c5c] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{locationEnabled ? "Save changes" : "Save draft"}</button>
          <button type="button" disabled={busy || !previewReady} onClick={() => void draftRequest("load")} className="rounded-full border border-[#0f4c5c] px-4 py-2 text-sm font-semibold disabled:opacity-50">Load saved draft</button>
        </div>
        <p className="mt-2 text-xs leading-5">Loading replaces the current editor content. Saving replaces your previously saved {title} draft. Use photos you have permission to use.</p>
        {saveStatus && <p role="status" className="mt-3 text-sm">{saveStatus}</p>}
        {signInNeeded && <p className="mt-2 text-sm"><Link className="underline underline-offset-4" href={`/login?callbackUrl=${encodeURIComponent(`/personalize/${template}`)}`} target="_blank" rel="noopener noreferrer">Sign in in a new tab</Link>, then return here and try again. Keep this tab open to retain unsaved changes.</p>}
        {!previewReady && <p role="status" className="mt-3 text-sm">Loading preview…</p>}
        {locationEnabled && locationPhotos.controls}
        <BloomGuide page="editor" slug={template} ready={previewReady && !busy}
          onReviewPreview={locationEnabled ? () => locationPhotos.setEditing(false) : undefined} />
        <fieldset disabled={busy || !previewReady} className="mt-6 space-y-4 disabled:opacity-70">
          <legend className="sr-only">Edit your website</legend>
          <label className="block text-sm font-semibold">Business name<input id="business-name" data-bloom-target="name" className={fieldClass} maxLength={120} value={draft.business.name ?? ""} placeholder={title} onChange={(e) => updateBusiness("name", e.target.value)} /></label>
          <label className="block text-sm font-semibold">Tagline<input className={fieldClass} maxLength={500} value={draft.business.tagline ?? ""} placeholder={bloomfield ? "A garden estate for celebrations" : stillWater ? "Day spa and bathhouse" : ember ? "Wood-fired kitchen and bar" : isla ? "A heritage hotel" : lumen ? "A quiet lakeside retreat" : pine ? "A timber lodge in the mountains" : coral ? "A barefoot island resort" : "A bed and breakfast by the harbour"} onChange={(e) => updateBusiness("tagline", e.target.value)} /></label>
          {!coral && !pine && !lumen && !isla && !ember && !stillWater && !bloomfield && <label className="block text-sm font-semibold">Hosts<input className={fieldClass} maxLength={120} value={draft.business.hosts ?? ""} placeholder="Mila and Joel" onChange={(e) => updateBusiness("hosts", e.target.value)} /></label>}
          <label className="block text-sm font-semibold">Phone<input type="tel" className={fieldClass} maxLength={120} value={draft.business.phone ?? ""} placeholder="+63 918 555 0164" onChange={(e) => updateBusiness("phone", e.target.value)} /></label>
          <label className="block text-sm font-semibold">Email<input type="email" className={fieldClass} maxLength={254} value={draft.business.email ?? ""} placeholder="hello@example.com" onChange={(e) => updateBusiness("email", e.target.value)} /></label>
          {(draft.template === "harbor-house" || draft.template === "coral-cove" || draft.template === "pine-ridge-lodge" || draft.template === "lumen-lake-villas" || draft.template === "isla-verde-boutique" || draft.template === "ember-and-salt") && <div className="space-y-3"><p className="text-sm font-semibold">Address</p>{(coral ? coralSite.address : pine ? pineSite.address : lumen ? lumenSite.address : isla ? islaSite.address : ember ? emberSite.address : harborSite.address).map((placeholder, i) => <label key={i} className="block text-sm">Address line {i + 1}<input className={fieldClass} maxLength={120} placeholder={placeholder} value={draft.business.address?.[i] ?? ""} onChange={(event) => updateAddress(i, event.target.value)} /></label>)}<button type="button" className="text-sm underline underline-offset-4" onClick={() => setDraft((current) => { if (current.template !== "harbor-house" && current.template !== "coral-cove" && current.template !== "pine-ridge-lodge" && current.template !== "lumen-lake-villas" && current.template !== "isla-verde-boutique" && current.template !== "ember-and-salt") return current; const business = { ...current.business }; delete business.address; return { ...current, business }; })}>Use template address</button></div>}
          <label className="block text-sm font-semibold">{coral ? "Introduction headline" : "Home page headline"}<textarea className={fieldClass} rows={3} maxLength={120} value={draft.home.headline ?? ""} placeholder={bloomfield ? "Say yes in the garden." : stillWater ? "Slow down in the pines." : ember ? "Cooked over fire." : isla ? "A house with a long memory." : lumen ? "Still water, slow days." : pine ? "Welcome to the mountains..." : coral ? "Introduce your resort..." : "A room by the harbour, and breakfast like home."} onChange={(e) => setDraft({ ...draft, home: { ...draft.home, headline: e.target.value || undefined } })} /></label>
          <label className="block text-sm font-semibold">{coral ? "Introduction text" : "Welcome message"}<textarea className={fieldClass} rows={4} maxLength={500} value={draft.home.welcome ?? ""} placeholder="Welcome your guests..." onChange={(e) => setDraft({ ...draft, home: { ...draft.home, welcome: e.target.value || undefined } })} /></label>
          <label className="block text-sm font-semibold">Accent color<input type="color" data-bloom-target="color" className="mt-2 block h-11 w-20 cursor-pointer rounded border border-[#c9d1cf] bg-white p-1" value={draft.theme.accent ?? (bloomfield ? "#56653a" : stillWater ? "#66588f" : ember ? "#c8a15a" : isla ? "#1d3a2e" : lumen ? "#2f5f7e" : pine ? "#c7802f" : coral ? "#cf3f2b" : "#24557f")} onChange={(e) => setDraft({ ...draft, theme: { accent: e.target.value } })} /></label>
          {!locationEnabled && <><label className="block text-sm font-semibold">Home page photo<input key={fileKey} type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full text-sm" onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) { setError("Choose a JPEG, PNG, or WebP image up to 5 MB."); e.target.value = ""; return; }
            setError(""); replacePhoto(file); setPhotoChange({ action: "replace", file });
          }} /></label>
          <button type="button" onClick={() => { replacePhoto(); setPhotoChange({ action: "remove" }); setFileKey((value) => value + 1); }} className="text-sm underline underline-offset-4">Use original photo</button></>}
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          {draft.template === "pine-ridge-lodge" && <PineContentControls draft={draft} onChange={setDraft} preview={setPreviewPage} />}
          {draft.template === "lumen-lake-villas" && <LumenContentControls draft={draft} onChange={setDraft} preview={setPreviewPage} />}
          {draft.template === "isla-verde-boutique" && <IslaContentControls draft={draft} onChange={setDraft} preview={setPreviewPage} />}
          {draft.template === "ember-and-salt" && <EmberContentControls draft={draft} onChange={setDraft} preview={setPreviewPage} />}
          {draft.template === "bloomfield-gardens" && <BloomfieldContentControls draft={draft} onChange={setDraft} preview={setPreviewPage} />}
          {draft.template === "still-water-spa" && <StillWaterContentControls draft={draft} onChange={setDraft} preview={setPreviewPage} />}
          {!locationEnabled && (draft.template === "pine-ridge-lodge" || draft.template === "lumen-lake-villas" || draft.template === "isla-verde-boutique" || draft.template === "ember-and-salt" || draft.template === "still-water-spa" || draft.template === "bloomfield-gardens" || draft.template === "harbor-house" || draft.template === "coral-cove") && <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Website photos</summary><div className="mt-4 space-y-4">
            <label className="block text-sm font-semibold">Photo<select aria-label="Website photo" className={fieldClass} value={pinePhotoKey} onChange={(event) => setPinePhotoKey(event.target.value as PinePhotoKey | LumenPhotoKey | IslaPhotoKey | EmberPhotoKey | SpaPhotoKey | BloomPhotoKey | HousePhotoKey | CoralPhotoKey)}>{(template === "harbor-house" ? HOUSE_PHOTO_KEYS : coral ? CORAL_PHOTO_KEYS : bloomfield ? BLOOM_PHOTO_KEYS : stillWater ? SPA_PHOTO_KEYS : ember ? EMBER_PHOTO_KEYS : isla ? ISLA_PHOTO_KEYS : lumen ? LUMEN_PHOTO_KEYS : PINE_PHOTO_KEYS).map((key) => <option key={key} value={key}>{template === "harbor-house" && isHousePhotoKey(key) ? housePhoto(key).alt : coral && isCoralPhotoKey(key) ? coralPhoto(key).alt : bloomfield && isBloomPhotoKey(key) ? bloomPhoto(key).alt : stillWater && isSpaPhotoKey(key) ? spaPhoto(key).alt : ember && isEmberPhotoKey(key) ? emberPhoto(key).alt : isla && isIslaPhotoKey(key) ? islaPhoto(key).alt : lumen && isLumenPhotoKey(key) ? lumenPhoto(key).alt : isPinePhotoKey(key) ? pinePhoto(key).alt : key}</option>)}</select></label>
            <label className="block text-sm font-semibold">Photo description<input className={fieldClass} maxLength={120} value={(draft.template === "harbor-house" ? draft.housePhotoAlt : draft.template === "coral-cove" ? draft.coralPhotoAlt : draft.template === "pine-ridge-lodge" ? draft.pinePhotoAlt : draft.template === "lumen-lake-villas" ? draft.lumenPhotoAlt : draft.template === "isla-verde-boutique" ? draft.islaPhotoAlt : draft.template === "bloomfield-gardens" ? draft.bloomPhotoAlt : draft.template === "still-water-spa" ? draft.spaPhotoAlt : draft.emberPhotoAlt)?.[pinePhotoKey] ?? ""} placeholder={template === "harbor-house" && isHousePhotoKey(pinePhotoKey) ? housePhoto(pinePhotoKey).alt : coral && isCoralPhotoKey(pinePhotoKey) ? coralPhoto(pinePhotoKey).alt : bloomfield && isBloomPhotoKey(pinePhotoKey) ? bloomPhoto(pinePhotoKey).alt : stillWater && isSpaPhotoKey(pinePhotoKey) ? spaPhoto(pinePhotoKey).alt : ember && isEmberPhotoKey(pinePhotoKey) ? emberPhoto(pinePhotoKey).alt : isla && isIslaPhotoKey(pinePhotoKey) ? islaPhoto(pinePhotoKey).alt : lumen && isLumenPhotoKey(pinePhotoKey) ? lumenPhoto(pinePhotoKey).alt : isPinePhotoKey(pinePhotoKey) ? pinePhoto(pinePhotoKey).alt : ""} onChange={(event) => { const value = event.target.value; setDraft((current) => { if (current.template === "harbor-house") { const housePhotoAlt = { ...current.housePhotoAlt }; if (value) housePhotoAlt[pinePhotoKey] = value; else delete housePhotoAlt[pinePhotoKey]; return { ...current, housePhotoAlt: Object.keys(housePhotoAlt).length ? housePhotoAlt : undefined }; } if (current.template === "coral-cove") { const coralPhotoAlt = { ...current.coralPhotoAlt }; if (value) coralPhotoAlt[pinePhotoKey] = value; else delete coralPhotoAlt[pinePhotoKey]; return { ...current, coralPhotoAlt: Object.keys(coralPhotoAlt).length ? coralPhotoAlt : undefined }; } if (current.template === "pine-ridge-lodge") { const pinePhotoAlt = { ...current.pinePhotoAlt }; if (value) pinePhotoAlt[pinePhotoKey] = value; else delete pinePhotoAlt[pinePhotoKey]; return { ...current, pinePhotoAlt: Object.keys(pinePhotoAlt).length ? pinePhotoAlt : undefined }; } if (current.template === "lumen-lake-villas") { const lumenPhotoAlt = { ...current.lumenPhotoAlt }; if (value) lumenPhotoAlt[pinePhotoKey] = value; else delete lumenPhotoAlt[pinePhotoKey]; return { ...current, lumenPhotoAlt: Object.keys(lumenPhotoAlt).length ? lumenPhotoAlt : undefined }; } if (current.template === "isla-verde-boutique") { const islaPhotoAlt = { ...current.islaPhotoAlt }; if (value) islaPhotoAlt[pinePhotoKey] = value; else delete islaPhotoAlt[pinePhotoKey]; return { ...current, islaPhotoAlt: Object.keys(islaPhotoAlt).length ? islaPhotoAlt : undefined }; } if (current.template === "bloomfield-gardens") { const bloomPhotoAlt = { ...current.bloomPhotoAlt }; if (value) bloomPhotoAlt[pinePhotoKey] = value; else delete bloomPhotoAlt[pinePhotoKey]; return { ...current, bloomPhotoAlt: Object.keys(bloomPhotoAlt).length ? bloomPhotoAlt : undefined }; } if (current.template === "still-water-spa") { const spaPhotoAlt = { ...current.spaPhotoAlt }; if (value) spaPhotoAlt[pinePhotoKey] = value; else delete spaPhotoAlt[pinePhotoKey]; return { ...current, spaPhotoAlt: Object.keys(spaPhotoAlt).length ? spaPhotoAlt : undefined }; } if (current.template === "ember-and-salt") { const emberPhotoAlt = { ...current.emberPhotoAlt }; if (value) emberPhotoAlt[pinePhotoKey] = value; else delete emberPhotoAlt[pinePhotoKey]; return { ...current, emberPhotoAlt: Object.keys(emberPhotoAlt).length ? emberPhotoAlt : undefined }; } return current; }); }} /></label>
            <label className="block text-sm font-semibold">Replace website photo<input key={`${pinePhotoKey}-${pineFileKey}`} type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full text-sm" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) { setError("Choose a JPEG, PNG, or WebP image up to 5 MB."); event.target.value = ""; return; } clearPineBlob(pinePhotoKey); const url = URL.createObjectURL(file); pineBlobUrls.current[pinePhotoKey] = url; setPinePhotos((photos) => ({ ...photos, [pinePhotoKey]: { url, savedUrl: photos[pinePhotoKey]?.savedUrl, file, changed: true } })); setError(""); }} /></label>
            <p className="text-xs leading-5">This replaces the selected photo wherever the template uses it. Save the draft first, then save each photo separately. {pine ? "The home-page photo control above takes priority over the seasonal hero." : "The home-page photo control above takes priority over its hero image."} {(coral || template === "harbor-house") && "Library replacements take priority over older room, villa, or gallery uploads. Restoring the original reveals any older upload still saved for that image."}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2"><button type="button" disabled={!pinePhotos[pinePhotoKey]?.changed} onClick={() => void savePinePhoto()} className="rounded-full bg-[#0f4c5c] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Save website photo</button>
              <button type="button" className="text-sm underline" onClick={() => { clearPineBlob(pinePhotoKey); setPinePhotos((photos) => ({ ...photos, [pinePhotoKey]: { savedUrl: photos[pinePhotoKey]?.savedUrl, changed: true } })); setPineFileKey((value) => value + 1); }}>Use original website photo</button>
              {pinePhotos[pinePhotoKey]?.changed && <button type="button" className="text-sm underline" onClick={() => { clearPineBlob(pinePhotoKey); setPinePhotos((photos) => ({ ...photos, [pinePhotoKey]: { url: photos[pinePhotoKey]?.savedUrl, savedUrl: photos[pinePhotoKey]?.savedUrl, changed: false } })); setPineFileKey((value) => value + 1); }}>Discard website photo change</button>}</div>
          </div></details>}
          {draft.template === "coral-cove" && <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Home page sections</summary><div className="mt-4 space-y-4">
            <label className="block text-sm font-semibold">Getting here heading<input className={fieldClass} maxLength={120} value={draft.homeSections?.travelHeading ?? ""} placeholder="Getting here" onChange={(event) => updateCoralHome("travelHeading", event.target.value)} /></label>
            {(["first", "second", "third"] as const).map((step, index) => <div key={step} className="space-y-3"><label className="block text-sm font-semibold">Travel step {index + 1} title<input className={fieldClass} maxLength={120} value={draft.homeSections?.travel?.[step]?.title ?? ""} onChange={(event) => updateTravelStep(step, "title", event.target.value)} /></label><label className="block text-sm font-semibold">Travel step {index + 1} description<textarea className={fieldClass} rows={3} maxLength={500} value={draft.homeSections?.travel?.[step]?.text ?? ""} onChange={(event) => updateTravelStep(step, "text", event.target.value)} /></label></div>)}
            <label className="block text-sm font-semibold">Reef section heading<input className={fieldClass} maxLength={120} value={draft.homeSections?.reefHeading ?? ""} onChange={(event) => updateCoralHome("reefHeading", event.target.value)} /></label>
            <label className="block text-sm font-semibold">Reef section text<textarea className={fieldClass} rows={4} maxLength={500} value={draft.homeSections?.reefText ?? ""} onChange={(event) => updateCoralHome("reefText", event.target.value)} /></label>
            <p className="text-xs leading-5">Leave fields blank to keep the original text.</p><button type="button" className="text-sm underline underline-offset-4" onClick={() => setPreviewPage("home")}>Preview home page</button>
          </div></details>}
          {draft.template === "coral-cove" && <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Guest reviews</summary><div className="mt-4 space-y-4">
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={!draft.reviewsHidden} onChange={(event) => setDraft((current) => current.template === "coral-cove" ? { ...current, reviewsHidden: !event.target.checked || undefined } : current)} /> Show guest reviews</label>
            <p className="text-xs leading-5">The original reviews are examples. Replace them with genuine reviews you can use, or hide the section.</p>
            <label className="block text-sm font-semibold">Review<select className={fieldClass} value={reviewKey} onChange={(event) => { setReviewKey(event.target.value as "first" | "second" | "third"); setPreviewPage("home"); }}><option value="first">Review 1</option><option value="second">Review 2</option><option value="third">Review 3</option></select></label>
            {([ ["quote", "Review text", 500], ["name", "Guest name", 120], ["from", "Guest location", 120], ["stay", "Stay details", 120] ] as const).map(([field, label, max]) => <label key={field} className="block text-sm font-semibold">{label}<textarea className={fieldClass} rows={field === "quote" ? 4 : 2} maxLength={max} value={draft.reviews?.[reviewKey]?.[field] ?? ""} onChange={(event) => updateReview(field, event.target.value)} /></label>)}
            <button type="button" className="text-sm underline underline-offset-4" onClick={() => setPreviewPage("home")}>Preview reviews</button>
          </div></details>}
          {draft.template === "coral-cove" && <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Villa content</summary><div className="mt-4 space-y-4">
            <label className="block text-sm font-semibold">Villa<select className={fieldClass} value={villaKey} onChange={(event) => { const selected = event.target.value as CoralVillaKey; setVillaKey(selected); setPreviewPage(selected); }}>{coralVillaKeys.map((key) => <option key={key} value={key}>{coralVillas.find((villa) => villa.slug === key)?.name}</option>)}</select></label>
            {([ ["name", "Villa name", 120], ["short", "Short description", 500], ["description", "Villa description", 1600], ["beds", "Beds", 120], ["view", "View", 120], ["amenities", "Villa amenities", 1200] ] as const).map(([field, label, max]) => <label key={field} className="block text-sm font-semibold">{label}<textarea className={fieldClass} rows={field === "description" || field === "amenities" ? 4 : 2} maxLength={max} value={draft.villas?.[villaKey]?.[field] ?? ""} onChange={(event) => updateVilla(field, event.target.value)} /></label>)}
            <p className="text-xs leading-5">Enter description paragraphs and amenities on separate lines. Leave fields blank to use the template text.</p>
            {([ ["price", "Nightly price (PHP)", 0, 10000000], ["size", "Size (m²)", 1, 100000], ["maxGuests", "Maximum guests", 1, 5] ] as const).map(([field, label, min, max]) => <label key={field} className="block text-sm font-semibold">{label}<input type="number" className={fieldClass} min={min} max={max} step={1} value={draft.villas?.[villaKey]?.[field] ?? ""} onChange={(event) => updateVilla(field, event.target.value)} /></label>)}
            <p className="text-xs leading-5">The sample booking supports up to five guests. Prices and availability are illustrative.</p>
            <button type="button" className="text-sm underline" onClick={() => selectPhoto(`villa.${villaKey}.photo.1`)}>Edit this villa’s photos</button>
          </div></details>}
          {draft.template === "coral-cove" && <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Experiences content</summary><div className="mt-4 space-y-4">
            <label className="block text-sm font-semibold">Experience<select className={fieldClass} value={experienceKey} onChange={(event) => { setExperienceKey(event.target.value as CoralExperienceKey); setPreviewPage("experiences"); }}>{coralExperienceKeys.map((key) => <option key={key} value={key}>{coralExperiences.find((experience) => experience.slug === key)?.name}</option>)}</select></label>
            {([ ["name", "Experience name", 120], ["summary", "Experience summary", 500], ["detail", "Experience description", 500], ["duration", "Duration", 120], ["price", "Experience price", 120] ] as const).map(([field, label, max]) => <label key={field} className="block text-sm font-semibold">{label}<textarea className={fieldClass} rows={field === "detail" || field === "summary" ? 3 : 2} maxLength={max} value={draft.experiences?.[experienceKey]?.[field] ?? ""} placeholder={coralExperiences.find((experience) => experience.slug === experienceKey)?.[field]} onChange={(event) => updateExperience(field, event.target.value)} /></label>)}
            <p className="text-xs leading-5">Leave a field blank to use the template text. Experience prices are display text only.</p>
            <button type="button" className="text-sm underline underline-offset-4" onClick={() => setPreviewPage("experiences")}>Preview experiences</button>
          </div></details>}
          {draft.template === "coral-cove" && <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Offers content</summary><div className="mt-4 space-y-4">
            <label className="block text-sm font-semibold">Offer<select className={fieldClass} value={offerKey} onChange={(event) => { setOfferKey(event.target.value as CoralOfferKey); setPreviewPage("offers"); }}>{coralOfferKeys.map((key) => <option key={key} value={key}>{coralOffers.find((offer) => offer.slug === key)?.name}</option>)}</select></label>
            {([ ["name", "Offer name", 120], ["headline", "Offer headline", 120], ["body", "Offer description", 500], ["includes", "Offer inclusions", 1200], ["terms", "Offer terms", 500] ] as const).map(([field, label, max]) => <label key={field} className="block text-sm font-semibold">{label}<textarea className={fieldClass} rows={field === "includes" ? 4 : 2} maxLength={max} value={draft.offers?.[offerKey]?.[field] ?? ""} placeholder={field === "includes" ? coralOffers.find((offer) => offer.slug === offerKey)?.includes.join("\n") : coralOffers.find((offer) => offer.slug === offerKey)?.[field]} onChange={(event) => updateOffer(field, event.target.value)} /></label>)}
            <p className="text-xs leading-5">Enter one inclusion per line. These fields change display text only; the sample booking still applies its original fifth-night calculation.</p>
            <button type="button" className="text-sm underline underline-offset-4" onClick={() => setPreviewPage("offers")}>Preview offers</button>
          </div></details>}
          {draft.template === "coral-cove" && <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Contact questions</summary><div className="mt-4 space-y-4">
            <label className="block text-sm font-semibold">Question topic<select className={fieldClass} value={faqKey} onChange={(event) => { setFaqKey(event.target.value as CoralFaqKey); setPreviewPage("contact"); }}>{coralFaqs.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
            <label className="block text-sm font-semibold">Question<input className={fieldClass} maxLength={120} value={draft.contactFaqs?.[faqKey]?.question ?? ""} onChange={(event) => updateFaq("question", event.target.value)} /></label>
            <label className="block text-sm font-semibold">Answer<textarea className={fieldClass} rows={4} maxLength={500} value={draft.contactFaqs?.[faqKey]?.answer ?? ""} onChange={(event) => updateFaq("answer", event.target.value)} /></label>
            <p className="text-xs leading-5">Leave a field blank to use the template text. Check that any policy you write matches your actual service.</p>
            <button type="button" className="text-sm underline underline-offset-4" onClick={() => setPreviewPage("contact")}>Preview contact page</button>
          </div></details>}
          {draft.template === "harbor-house" && <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Room content</summary><div className="mt-4 space-y-4">
            <label className="block text-sm font-semibold">Room<select className={fieldClass} value={roomKey} onChange={(event) => { const selected = event.target.value as HarborRoomKey; setRoomKey(selected); setPreviewPage(selected); }}>{harborRoomKeys.map((key) => <option key={key} value={key}>{harborRooms.find((room) => room.slug === key)?.name}</option>)}</select></label>
            <label className="block text-sm font-semibold">Room name<input className={fieldClass} maxLength={120} placeholder={harborRooms.find((room) => room.slug === roomKey)?.name} value={draft.rooms?.[roomKey]?.name ?? ""} onChange={(event) => updateRoom("name", event.target.value)} /></label>
            <label className="block text-sm font-semibold">Short description<textarea className={fieldClass} rows={2} maxLength={500} value={draft.rooms?.[roomKey]?.postcard ?? ""} placeholder={harborRooms.find((room) => room.slug === roomKey)?.postcard} onChange={(event) => updateRoom("postcard", event.target.value)} /></label>
            <label className="block text-sm font-semibold">Room description<textarea className={fieldClass} rows={4} maxLength={500} value={draft.rooms?.[roomKey]?.description ?? ""} placeholder="Describe this room..." onChange={(event) => updateRoom("description", event.target.value)} /></label>
            <label className="block text-sm font-semibold">Bed<input className={fieldClass} maxLength={120} value={draft.rooms?.[roomKey]?.bed ?? ""} placeholder={harborRooms.find((room) => room.slug === roomKey)?.bed} onChange={(event) => updateRoom("bed", event.target.value)} /></label>
            <label className="block text-sm font-semibold">View<input className={fieldClass} maxLength={120} value={draft.rooms?.[roomKey]?.view ?? ""} placeholder={harborRooms.find((room) => room.slug === roomKey)?.view} onChange={(event) => updateRoom("view", event.target.value)} /></label>
            <label className="block text-sm font-semibold">Room features<textarea className={fieldClass} rows={4} maxLength={1200} value={draft.rooms?.[roomKey]?.features ?? ""} placeholder={harborRooms.find((room) => room.slug === roomKey)?.little.join("\n")} onChange={(event) => updateRoom("features", event.target.value)} /></label>
            <p className="text-xs leading-5">Enter one feature per line. Leave a field blank to use the template value.</p>
            <label className="block text-sm font-semibold">Nightly price (PHP)<input type="number" min={0} max={10000000} step={1} className={fieldClass} value={draft.rooms?.[roomKey]?.price ?? ""} placeholder={String(harborRooms.find((room) => room.slug === roomKey)?.price ?? "")} onChange={(event) => updateRoomNumber("price", event.target.value)} /></label>
            <label className="block text-sm font-semibold">Maximum guests<input type="number" min={1} max={12} step={1} className={fieldClass} value={draft.rooms?.[roomKey]?.maxGuests ?? ""} placeholder={String(harborRooms.find((room) => room.slug === roomKey)?.maxGuests ?? "")} onChange={(event) => updateRoomNumber("maxGuests", event.target.value)} /></label>
            <p className="text-xs leading-5">Prices and availability in the booking preview are examples; no booking or payment is made.</p>
            <button type="button" className="text-sm underline underline-offset-4" onClick={() => selectPhoto(`room.${roomKey}.photo.1`)}>Edit this room’s photos</button>
            <button type="button" className="text-sm underline underline-offset-4" onClick={() => setPreviewPage(roomKey)}>Preview this room</button>
          </div></details>}
          {draft.template === "harbor-house" && <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Breakfast content</summary><div className="mt-4 space-y-4">
            <label className="block text-sm font-semibold">Breakfast page heading<input className={fieldClass} maxLength={120} placeholder="Breakfast" value={draft.breakfast?.heading ?? ""} onChange={(event) => updateBreakfast("heading", event.target.value)} /></label>
            <label className="block text-sm font-semibold">Breakfast introduction<textarea className={fieldClass} rows={3} maxLength={500} value={draft.breakfast?.intro ?? ""} placeholder="Describe breakfast..." onChange={(event) => updateBreakfast("intro", event.target.value)} /></label>
            {(["morning", "advance"] as const).map((section, index) => <div key={section} className="space-y-3"><label className="block text-sm font-semibold">{index === 0 ? "First menu heading" : "Second menu heading"}<input className={fieldClass} maxLength={120} value={draft.breakfast?.[section]?.title ?? ""} placeholder={harborBreakfast[index].title} onChange={(event) => updateBreakfastSection(section, "title", event.target.value)} /></label><label className="block text-sm font-semibold">{index === 0 ? "First menu items" : "Second menu items"}<textarea className={fieldClass} rows={5} maxLength={1200} value={draft.breakfast?.[section]?.items ?? ""} placeholder={harborBreakfast[index].items.join("\n")} onChange={(event) => updateBreakfastSection(section, "items", event.target.value)} /></label></div>)}
            <p className="text-xs leading-5">Enter one item per line. Leave a field blank to use the template text.</p>
            <label className="block text-sm font-semibold">Breakfast closing note<textarea className={fieldClass} rows={2} maxLength={500} value={draft.breakfast?.takeaway ?? ""} placeholder="Add a note for guests..." onChange={(event) => updateBreakfast("takeaway", event.target.value)} /></label>
            <button type="button" className="text-sm underline underline-offset-4" onClick={() => setPreviewPage("breakfast")}>Preview breakfast</button>
          </div></details>}
          {draft.template === "harbor-house" && <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Local guide content</summary><div className="mt-4 space-y-4">
            <label className="block text-sm font-semibold">Guide page heading<input className={fieldClass} maxLength={120} value={draft.guide?.heading ?? ""} placeholder="Around Basco" onChange={(event) => updateGuide("heading", event.target.value)} /></label>
            <label className="block text-sm font-semibold">Guide introduction<textarea className={fieldClass} rows={3} maxLength={500} value={draft.guide?.intro ?? ""} placeholder="Introduce the area..." onChange={(event) => updateGuide("intro", event.target.value)} /></label>
            <label className="block text-sm font-semibold">Place<select className={fieldClass} value={placeKey} onChange={(event) => { setPlaceKey(event.target.value as HarborPlaceKey); setPreviewPage("guide"); }}>{harborPlaceKeys.map((key) => <option key={key} value={key}>{harborPlaces.find((place) => place.id === key)?.name}</option>)}</select></label>
            <label className="block text-sm font-semibold">Place name<input className={fieldClass} maxLength={120} value={draft.guide?.places?.[placeKey]?.name ?? ""} placeholder={harborPlaces.find((place) => place.id === placeKey)?.name} onChange={(event) => updatePlace("name", event.target.value)} /></label>
            <label className="block text-sm font-semibold">Distance or travel time<input className={fieldClass} maxLength={120} value={draft.guide?.places?.[placeKey]?.distance ?? ""} placeholder={harborPlaces.find((place) => place.id === placeKey)?.distance} onChange={(event) => updatePlace("distance", event.target.value)} /></label>
            <label className="block text-sm font-semibold">Place description<textarea className={fieldClass} rows={3} maxLength={500} value={draft.guide?.places?.[placeKey]?.note ?? ""} placeholder={harborPlaces.find((place) => place.id === placeKey)?.note} onChange={(event) => updatePlace("note", event.target.value)} /></label>
            <button type="button" className="text-sm underline underline-offset-4" onClick={() => setPreviewPage("guide")}>Preview local guide</button>
          </div></details>}
          <button type="button" onClick={reset} className="rounded-full border border-[#0f4c5c] px-4 py-2 text-sm font-semibold">Reset changes</button>
        </fieldset>
      </aside>
      <section aria-label="Home page preview" className="flex min-h-[650px] min-w-0 flex-col overflow-hidden p-3 sm:p-5 lg:min-h-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">{locationEnabled && <div role="group" aria-label="Preview interaction" className="flex gap-1 rounded-lg bg-white p-1">{[true, false].map(editing => <button key={String(editing)} type="button" aria-pressed={photoEditing === editing} data-bloom-target={editing ? "photos" : undefined} onClick={() => locationPhotos.setEditing(editing)} className={`min-h-11 rounded-md px-3 py-2 text-sm ${photoEditing === editing ? "bg-[#0f4c5c] text-white" : ""}`}>{editing ? "Edit photos" : "Browse preview"}</button>)}</div>}<p data-bloom-target="preview-result" className="text-sm">{template === "harbor-house" || coral || pine || lumen || isla || ember ? "Website preview" : "Home page preview"} · {locationEnabled ? photoEditing ? "Click a photo to change it" : "Try links and sample flows" : "links are disabled while editing"}</p>
          {ember && <label className="flex items-center gap-2 text-sm">Page<select aria-label="Preview page" className="rounded-lg border border-[#c9d1cf] bg-white px-2 py-2" value={previewPage} onChange={(event) => setPreviewPage(event.target.value)}><option value="home">Home</option><option value="menu">Menu</option><option value="private-dining">Private dining</option><option value="story">Story</option><option value="gift-cards">Gift cards</option><option value="reserve">Sample reservation</option><option value="visit">Visit</option></select></label>}
          {bloomfield && <label className="flex items-center gap-2 text-sm">Page<select aria-label="Preview page" className="rounded-lg border border-[#c9d1cf] bg-white px-2 py-2" value={previewPage} onChange={event => setPreviewPage(event.target.value)}>{["home", "spaces", "weddings", "planning", "gallery", "inquire"].map(page => <option key={page} value={page}>{page}</option>)}{bloomSpaces.map(space => <option key={space.slug} value={space.slug}>{space.name}</option>)}</select></label>}
          {stillWater && <label className="flex items-center gap-2 text-sm">Page<select aria-label="Preview page" className="rounded-lg border border-[#c9d1cf] bg-white px-2 py-2" value={previewPage} onChange={event => setPreviewPage(event.target.value)}><option value="home">Home</option><option value="treatments">Treatments</option><option value="packages">Packages</option><option value="about">About</option><option value="visit">Visit</option><option value="gift-cards">Gift cards</option><option value="book">Sample booking</option>{spaTreatments.map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>}
          {isla && <label className="flex items-center gap-2 text-sm">Page<select aria-label="Preview page" className="rounded-lg border border-[#c9d1cf] bg-white px-2 py-2" value={previewPage} onChange={(event) => setPreviewPage(event.target.value)}><option value="home">Home</option><option value="rooms">Rooms</option><option value="story">Story</option><option value="dining">Dining</option><option value="events">Events</option><option value="journal">Journal</option><option value="book">Sample booking</option><option value="contact">Contact</option>{islaRooms.map((room) => <option key={room.slug} value={room.slug}>{room.name}</option>)}{islaPosts.map((post) => <option key={post.slug} value={post.slug}>{post.title}</option>)}</select></label>}
          {lumen && <label className="flex items-center gap-2 text-sm">Page<select aria-label="Preview page" className="rounded-lg border border-[#c9d1cf] bg-white px-2 py-2" value={previewPage} onChange={(event) => setPreviewPage(event.target.value)}><option value="home">Home</option><option value="villas">Villas</option><option value="experiences">Experiences</option><option value="tour">Virtual tour</option><option value="book">Sample booking</option><option value="contact">Contact</option>{lumenVillas.map((villa) => <option key={villa.slug} value={villa.slug}>{villa.name}</option>)}</select></label>}
          {pine && <label className="flex items-center gap-2 text-sm">Page<select aria-label="Preview page" className="rounded-lg border border-[#c9d1cf] bg-white px-2 py-2" value={previewPage} onChange={(event) => setPreviewPage(event.target.value)}><option value="home">Home</option><option value="rooms">Rooms</option><option value="activities">Activities</option><option value="dining">Dining</option><option value="journal">Journal</option><option value="book">Sample booking</option><option value="contact">Contact</option>{pineRooms.map((room) => <option key={room.slug} value={room.slug}>{room.name}</option>)}{pinePosts.map((post) => <option key={post.slug} value={post.slug}>{post.title}</option>)}</select></label>}
          {coral && <label className="flex items-center gap-2 text-sm">Page<select aria-label="Preview page" className="rounded-lg border border-[#c9d1cf] bg-white px-2 py-2" value={previewPage} onChange={(event) => setPreviewPage(event.target.value)}><option value="home">Home</option><option value="villas">Villas</option><option value="experiences">Experiences</option><option value="offers">Offers</option><option value="gallery">Gallery</option><option value="book">Sample booking</option><option value="contact">Contact</option>{coralVillaKeys.map((key) => <option key={key} value={key}>{coralVillas.find((villa) => villa.slug === key)?.name}</option>)}</select></label>}
          {template === "harbor-house" && <label className="flex items-center gap-2 text-sm">Page<select aria-label="Preview page" className="rounded-lg border border-[#c9d1cf] bg-white px-2 py-2" value={previewPage} onChange={(event) => setPreviewPage(event.target.value)}><option value="home">Home</option><option value="rooms">Rooms</option><option value="breakfast">Breakfast</option><option value="guide">Local guide</option><option value="guestbook">Guestbook</option><option value="book">Sample booking</option><option value="contact">Contact</option>{harborRoomKeys.map((key) => <option key={key} value={key}>{harborRooms.find((room) => room.slug === key)?.name}</option>)}</select></label>}
          <div className="flex gap-1 rounded-lg bg-white p-1" aria-label="Preview width">
            {(["desktop", "mobile"] as const).map((mode) => <button key={mode} type="button" aria-pressed={device === mode} onClick={() => setDevice(mode)} className={`rounded-md px-3 py-2 text-sm capitalize ${device === mode ? "bg-[#0f4c5c] text-white" : "text-[#203b3b]"}`}>{mode}</button>)}
          </div>
        </div>
        <div className="flex min-h-0 flex-1 justify-center"><iframe data-business-preview ref={previewRef} src={`/personalize/${template}/live-preview`} title={`${title} home page preview`} onLoad={() => previewRef.current?.contentWindow?.postMessage({ type: "harbor-personalization-preview", draft, photoUrl, roomPhotos: roomPhotoUrls, villaPhotos: villaPhotoUrls, galleryPhotos: galleryPhotoUrls, pinePhotos: pinePhotoUrls, page: previewPage, ...(locationEnabled ? { placementPhotos: placementUrls, photoEditing: photoEditing, photoSelection: photoSelection } : {}) }, window.location.origin)} className={`h-full min-h-[560px] w-full rounded-xl border-0 bg-white shadow-sm ${device === "mobile" ? "max-w-[390px]" : ""}`} /></div>
      </section>
    </div>
  </main>;
}
