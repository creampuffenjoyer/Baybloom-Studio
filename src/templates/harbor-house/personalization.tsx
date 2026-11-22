"use client";

import { createContext, useContext } from "react";

// Preview-only overrides. The standalone template works without a provider.
export type HarborPersonalization = {
  photoPlacements?: Record<string, { alt?: string; original?: boolean } | undefined>;
  placementPhotos?: Record<string, string | undefined>;
  photoEditing?: boolean;
  photoSelection?: string;
  business?: { name?: string; tagline?: string; hosts?: string; phone?: string; email?: string; address?: string[] };
  home?: { headline?: string; welcome?: string };
  rooms?: Record<string, { name?: string; postcard?: string; description?: string; bed?: string; view?: string; features?: string; price?: number; maxGuests?: number } | undefined>;
  breakfast?: { heading?: string; intro?: string; takeaway?: string; morning?: { title?: string; items?: string }; advance?: { title?: string; items?: string } };
  guide?: { heading?: string; intro?: string; places?: Record<string, { name?: string; distance?: string; note?: string } | undefined> };
  roomPhotos?: Record<string, string | undefined>;
  websitePhotos?: Record<string, string | undefined>;
  housePhotoAlt?: Record<string, string | undefined>;
  accent?: string;
  heroImage?: string;
};

export const PersonalizationContext = createContext<HarborPersonalization>({});
export const usePersonalization = () => useContext(PersonalizationContext);
