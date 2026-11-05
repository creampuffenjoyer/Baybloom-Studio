"use client";
import { TemplatePreview } from "@/components/catalog/template-preview";
import { STILL_WATER_BASE, STILL_WATER_LANGUAGES, STILL_WATER_PAGES } from "@/lib/still-water-preview";
export function StillWaterPreview() { return <TemplatePreview slug="still-water-spa" title="Still Water Spa" base={STILL_WATER_BASE} pages={STILL_WATER_PAGES} eventPrefix="still-water-preview" languages={STILL_WATER_LANGUAGES} />; }
