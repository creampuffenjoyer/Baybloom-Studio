"use client";

import { createContext, useContext } from "react";

export type CoralPersonalization = {
  photoPlacements?: Record<string, { alt?: string; original?: boolean } | undefined>;
  placementPhotos?: Record<string, string | undefined>;
  photoEditing?: boolean;
  photoSelection?: string;
  previewNavigate?: (href: string) => void;
  business?: { name?: string; tagline?: string; phone?: string; email?: string; address?: string[] };
  home?: { headline?: string; welcome?: string };
  accent?: string;
  heroImage?: string;
  villas?: Record<string, { name?: string; short?: string; description?: string; beds?: string; view?: string; amenities?: string; price?: number; size?: number; maxGuests?: number } | undefined>;
  experiences?: Record<string, { name?: string; summary?: string; detail?: string; duration?: string; price?: string } | undefined>;
  offers?: Record<string, { name?: string; headline?: string; body?: string; includes?: string; terms?: string } | undefined>;
  villaPhotos?: Record<string, string | undefined>;
  websitePhotos?: Record<string, string | undefined>;
  coralPhotoAlt?: Record<string, string | undefined>;
  galleryPhotos?: Record<string, string | undefined>;
  galleryAlt?: Record<string, string | undefined>;
  contactFaqs?: Record<string, { question?: string; answer?: string } | undefined>;
  homeSections?: { travelHeading?: string; travel?: Record<string, { title?: string; text?: string } | undefined>; reefHeading?: string; reefText?: string; useGalleryReef?: boolean; useGalleryStrip?: boolean };
  reviews?: Record<string, { quote?: string; name?: string; from?: string; stay?: string } | undefined>;
  reviewsHidden?: boolean;
};

export const PersonalizationContext = createContext<CoralPersonalization>({});
export const usePersonalization = () => useContext(PersonalizationContext);
