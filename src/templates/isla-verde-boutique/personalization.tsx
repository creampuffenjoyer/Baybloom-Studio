"use client";

import { createContext, useContext } from "react";

export type IslaPersonalization = {
  photoPlacements?: Record<string, { alt?: string; original?: boolean } | undefined>;
  placementPhotos?: Record<string, string | undefined>;
  photoEditing?: boolean;
  photoSelection?: string;
  business?: { name?: string; tagline?: string; phone?: string; email?: string; address?: string[] };
  home?: { headline?: string; welcome?: string };
  accent?: string;
  heroImage?: string;
  islaRooms?: Record<string, { name?: string; short?: string; description?: string; bed?: string; outlook?: string; details?: string; price?: number; size?: number; maxGuests?: number } | undefined>;
  islaPosts?: Record<string, { title?: string; dek?: string; body?: string; date?: string; minutes?: number } | undefined>;
  islaMenu?: Record<string, { name?: string; detail?: string } | undefined>;
  islaSpaces?: Record<string, { name?: string; capacity?: string; note?: string } | undefined>;
  islaExtras?: Record<string, { name?: string; price?: number } | undefined>;
  islaStory?: { foundingYear?: string; chapters?: Record<string, { year?: string; text?: string } | undefined> };
  islaStayTimes?: { checkIn?: string; checkOut?: string };
  islaPhotos?: Record<string, string | undefined>;
  islaPhotoAlt?: Record<string, string | undefined>;
  islaCopy?: Record<string, string | undefined>;
};

export const PersonalizationContext = createContext<IslaPersonalization>({});
export const usePersonalization = () => useContext(PersonalizationContext);
