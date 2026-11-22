"use client";

import { createContext, useContext } from "react";

export type BloomfieldPersonalization = {
  photoPlacements?: Record<string, { alt?: string; original?: boolean } | undefined>;
  placementPhotos?: Record<string, string | undefined>;
  photoEditing?: boolean;
  photoSelection?: string;
  business?: { name?: string; tagline?: string; phone?: string; email?: string; address?: string[] };
  home?: { headline?: string; welcome?: string };
  bloomSpaces?: Record<string, { name?: string; kind?: string; short?: string; description?: string; bestFor?: string; ceremony?: number; dinner?: number; standing?: number } | undefined>;
  bloomPackages?: Record<string, { name?: string; price?: number; guests?: string; blurb?: string; includes?: string } | undefined>;
  bloomFaqs?: Record<string, { question?: string; answer?: string } | undefined>;
  bloomTimeline?: Record<string, { when?: string; what?: string } | undefined>;
  bloomReviews?: Record<string, { name?: string; when?: string; quote?: string } | undefined>;
  bloomReviewsHidden?: boolean;
  bloomPhotoAlt?: Record<string, string | undefined>;
  bloomCopy?: Record<string, string | undefined>;
  viewings?: string;
  accent?: string;
  heroImage?: string;
  bloomPhotos?: Record<string, string | undefined>;
};

export const PersonalizationContext = createContext<BloomfieldPersonalization>({});
export const usePersonalization = () => useContext(PersonalizationContext);
