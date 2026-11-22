"use client";

import { createContext, useContext } from "react";

export type PinePersonalization = {
  photoPlacements?: Record<string, { alt?: string; original?: boolean } | undefined>;
  placementPhotos?: Record<string, string | undefined>;
  photoEditing?: boolean;
  photoSelection?: string;
  business?: { name?: string; tagline?: string; phone?: string; email?: string; address?: string[] };
  home?: { headline?: string; welcome?: string };
  accent?: string;
  heroImage?: string;
  pineRooms?: Record<string, { name?: string; short?: string; description?: string; beds?: string; features?: string; price?: number; size?: number; maxGuests?: number } | undefined>;
  pineActivities?: Record<string, { name?: string; detail?: string; level?: string; duration?: string } | undefined>;
  pineMenu?: Record<string, { name?: string; detail?: string; price?: number } | undefined>;
  pinePosts?: Record<string, { title?: string; dek?: string; body?: string; date?: string } | undefined>;
  pineSeasons?: Record<string, { headline?: string; lede?: string; months?: string } | undefined>;
  pineExtras?: Record<string, { name?: string; price?: number } | undefined>;
  pineStayTimes?: { checkIn?: string; checkOut?: string };
  pinePages?: { rooms?: { heading?: string; intro?: string }; activities?: { heading?: string; intro?: string }; dining?: { heading?: string; intro?: string }; journal?: { heading?: string; intro?: string }; contact?: { heading?: string; driving?: string; shuttle?: string; rentalHeading?: string } };
  pinePhotos?: Record<string, string | undefined>;
  pinePhotoAlt?: Record<string, string | undefined>;
  pineCopy?: Record<string, string | undefined>;
};

export const PersonalizationContext = createContext<PinePersonalization>({});
export const usePersonalization = () => useContext(PersonalizationContext);
