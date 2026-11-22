"use client";
import NextLink from "next/link";
import { createContext, useContext, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { languageOf, localizedHref, type Language } from "../_kit/language-url";
import * as content from "./content";
import { treatmentTranslations } from "./treatment-translations";
import { bookingTranslations } from "./booking-translations";
import { usePersonalization } from "./personalization";
import { site } from "./site";

const Context = createContext<Language>("en");
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = languageOf(useSearchParams().get("lang"));
  useEffect(() => { const receive = (event: MessageEvent) => { if (window.parent === window || event.source !== window.parent || event.origin !== location.origin || event.data?.type !== "still-water-preview-language") return; const url = new URL(location.href); url.searchParams.set("lang", languageOf(event.data.language)); window.history.replaceState(null, "", url); }; window.addEventListener("message", receive); return () => window.removeEventListener("message", receive); }, []);
  useEffect(() => { const previous = document.documentElement.lang; document.documentElement.lang = language === "en" ? "en" : "fil"; return () => { document.documentElement.lang = previous; }; }, [language]);
  return <Context value={language}><div lang={language === "en" ? "en" : "fil"}>{language !== "en" && <p role="status" className="mx-auto max-w-7xl px-5 py-3 text-right text-sm text-tpl-muted sm:px-8">{language === "tl" ? "Bahagyang naisalin: may ilang pahinang nananatiling nasa Ingles." : "Partial translation: some pages and controls are still in English."}</p>}{children}</div></Context>;
}
export function useStillWater() {
  const language = useContext(Context);
  const draft = usePersonalization();
  return useMemo(() => ({ language, locale: language === "en" ? "en-GB" : "fil-PH", t: (value: string, values: Record<string, string | number> = {}) => (language === "en" ? value : bookingTranslations[value]?.[language === "tl" ? 0 : 1] ?? value).replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match)), treatments: content.treatments.map((item) => { const translated = language === "en" ? item : { ...item, ...treatmentTranslations[item.slug][language] }; const override = draft.spaTreatments?.[item.slug]; if (!override) return translated; const { description, includes, prices, ...fields } = override; return { ...translated, ...fields, ...(description ? { description: description.split(/\n+/).map(s => s.trim()).filter(Boolean) } : {}), ...(includes ? { includes: includes.split(/\n+/).map(s => s.trim()).filter(Boolean) } : {}), options: item.options.map((option, index) => ({ ...option, price: prices?.[index === 0 ? "first" : "second"] ?? option.price })) }; }), packages: content.packages.map((item, index) => { const override = draft.spaPackages?.[["first", "second", "third"][index]]; if (!override) return item; const { items, ...fields } = override; return { ...item, ...fields, ...(items ? { items: items.split(/\n+/).map(s => s.trim()).filter(Boolean) } : {}) }; }) }), [language, draft]);
}
export function useSpaHours() {
  const { spaHours } = usePersonalization();
  return site.hours.map((hours, index) => ({ ...hours, ...spaHours?.[index === 0 ? "first" : "second"] }));
}
export function LocalLink({ href, ...props }: React.ComponentProps<typeof NextLink>) {
  const language = useContext(Context);
  return <NextLink {...props} href={typeof href === "string" ? localizedHref(href, language) : href} />;
}
