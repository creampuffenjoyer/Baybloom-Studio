"use client";

import { createContext, useContext } from "react";

export type LumenPersonalization = {
  photoPlacements?: Record<string, { alt?: string; original?: boolean } | undefined>;
  placementPhotos?: Record<string, string | undefined>;
  photoEditing?: boolean;
  photoSelection?: string;
  business?: { name?: string; tagline?: string; phone?: string; email?: string; address?: string[] };
  home?: { headline?: string; welcome?: string };
  accent?: string;
  heroImage?: string;
  lumenVillas?: Record<string, { name?: string; line?: string; description?: string; price?: number; size?: number; maxGuests?: number; bedrooms?: number; setting?: "Waterfront" | "Garden" | "Over water"; jetty?: boolean; sauna?: boolean } | undefined>;
  lumenExperiences?: Record<string, { name?: string; when?: string; price?: string; text?: string } | undefined>;
  lumenExtras?: Record<string, { name?: string; price?: number } | undefined>;
  lumenTour?: Record<string, string | undefined>;
  lumenStayTimes?: { checkIn?: string; checkOut?: string };
  lumenPhotos?: Record<string, string | undefined>;
  lumenPhotoAlt?: Record<string, string | undefined>;
  lumenCopy?: Record<string, string | undefined>;
};

export const PersonalizationContext = createContext<LumenPersonalization>({});
export const usePersonalization = () => useContext(PersonalizationContext);
