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
import { usePersonalization } from "./personalization";

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
  const personalization = usePersonalization();
  return useMemo(() => {
    const locale = language === "en" ? "en-PH" : "fil-PH";
    return {
      language, locale, t: (value: string, values: Record<string, string | number> = {}) => (personalization.islaCopy?.[value] || translated(value, language)).replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match)),
      rooms: translateData(content.rooms, language).map(room => { const override = personalization.islaRooms?.[room.slug]; if (!override) return room; const { description, details, ...fields } = override; return { ...room, ...fields, ...(description ? { description: description.split(/\n+/).map(s => s.trim()).filter(Boolean) } : {}), ...(details ? { details: details.split(/\n+/).map(s => s.trim()).filter(Boolean) } : {}) }; }),
      extras: translateData(content.extras, language).map(extra => ({ ...extra, ...personalization.islaExtras?.[extra.id] })),
      posts: translateData(content.posts, language).map(post => { const override = personalization.islaPosts?.[post.slug]; if (!override) return post; const { body, ...fields } = override; return { ...post, ...fields, ...(body ? { body: body.split(/\n+/).map(s => s.trim()).filter(Boolean) } : {}) }; }),
      menuHighlights: translateData(content.menuHighlights, language).map((item, index) => ({ ...item, ...personalization.islaMenu?.[["first", "second", "third", "fourth", "fifth"][index]] })),
      eventSpaces: translateData(content.eventSpaces, language).map((item, index) => ({ ...item, ...personalization.islaSpaces?.[["first", "second", "third"][index]] })),
      nav: nav.map(item => ({ ...item, label: personalization.islaCopy?.[item.label] || translated(item.label, language) })), site: { ...translateData(site, language), ...personalization.business, ...personalization.islaStayTimes },
      photos: Object.values(photos).map((photo) => ({ ...photo, alt: translated(photo.alt, language) })),
      photo: (key: content.PhotoKey) => { const original = content.photo(key); const custom = personalization.islaPhotos?.[key]; return { ...original, src: custom || original.src, alt: personalization.islaPhotoAlt?.[key] || (custom ? "Your selected website photo" : translated(original.alt, language)) }; },
      date: (day: string, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) => new Intl.DateTimeFormat(locale, options).format(fromDay(day)),
    };
  }, [language, personalization]);
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
