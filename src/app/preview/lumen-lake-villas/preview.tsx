"use client";
import { TemplatePreview } from "@/components/catalog/template-preview";
import { LUMEN_BASE, LUMEN_PAGES } from "@/lib/lumen-lake-villas-preview";
export function LumenPreview() { return <TemplatePreview slug="lumen-lake-villas" title="Lumen Lake Villas" base={LUMEN_BASE} pages={LUMEN_PAGES} eventPrefix="lumen-preview" personalizeHref="/personalize/lumen-lake-villas" />; }
