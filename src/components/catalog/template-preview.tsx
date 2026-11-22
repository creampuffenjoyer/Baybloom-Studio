"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { languageOf, localizedHref, type Language } from "@/templates/_kit/language-url";

const DEFAULT_LANGUAGES: readonly [Language, ...Language[]] = ["en", "tl", "taglish"];
const LANGUAGE_LABELS: Record<Language, string> = { en: "English", tl: "Tagalog", taglish: "Taglish" };

export function TemplatePreview({ slug, title, base, pages, eventPrefix, seasonal = false, languages = DEFAULT_LANGUAGES, personalizeHref }: { slug: string; title: string; base: string; pages: readonly (readonly [string, string])[]; eventPrefix: string; seasonal?: boolean; languages?: readonly [Language, ...Language[]]; personalizeHref?: string }) {
  const allowedPage = (value: string | null) => pages.some(([p]) => p === value) ? value! : "";
  const params = useSearchParams();
  const [page, setPage] = useState(() => allowedPage(params.get("page")));
  const [device, setDevice] = useState(() => params.get("device") === "mobile" ? "mobile" : "desktop");
  const [language, setLanguage] = useState(() => {
    const requested = languageOf(params.get("lang"));
    return languages.includes(requested) ? requested : languages[0];
  });
  const [season, setSeason] = useState(() => params.get("season") === "summer" ? "summer" : "winter");
  const previewHref = (path: string) => localizedHref(base + path + (seasonal ? `?season=${season}` : ""), language);
  const [source, setSource] = useState(() => previewHref(page));
  const [navigation, setNavigation] = useState(0);
  const frame = useRef<HTMLIFrameElement>(null);

  function save(nextPage: string, nextDevice: string, nextLanguage = language) {
    const url = new URL(window.location.href);
    url.search = new URLSearchParams({ page: nextPage, device: nextDevice, lang: nextLanguage, ...(seasonal ? { season } : {}) }).toString();
    window.history.replaceState(null, "", url);
  }

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow || event.data?.type !== `${eventPrefix}-page`) return;
      if (typeof event.data.path !== "string" || !pages.some(([path]) => base + path === event.data.path)) return;
      const next = event.data.path.slice(base.length);
      setPage(next);
      const requested = languageOf(event.data.language);
      const nextLanguage = languages.includes(requested) ? requested : languages[0];
      setLanguage(nextLanguage);
      const url = new URL(window.location.href);
      url.searchParams.set("page", next);
      url.searchParams.set("lang", nextLanguage);
      if (seasonal) {
        const nextSeason = event.data.season === "summer" ? "summer" : "winter";
        setSeason(nextSeason);
        url.searchParams.set("season", nextSeason);
      }
      window.history.replaceState(null, "", url);
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [base, pages, eventPrefix, seasonal, languages]);

  return <main className="flex h-dvh flex-col overflow-hidden bg-[#e8e4dc] text-ink">
    <header className="shrink-0 border-b border-border bg-sand px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div><Link href={`/designs/${slug}`} className="text-xs underline underline-offset-4">Back to details</Link>
          <h1 className="mt-1 font-serif text-xl text-bay">{title}</h1></div>
        <div className="flex flex-wrap justify-end gap-2">{personalizeHref && <Link href={personalizeHref} className="rounded-full border border-bay px-4 py-3 text-sm font-semibold text-bay">Personalize this template</Link>}
        <Link href={`/designs/${slug}#tiers`} className="rounded-full bg-bay px-4 py-3 text-sm font-semibold text-white">View packages</Link></div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2">Explore
          <select aria-label="Preview page" value={page} onChange={(e) => {
            const next = allowedPage(e.target.value);
            setPage(next);
            setSource(previewHref(next));
            // Internal demo links can navigate away without changing the src prop.
            // An explicit page choice must navigate even if that prop is unchanged.
            setNavigation((value) => value + 1);
            save(next, device);
          }} className="max-w-48 rounded-lg border border-border bg-white px-3 py-2">
            {pages.map(([path, label]) => <option key={path} value={path}>{label}</option>)}
          </select>
        </label>
        <div className="hidden gap-1 rounded-lg bg-white p-1 md:flex" aria-label="Preview width">
          {["desktop", "mobile"].map((mode) => <button key={mode} aria-pressed={device === mode} onClick={() => { setDevice(mode); save(page, mode); }} className={`rounded-md px-3 py-2 capitalize ${device === mode ? "bg-bay text-white" : "hover:bg-sand"}`}>{mode}</button>)}
        </div>
        {languages.length > 1 ? <label className="flex items-center gap-2">Language
          <select aria-label="Preview language" value={language} className="rounded-lg border border-border bg-white px-3 py-2" onChange={(e) => {
            const next = languageOf(e.target.value);
            setLanguage(next);
            save(page, device, next);
            frame.current?.contentWindow?.postMessage({ type: `${eventPrefix}-language`, language: next }, location.origin);
          }}>
            {languages.map((value) => <option key={value} value={value}>{LANGUAGE_LABELS[value]}</option>)}
          </select>
        </label> : <span className="text-muted-foreground">Available language: {LANGUAGE_LABELS[languages[0]]}</span>}
        <a href={previewHref(page)} target="_blank" rel="noopener noreferrer" className="ml-auto underline underline-offset-4">Open full preview<span className="sr-only"> in a new tab</span></a>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Interactive sample. Bookings and messages are not sent. Use sample details when trying forms.</p>
    </header>
    <div className="flex min-h-0 flex-1 justify-center md:p-4">
      <iframe key={navigation} ref={frame} src={source} title={`${title} interactive website preview`} className={`h-full w-full border-0 bg-white md:rounded-lg ${device === "mobile" ? "md:max-w-[390px]" : ""}`} />
    </div>
  </main>;
}
