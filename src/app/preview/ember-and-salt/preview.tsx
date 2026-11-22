"use client";
import { TemplatePreview } from "@/components/catalog/template-preview";
import { EMBER_BASE, EMBER_LANGUAGES, EMBER_PAGES } from "@/lib/ember-preview";
export function EmberPreview() { return <TemplatePreview slug="ember-and-salt" title="Ember & Salt" base={EMBER_BASE} pages={EMBER_PAGES} eventPrefix="ember-preview" languages={EMBER_LANGUAGES} personalizeHref="/personalize/ember-and-salt" />; }
