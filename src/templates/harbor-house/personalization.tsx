"use client";

import { createContext, useContext } from "react";

// Preview-only overrides. The standalone template works without a provider.
export type HarborPersonalization = {
  business?: { name?: string; tagline?: string; hosts?: string; phone?: string; email?: string };
  home?: { headline?: string; welcome?: string };
  accent?: string;
  heroImage?: string;
};

export const PersonalizationContext = createContext<HarborPersonalization>({});
export const usePersonalization = () => useContext(PersonalizationContext);
