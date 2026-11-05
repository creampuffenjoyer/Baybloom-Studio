"use client";
import NextLink from "next/link";
import { createContext, useContext, useEffect, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import * as content from "./content";
import { nav, site } from "./site";
import { copy } from "./translations";
import { languageOf, localizedHref, type Language } from "../_kit/language-url";

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
export function useLumen() { const language = useContext(Context); return useMemo(() => ({ language, locale: language === "en" ? "en-SE" : "fil-PH", t: (s: string) => translated(s, language), villas: translateData(content.villas, language), extras: translateData(content.extras, language), experiences: translateData(content.experiences, language), site: translateData(site, language), nav: translateData(nav, language), photo: (key: content.PhotoKey) => ({ ...content.photo(key), alt: translated(content.photo(key).alt, language) }) }), [language]); }
export function LocalLink({ href, ...props }: React.ComponentProps<typeof NextLink>) { const language = useContext(Context); return <NextLink {...props} href={typeof href === "string" ? localizedHref(href, language) : href} />; }
export function LanguagePicker() { const language = useContext(Context); const params = useSearchParams(); const path = usePathname(); return <label className="ml-auto flex items-center gap-2 text-xs text-tpl-muted">Language<select aria-label="Language" value={language} className="border border-tpl-line bg-tpl-bg px-2 py-1 text-tpl-ink" onChange={(e) => { const next = new URLSearchParams(params.toString()); next.set("lang", languageOf(e.target.value)); window.history.replaceState(null, "", `${path}?${next}`); }}><option value="en">English</option><option value="tl">Tagalog</option><option value="taglish">Taglish</option></select></label>; }
