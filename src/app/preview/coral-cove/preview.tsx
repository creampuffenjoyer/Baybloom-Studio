"use client";
import { TemplatePreview } from "@/components/catalog/template-preview";
import { CORAL_BASE, CORAL_PAGES } from "@/lib/coral-preview";
export function CoralPreview() { return <TemplatePreview slug="coral-cove" title="Coral Cove" base={CORAL_BASE} pages={CORAL_PAGES} eventPrefix="coral-preview" personalizeHref="/personalize/coral-cove" />; }
