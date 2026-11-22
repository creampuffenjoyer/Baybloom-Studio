"use client";
import { usePersonalization } from "./personalization";
export function useBloomCopy() { const { bloomCopy } = usePersonalization(); return (original: string) => bloomCopy?.[original] || original; }
