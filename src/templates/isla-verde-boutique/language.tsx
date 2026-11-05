"use client";

import NextLink from "next/link";
import { createContext, useContext, useEffect, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { languageOf, localizedHref, type Language } from "../_kit/language-url";
import { fromDay } from "../_kit/dates";
import * as content from "./content";
import { nav, site } from "./site";
import photos from "./photos.json";
import { copy } from "./translations";

export function translated(value: string, language: Language): string {
  if (language === "en") return value;
  const key = value.trim().replace(/\s+/g, " ");
  const result = copy[key]?.[language === "tl" ? 0 : 1];
  return result === undefined ? value : value.replace(value.trim(), result);
}

const stable = new Set(["slug", "id", "src", "source", "license", "licenseUrl", "author", "photos", "photo", "date", "per", "href", "phone", "email", "social", "address"]);
export function translateData<T>(value: T, language: Language): T {
  if (typeof value === "string") return translated(value, language) as T;
  if (Array.isArray(value)) return value.map((item) => translateData(item, language)) as T;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, stable.has(key) ? item : translateData(item, language)])) as T;
  return value;
}

const Context = createContext<Language>("en");
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = languageOf(useSearchParams().get("lang"));
  const path = usePathname();
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (window.parent === window || event.source !== window.parent || event.origin !== location.origin || event.data?.type !== "isla-preview-language") return;
      const url = new URL(location.href);
      url.searchParams.set("lang", languageOf(event.data.language));
      window.history.replaceState(null, "", url);
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);
  useEffect(() => {
    const oldLang = document.documentElement.lang;
    const oldTitle = document.title;
    document.documentElement.lang = language === "en" ? "en" : "fil";
    const heading = document.querySelector('[data-template="isla-verde-boutique"] h1')?.textContent;
    if (heading) document.title = `${heading} · Isla Verde`;
    document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('[data-template="isla-verde-boutique"] input, [data-template="isla-verde-boutique"] textarea, [data-template="isla-verde-boutique"] select').forEach((field) => {
      if (!field.validity.customError) return;
      field.setCustomValidity("");
      if (!field.validity.valid) field.setCustomValidity(translated(field.validity.valueMissing ? "Please fill out this field." : "Please enter a valid value.", language));
    });
    return () => { document.documentElement.lang = oldLang; document.title = oldTitle; };
  }, [language, path]);
  return <Context value={language}><div lang={language === "en" ? "en" : "fil"} onInvalidCapture={(event) => {
    const field = event.target;
    if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
      field.setCustomValidity("");
      field.setCustomValidity(translated(field.validity.valueMissing ? "Please fill out this field." : "Please enter a valid value.", language));
    }
  }} onInputCapture={(event) => {
    const field = event.target;
    if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) field.setCustomValidity("");
  }}>{children}</div></Context>;
}

export function useIsla() {
  const language = useContext(Context);
  return useMemo(() => {
    const locale = language === "en" ? "en-PH" : "fil-PH";
    return {
      language, locale, t: (value: string, values: Record<string, string | number> = {}) => translated(value, language).replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match)),
      rooms: translateData(content.rooms, language), extras: translateData(content.extras, language),
      posts: translateData(content.posts, language), menuHighlights: translateData(content.menuHighlights, language), eventSpaces: translateData(content.eventSpaces, language),
      nav: translateData(nav, language), site: translateData(site, language),
      photos: Object.values(photos).map((photo) => ({ ...photo, alt: translated(photo.alt, language) })),
      photo: (key: content.PhotoKey) => ({ ...content.photo(key), alt: translated(content.photo(key).alt, language) }),
      date: (day: string, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) => new Intl.DateTimeFormat(locale, options).format(fromDay(day)),
    };
  }, [language]);
}

export function LocalLink({ href, ...props }: React.ComponentProps<typeof NextLink>) {
  const language = useContext(Context);
  return <NextLink {...props} href={typeof href === "string" ? localizedHref(href, language) : { ...href, query: { ...(typeof href.query === "object" ? href.query : {}), lang: language } }} />;
}

export function LanguagePicker() {
  const { language, t } = useIsla();
  const params = useSearchParams();
  const path = usePathname();
  return <label className="mx-auto flex max-w-7xl items-center justify-end gap-2 px-5 py-2 text-sm sm:px-8">
    {t("Language")}
    <select aria-label={t("Language")} value={language} className="border border-tpl-line bg-tpl-bg px-3 py-2" onChange={(event) => {
      const next = new URLSearchParams(params.toString());
      next.set("lang", languageOf(event.target.value));
      window.history.replaceState(null, "", `${path}?${next}`);
    }}><option value="en">English</option><option value="tl">Tagalog</option><option value="taglish">Taglish</option></select>
  </label>;
}
