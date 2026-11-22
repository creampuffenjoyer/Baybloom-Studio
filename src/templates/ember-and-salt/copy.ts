"use client";

import { usePersonalization } from "./personalization";

export function useEmberCopy() {
  const { emberCopy } = usePersonalization();
  return (original: string) => emberCopy?.[original] || original;
}
