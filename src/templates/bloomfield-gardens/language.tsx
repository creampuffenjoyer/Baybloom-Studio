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
import { usePersonalization } from "./personalization";

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
  const draft = usePersonalization();
  return useMemo(() => {
    const translate = (value: string) => language === "en" ? value : planningTranslations[value]?.[language === "tl" ? 0 : 1] ?? value;
    const photo = (key: content.PhotoKey) => { const item = content.photo(key); return { ...item, src: draft.bloomPhotos?.[key] || item.src, alt: draft.bloomPhotoAlt?.[key] || (language === "en" ? item.alt : photoTranslations[item.alt]?.[language === "tl" ? 0 : 1] ?? item.alt) }; };
    return { language, translate, finder: language === "en" ? null : finderTranslations[language],
      spaces: content.spaces.map((space) => { const original = language === "en" ? space : { ...space, ...spaceTranslations[space.slug][language] }; const override = draft.bloomSpaces?.[space.slug]; if (!override) return original; const { description, bestFor, ...fields } = override; return { ...original, ...fields, ...(description ? { description: description.split(/\n+/).map(s => s.trim()).filter(Boolean) } : {}), ...(bestFor ? { bestFor: bestFor.split(/\n+/).map(s => s.trim()).filter(Boolean) } : {}) }; }),
      packages: content.packages.map((pkg, index) => { const override = draft.bloomPackages?.[(["first", "second", "third"] as const)[index]]; return { ...pkg, guests: override?.guests || translate(pkg.guests), blurb: override?.blurb || translate(pkg.blurb), name: override?.name || pkg.name, price: override?.price ?? pkg.price, includes: override?.includes ? override.includes.split(/\n+/).map(s => s.trim()).filter(Boolean) : pkg.includes.map(translate) }; }),
      faqs: content.faqs.map(([q, a], index) => { const override = draft.bloomFaqs?.[(["first", "second", "third", "fourth", "fifth", "sixth"] as const)[index]]; return [override?.question || translate(q), override?.answer || translate(a)]; }),
      timeline: content.timeline.map((item, index) => { const override = draft.bloomTimeline?.[(["first", "second", "third", "fourth"] as const)[index]]; return { when: override?.when || translate(item.when), what: override?.what || translate(item.what) }; }),
      reviews: draft.bloomReviewsHidden ? [] : content.reviews.map((review, index) => ({ ...review, quote: translate(review.quote), when: translate(review.when), ...draft.bloomReviews?.[index === 0 ? "first" : "second"] })),
      photo, photos: Object.values(photos).map((item) => ({ ...item, alt: language === "en" ? item.alt : photoTranslations[item.alt]?.[language === "tl" ? 0 : 1] ?? item.alt })),
      galleryOrder: content.galleryOrder,
    };
  }, [language, draft]);
}
export function LocalLink({ href, ...props }: React.ComponentProps<typeof NextLink>) {
  const language = useContext(Context);
  return <NextLink {...props} href={typeof href === "string" ? localizedHref(href, language) : href} />;
}
export function LanguagePicker() {
  const language = useContext(Context); const params = useSearchParams(); const path = usePathname();
  return <div className="mx-auto max-w-7xl px-5 py-3 text-sm sm:px-8"><label className="flex flex-wrap items-center justify-end gap-2">Language / Wika<select aria-label="Language / Wika" value={language} className="rounded-lg border border-tpl-line bg-tpl-surface px-3 py-2" onChange={(event) => { const next = new URLSearchParams(params.toString()); next.set("lang", languageOf(event.target.value)); window.history.replaceState(null, "", `${path}?${next}`); }}><option value="en">English</option><option value="tl">Tagalog (draft)</option><option value="taglish">Taglish (draft)</option></select></label>{language !== "en" && <p role="status" className="mt-2 text-right text-tpl-muted">{language === "tl" ? "Bahagyang naisalin: may ilang pahinang nananatiling nasa Ingles." : "Partial translation: some pages and controls are still in English."}</p>}</div>;
}
