"use client";

import NextLink from "next/link";
import { createContext, useContext, useEffect, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import * as content from "./content";
import { nav, site } from "./site";
import { copy } from "./translations";
import { usePersonalization } from "./personalization";

export type Language = "en" | "tl" | "taglish";
export const languageOf = (value: string | null): Language => value === "tl" || value === "taglish" ? value : "en";
export function translated(text: string, language: Language) {
  return language === "en" ? text : copy[text]?.[language === "tl" ? 0 : 1] ?? text;
}
function translateData<T>(value: T, language: Language): T {
  if (typeof value === "string") return translated(value, language) as T;
  if (Array.isArray(value)) return value.map((item) => translateData(item, language)) as T;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key,
    ["slug", "id", "kind", "src", "source", "license", "licenseUrl", "author", "photos"].includes(key) ? item : translateData(item, language),
  ])) as T;
  return value;
}

const Context = createContext<Language>("en");
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const params = useSearchParams();
  const path = usePathname();
  const language = languageOf(params.get("lang"));
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (window.parent === window || event.source !== window.parent || event.origin !== location.origin || event.data?.type !== "harbor-preview-language") return;
      const url = new URL(location.href);
      url.searchParams.set("lang", languageOf(event.data.language));
      window.history.replaceState(null, "", url);
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);
  useEffect(() => {
    const previous = document.documentElement.lang;
    const previousTitle = document.title;
    document.documentElement.lang = language === "en" ? "en" : "fil";
    const heading = document.querySelector('[data-template="harbor-house"] h1')?.textContent;
    if (heading) document.title = `${heading} · Harbor House`;
    document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-template="harbor-house"] input, [data-template="harbor-house"] textarea').forEach((field) => {
      if (field.validity.customError) {
        field.setCustomValidity("");
        if (!field.validity.valid) field.setCustomValidity(translated(field.validity.valueMissing ? "Please fill out this field." : "Please enter a valid value.", language));
      }
    });
    return () => { document.documentElement.lang = previous; document.title = previousTitle; };
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

export function useHarbor() {
  const language = useContext(Context);
  const personalization = usePersonalization();
  return useMemo(() => ({
    language, locale: language === "en" ? "en-PH" : "fil-PH",
    t: (text: string) => translated(text, language),
    rooms: translateData(content.rooms, language).map((room) => {
      const override = personalization.rooms?.[room.slug];
      return override ? {
        ...room, name: override.name || room.name, postcard: override.postcard || room.postcard,
        description: override.description ? [override.description] : room.description,
        bed: override.bed || room.bed, view: override.view || room.view,
        little: override.features?.trim() ? override.features.split(/\r?\n/).map((item) => item.trim()).filter(Boolean) : room.little,
        price: override.price ?? room.price, maxGuests: override.maxGuests ?? room.maxGuests,
      } : room;
    }), extras: translateData(content.extras, language),
    breakfast: translateData(content.breakfast, language).map((section, index) => {
      const override = index === 0 ? personalization.breakfast?.morning : personalization.breakfast?.advance;
      return override ? { ...section, title: override.title || section.title, items: override.items ? override.items.split(/\r?\n/).map((item) => item.trim()).filter(Boolean) : section.items } : section;
    }),
    places: translateData(content.places, language).map((place) => {
      const override = personalization.guide?.places?.[place.id];
      return override ? { ...place, name: override.name || place.name, distance: override.distance || place.distance, note: override.note || place.note } : place;
    }),
    guestbook: translateData(content.guestbook, language), site: { ...translateData(site, language), ...Object.fromEntries(Object.entries(personalization.business ?? {}).filter(([, value]) => value !== undefined)) }, nav: translateData(nav, language),
    photo: (key: content.PhotoKey) => ({ ...content.photo(key), src: personalization.websitePhotos?.[key] || content.photo(key).src, alt: personalization.housePhotoAlt?.[key] || translated(content.photo(key).alt, language) }),
  }), [language, personalization]);
}

export function localizedHref(href: string, language: Language) {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const url = new URL(href, "https://template.invalid");
  url.searchParams.set("lang", language);
  return url.pathname + url.search + url.hash;
}
export function LocalLink({ href, ...props }: React.ComponentProps<typeof NextLink>) {
  const language = useContext(Context);
  return <NextLink {...props} href={typeof href === "string" ? localizedHref(href, language) : href} />;
}

export function LanguagePicker() {
  const { language, t } = useHarbor();
  const params = useSearchParams();
  const path = usePathname();
  return <label className="mx-auto flex max-w-6xl items-center justify-end gap-2 px-5 pt-3 text-sm sm:px-8">
    {t("Language")}
    <select aria-label={t("Language")} value={language} className="max-w-40 rounded-lg border border-tpl-line bg-tpl-surface px-3 py-2" onChange={(e) => {
      const next = new URLSearchParams(params.toString());
      next.set("lang", languageOf(e.target.value));
      window.history.replaceState(null, "", `${path}?${next}`);
    }}>
      <option value="en">English</option><option value="tl">Tagalog</option><option value="taglish">Taglish</option>
    </select>
  </label>;
}
