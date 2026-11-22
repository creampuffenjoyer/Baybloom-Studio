"use client";

import NextLink from "next/link";
import { createContext, useContext, useEffect, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import * as content from "./content";
import { nav, site } from "./site";
import { seasonOf } from "./plan";
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
    ["slug", "id", "kind", "src", "source", "license", "licenseUrl", "author", "photos", "photo", "pool", "season", "hero", "date", "levelId", "per", "href", "phone", "email", "whatsapp", "social"].includes(key) ? item : translateData(item, language),
  ])) as T;
  return value;
}

const Context = createContext<Language>("en");
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const params = useSearchParams();
  const path = usePathname();
  const language = languageOf(params.get("lang"));
  const season = seasonOf(params.get("season"));
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (window.parent === window || event.source !== window.parent || event.origin !== location.origin || event.data?.type !== "pine-preview-language") return;
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
    const heading = document.querySelector('[data-template="pine-ridge-lodge"] h1')?.textContent;
    if (heading) document.title = `${heading} · Pine Ridge Lodge`;
    document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-template="pine-ridge-lodge"] input, [data-template="pine-ridge-lodge"] textarea').forEach((field) => {
      if (field.validity.customError) {
        field.setCustomValidity("");
        if (!field.validity.valid) field.setCustomValidity(translated(field.validity.valueMissing ? "Please fill out this field." : "Please enter a valid value.", language));
      }
    });
    return () => { document.documentElement.lang = previous; document.title = previousTitle; };
  }, [language, path, season]);
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

export function usePine() {
  const params = useSearchParams();
  const season = seasonOf(params.get("season"));
  const language = useContext(Context);
  const personalization = usePersonalization();
  return useMemo(() => ({
    language, season,
    setSeason: (next: content.Season) => { const url = new URL(location.href); url.searchParams.set("season", next); url.searchParams.delete("activity"); window.history.replaceState(null, "", url); },
    locale: language === "en" ? "en-PH" : "fil-PH",
    t: (text: string) => personalization.pineCopy?.[text] || translated(text, language),
    rooms: translateData(content.rooms, language).map((room) => { const override = personalization.pineRooms?.[room.slug]; if (!override) return room; const { description, features, ...fields } = override; return { ...room, ...fields, ...(description ? { description: description.split(/\n+/).map(s => s.trim()).filter(Boolean) } : {}), ...(features ? { features: features.split(/\n+/).map(s => s.trim()).filter(Boolean) } : {}) }; }), extras: translateData(content.extras, language).map(extra => ({ ...extra, ...personalization.pineExtras?.[extra.id] })),
    activities: translateData(content.activities, language).map(activity => ({ ...activity, ...personalization.pineActivities?.[activity.id] })), seasons: { winter: { ...translateData(content.seasons.winter, language), ...personalization.pineSeasons?.winter }, summer: { ...translateData(content.seasons.summer, language), ...personalization.pineSeasons?.summer } },
    menu: translateData(content.menu, language).map((item, index) => ({ ...item, ...personalization.pineMenu?.[["first", "second", "third", "fourth", "fifth"][index]] })),
    posts: translateData(content.posts, language).map(post => { const override = personalization.pinePosts?.[post.slug]; if (!override) return post; const { body, ...fields } = override; return { ...post, ...fields, ...(body ? { body: body.split(/\n+/).map(s => s.trim()).filter(Boolean) } : {}) }; }), site: { ...translateData(site, language), ...personalization.business, ...personalization.pineStayTimes }, nav: nav.map(item => ({ ...item, label: personalization.pineCopy?.[item.label] || translated(item.label, language) })),
    photo: (key: content.PhotoKey) => { const original = content.photo(key); const custom = personalization.pinePhotos?.[key]; return { ...original, src: custom || original.src, alt: personalization.pinePhotoAlt?.[key] || (custom ? "Your selected website photo" : translated(original.alt, language)) }; },
  }), [language, season, personalization]);
}

export function localizedHref(href: string, language: Language) {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const url = new URL(href, "https://template.invalid");
  url.searchParams.set("lang", language);
  return url.pathname + url.search + url.hash;
}
export function LocalLink({ href, ...props }: React.ComponentProps<typeof NextLink>) {
  const language = useContext(Context);
  const params = useSearchParams();
  if (typeof href === "string" && href.startsWith("/") && !href.startsWith("//")) {
    const url = new URL(href, "https://template.invalid");
    for (const key of ["season", "activity", "guests"]) if (!url.searchParams.has(key) && params.has(key)) url.searchParams.set(key, params.get(key)!);
    href = url.pathname + url.search + url.hash;
  }
  return <NextLink {...props} href={typeof href === "string" ? localizedHref(href, language) : href} />;
}

export function LanguagePicker() {
  const { language, t } = usePine();
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
