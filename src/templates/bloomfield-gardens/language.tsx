"use client";
import NextLink from "next/link";
import { createContext, useContext, useEffect, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { languageOf, localizedHref, type Language } from "../_kit/language-url";
import * as content from "./content";
import photos from "./photos.json";
import { planningTranslations } from "./planning-translations";
import { photoTranslations } from "./photo-translations";
import { finderTranslations, spaceTranslations } from "./space-translations";

const Context = createContext<Language>("en");
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = languageOf(useSearchParams().get("lang"));
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (window.parent === window || event.source !== window.parent || event.origin !== location.origin || event.data?.type !== "bloomfield-preview-language") return;
      const url = new URL(location.href); url.searchParams.set("lang", languageOf(event.data.language)); window.history.replaceState(null, "", url);
    };
    window.addEventListener("message", receive); return () => window.removeEventListener("message", receive);
  }, []);
  useEffect(() => { const previous = document.documentElement.lang; document.documentElement.lang = language === "en" ? "en" : "fil"; return () => { document.documentElement.lang = previous; }; }, [language]);
  return <Context value={language}><div lang={language === "en" ? "en" : "fil"}>{children}</div></Context>;
}
export function useBloomfield() {
  const language = useContext(Context);
  return useMemo(() => {
    const translate = (value: string) => language === "en" ? value : planningTranslations[value]?.[language === "tl" ? 0 : 1] ?? value;
    const photo = (key: content.PhotoKey) => { const item = content.photo(key); return { ...item, alt: language === "en" ? item.alt : photoTranslations[item.alt]?.[language === "tl" ? 0 : 1] ?? item.alt }; };
    return { language, translate, finder: language === "en" ? null : finderTranslations[language],
      spaces: content.spaces.map((space) => language === "en" ? space : { ...space, ...spaceTranslations[space.slug][language] }),
      packages: content.packages.map((pkg) => ({ ...pkg, guests: translate(pkg.guests), blurb: translate(pkg.blurb), includes: pkg.includes.map(translate) })),
      faqs: content.faqs.map(([q, a]) => [translate(q), translate(a)]),
      timeline: content.timeline.map((item) => ({ when: translate(item.when), what: translate(item.what) })),
      reviews: content.reviews.map((review) => ({ ...review, quote: translate(review.quote), when: translate(review.when) })),
      photo, photos: Object.values(photos).map((item) => ({ ...item, alt: language === "en" ? item.alt : photoTranslations[item.alt]?.[language === "tl" ? 0 : 1] ?? item.alt })),
      galleryOrder: content.galleryOrder,
    };
  }, [language]);
}
export function LocalLink({ href, ...props }: React.ComponentProps<typeof NextLink>) {
  const language = useContext(Context);
  return <NextLink {...props} href={typeof href === "string" ? localizedHref(href, language) : href} />;
}
export function LanguagePicker() {
  const language = useContext(Context); const params = useSearchParams(); const path = usePathname();
  return <div className="mx-auto max-w-7xl px-5 py-3 text-sm sm:px-8"><label className="flex flex-wrap items-center justify-end gap-2">Language / Wika<select aria-label="Language / Wika" value={language} className="rounded-lg border border-tpl-line bg-tpl-surface px-3 py-2" onChange={(event) => { const next = new URLSearchParams(params.toString()); next.set("lang", languageOf(event.target.value)); window.history.replaceState(null, "", `${path}?${next}`); }}><option value="en">English</option><option value="tl">Tagalog (draft)</option><option value="taglish">Taglish (draft)</option></select></label>{language !== "en" && <p role="status" className="mt-2 text-right text-tpl-muted">{language === "tl" ? "Bahagyang naisalin: may ilang pahinang nananatiling nasa Ingles." : "Partial translation: some pages and controls are still in English."}</p>}</div>;
}
