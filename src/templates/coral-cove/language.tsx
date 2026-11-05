"use client";

import NextLink from "next/link";
import { createContext, useContext, useEffect, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import * as content from "./content";
import { nav, site } from "./site";
import { copy } from "./translations";

export type Language = "en" | "tl" | "taglish";
export const languageOf = (value: string | null): Language => value === "tl" || value === "taglish" ? value : "en";
export function translated(text: string, language: Language) {
  return language === "en" ? text : copy[text]?.[language === "tl" ? 0 : 1] ?? text;
}
function translateData<T>(value: T, language: Language): T {
  if (typeof value === "string") return translated(value, language) as T;
  if (Array.isArray(value)) return value.map((item) => translateData(item, language)) as T;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key,
    ["slug", "id", "kind", "src", "source", "license", "licenseUrl", "author", "photos", "photo", "pool", "per", "href", "phone", "email", "whatsapp", "social"].includes(key) ? item : translateData(item, language),
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
      if (window.parent === window || event.source !== window.parent || event.origin !== location.origin || event.data?.type !== "coral-preview-language") return;
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
    const heading = document.querySelector('[data-template="coral-cove"] h1')?.textContent;
    if (heading) document.title = `${heading} · Coral Cove`;
    document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-template="coral-cove"] input, [data-template="coral-cove"] textarea').forEach((field) => {
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

export function useCoral() {
  const language = useContext(Context);
  return useMemo(() => ({
    language, locale: language === "en" ? "en-PH" : "fil-PH",
    t: (text: string) => translated(text, language),
    villas: translateData(content.villas, language), extras: translateData(content.extras, language),
    experiences: translateData(content.experiences, language), offers: translateData(content.offers, language),
    reviews: translateData(content.reviews, language), site: translateData(site, language), nav: translateData(nav, language),
    photo: (key: content.PhotoKey) => ({ ...content.photo(key), alt: translated(content.photo(key).alt, language) }),
  }), [language]);
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
  const { language, t } = useCoral();
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
