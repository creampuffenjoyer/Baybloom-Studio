"use client";

import { createContext, useContext } from "react";

export type StillWaterPersonalization = {
  photoPlacements?: Record<string, { alt?: string; original?: boolean } | undefined>;
  placementPhotos?: Record<string, string | undefined>;
  photoEditing?: boolean;
  photoSelection?: string;
  business?: { name?: string; tagline?: string; phone?: string; email?: string; address?: string[] };
  home?: { headline?: string; welcome?: string };
  accent?: string;
  heroImage?: string;
  spaPhotos?: Record<string, string | undefined>;
  spaCopy?: Record<string, string | undefined>;
  spaPhotoAlt?: Record<string, string | undefined>;
  spaTreatments?: Record<string, { name?: string; summary?: string; description?: string; includes?: string; goodFor?: string; prices?: { first?: number; second?: number } } | undefined>;
  spaPackages?: Record<string, { name?: string; minutes?: number; price?: number; items?: string } | undefined>;
  spaReviewsHidden?: boolean;
  spaTherapists?: Record<string, { name?: string; craft?: string; years?: number } | undefined>;
  spaReviews?: Record<string, { name?: string; when?: string; quote?: string } | undefined>;
  spaHours?: Record<string, { days?: string; time?: string } | undefined>;
  spaMemberships?: Record<string, { name?: string; price?: number; per?: string; perks?: string } | undefined>;
};

export const PersonalizationContext = createContext<StillWaterPersonalization>({});
export const usePersonalization = () => useContext(PersonalizationContext);
