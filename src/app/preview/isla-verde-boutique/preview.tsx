"use client";
import { TemplatePreview } from "@/components/catalog/template-preview";
import { ISLA_BASE, ISLA_LANGUAGES, ISLA_PAGES } from "@/lib/isla-preview";

export function IslaPreview() {
  return <TemplatePreview slug="isla-verde-boutique" title="Isla Verde" base={ISLA_BASE} pages={ISLA_PAGES} eventPrefix="isla-preview" languages={ISLA_LANGUAGES} />;
}
