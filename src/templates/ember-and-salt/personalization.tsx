"use client";

import { createContext, useContext } from "react";

export type EmberPersonalization = {
  photoPlacements?: Record<string, { alt?: string; original?: boolean } | undefined>;
  placementPhotos?: Record<string, string | undefined>;
  photoEditing?: boolean;
  photoSelection?: string;
  business?: { name?: string; tagline?: string; phone?: string; email?: string; address?: string[] };
  home?: { headline?: string; welcome?: string };
  accent?: string;
  heroImage?: string;
  emberMenus?: Record<string, { label?: string; served?: string } | undefined>;
  emberSections?: Record<string, { title?: string; intro?: string } | undefined>;
  emberDishes?: Record<string, { name?: string; detail?: string; price?: number; note?: string; diet?: ("v" | "vg" | "gf" | "df")[] } | undefined>;
  emberSpaces?: Record<string, { name?: string; seats?: string; standing?: string; description?: string; minimum?: number } | undefined>;
  emberHours?: Record<string, { days?: string; time?: string } | undefined>;
  emberCopy?: Record<string, string>;
  emberStory?: { heading?: string; introduction?: string; sourcing?: string; chapters?: Record<string, { year?: string; text?: string } | undefined> };
  emberPress?: Record<string, { quote?: string; source?: string } | undefined>;
  emberPressHidden?: boolean;
  emberSignatures?: Record<string, { name?: string; line?: string } | undefined>;
  emberPhotos?: Record<string, string | undefined>;
  emberPhotoAlt?: Record<string, string | undefined>;
};

export const PersonalizationContext = createContext<EmberPersonalization>({});
export const usePersonalization = () => useContext(PersonalizationContext);
