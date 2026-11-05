"use client";
import { TemplatePreview } from "@/components/catalog/template-preview";
import { HARBOR_BASE, HARBOR_PAGES } from "@/lib/harbor-preview";
export function HarborPreview() { return <TemplatePreview slug="harbor-house" title="Harbor House" base={HARBOR_BASE} pages={HARBOR_PAGES} eventPrefix="harbor-preview" personalizeHref="/personalize/harbor-house" />; }
