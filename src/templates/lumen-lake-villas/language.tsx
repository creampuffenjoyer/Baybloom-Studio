"use client";
import NextLink from "next/link";
import { createContext, useContext, useEffect, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import * as content from "./content";
import { nav, site } from "./site";
import { copy } from "./translations";
import { languageOf, localizedHref, type Language } from "../_kit/language-url";
import { usePersonalization } from "./personalization";

function translated(text: string, language: Language) { return language === "en" ? text : copy[text]?.[language === "tl" ? 0 : 1] ?? text; }
function translateData<T>(value: T, language: Language): T {
  if (typeof value === "string") return translated(value, language) as T;
  if (Array.isArray(value)) return value.map((item) => translateData(item, language)) as T;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, ["slug", "id", "src", "source", "license", "licenseUrl", "author", "photos", "photo", "phone", "email", "social"].includes(key) ? item : translateData(item, language)])) as T;
  return value;
}
const Context = createContext<Language>("en");
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const params = useSearchParams(); const path = usePathname(); const language = languageOf(params.get("lang"));
  useEffect(() => { const receive = (event: MessageEvent) => { if (window.parent === window || event.source !== window.parent || event.origin !== location.origin || event.data?.type !== "lumen-preview-language") return; const url = new URL(location.href); url.searchParams.set("lang", languageOf(event.data.language)); window.history.replaceState(null, "", url); }; window.addEventListener("message", receive); return () => window.removeEventListener("message", receive); }, []);
  useEffect(() => { const old = document.documentElement.lang; document.documentElement.lang = language === "en" ? "en" : "fil"; return () => { document.documentElement.lang = old; }; }, [language, path]);
  return <Context value={language}><div lang={language === "en" ? "en" : "fil"}>{children}</div></Context>;
}
export function useLumen() { const language = useContext(Context); const personalization = usePersonalization(); return useMemo(() => ({ language, locale: language === "en" ? "en-SE" : "fil-PH", t: (s: string) => personalization.lumenCopy?.[s] || translated(s, language), villas: translateData(content.villas, language).map(villa => { const override = personalization.lumenVillas?.[villa.slug]; if (!override) return villa; const { description, ...fields } = override; return { ...villa, ...fields, ...(description ? { description: description.split(/\n+/).map(s => s.trim()).filter(Boolean) } : {}) }; }), extras: translateData(content.extras, language).map(extra => ({ ...extra, ...personalization.lumenExtras?.[extra.id] })), experiences: translateData(content.experiences, language).map(experience => ({ ...experience, ...personalization.lumenExperiences?.[experience.slug] })), site: { ...translateData(site, language), ...personalization.business, ...personalization.lumenStayTimes }, nav: nav.map(item => ({ ...item, label: personalization.lumenCopy?.[item.label] || translated(item.label, language) })), photo: (key: content.PhotoKey) => { const original = content.photo(key); const custom = personalization.lumenPhotos?.[key]; return { ...original, src: custom || original.src, alt: personalization.lumenPhotoAlt?.[key] || (custom ? "Your selected website photo" : translated(original.alt, language)) }; } }), [language, personalization]); }
export function LocalLink({ href, ...props }: React.ComponentProps<typeof NextLink>) { const language = useContext(Context); return <NextLink {...props} href={typeof href === "string" ? localizedHref(href, language) : href} />; }
export function LanguagePicker() { const language = useContext(Context); const params = useSearchParams(); const path = usePathname(); return <label className="ml-auto flex items-center gap-2 text-xs text-tpl-muted">Language<select aria-label="Language" value={language} className="border border-tpl-line bg-tpl-bg px-2 py-1 text-tpl-ink" onChange={(e) => { const next = new URLSearchParams(params.toString()); next.set("lang", languageOf(e.target.value)); window.history.replaceState(null, "", `${path}?${next}`); }}><option value="en">English</option><option value="tl">Tagalog</option><option value="taglish">Taglish</option></select></label>; }
