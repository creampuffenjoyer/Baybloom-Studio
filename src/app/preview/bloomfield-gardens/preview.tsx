"use client";
import { TemplatePreview } from "@/components/catalog/template-preview";
import { BLOOMFIELD_BASE, BLOOMFIELD_LANGUAGES, BLOOMFIELD_PAGES } from "@/lib/bloomfield-preview";
export function BloomfieldPreview() { return <TemplatePreview slug="bloomfield-gardens" title="Bloomfield Gardens" base={BLOOMFIELD_BASE} pages={BLOOMFIELD_PAGES} eventPrefix="bloomfield-preview" languages={BLOOMFIELD_LANGUAGES} personalizeHref="/personalize/bloomfield-gardens" />; }
