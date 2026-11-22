"use client";
import { usePersonalization } from "./personalization";
export function useSpaCopy() {
  const { spaCopy } = usePersonalization();
  return (original: string) => spaCopy?.[original] || original;
}
