"use client";
import { TemplatePreview } from "@/components/catalog/template-preview";
import { PINE_BASE, PINE_PAGES } from "@/lib/pine-preview";
export function PinePreview() { return <TemplatePreview seasonal slug="pine-ridge-lodge" title="Pine Ridge Lodge" base={PINE_BASE} pages={PINE_PAGES} eventPrefix="pine-preview" personalizeHref="/personalize/pine-ridge-lodge" />; }
