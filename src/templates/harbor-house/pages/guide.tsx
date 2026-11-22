"use client";

import { useHarbor } from "../language";

import { PlacementImage as Image } from "../components/placement-image";
import { usePersonalization } from "../personalization";


export function GuidePage() {
  const { t, photo, places } = useHarbor();
  const { guide } = usePersonalization();
  const kinds = [...new Set(places.map((p) => p.kind))];
  return (
    <div className="mx-auto max-w-6xl px-5 pt-10 sm:px-8">
      <h1 className="font-tpl-display text-5xl sm:text-6xl">{guide?.heading || t("Around Basco")}</h1>
      <p className="mt-4 max-w-[56ch] text-lg text-tpl-muted">
        {guide?.intro || t("Batanes is small, safe and best seen slowly. Tricycles wait outside the house, and we lend bicycles and umbrellas for free.")}</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-[2fr_1fr]">
        <div className="relative aspect-[16/10] overflow-hidden rounded-3xl">
          <Image placement="guide.headland" src={photo("headland").src} unoptimized={(photo("headland").src).startsWith("blob:") || (photo("headland").src).startsWith("/api/personalization/")} alt={photo("headland").alt} fill priority sizes="(min-width: 640px) 66vw, 100vw" className="object-cover" />
        </div>
        <div className="grid gap-4">
          {(["cliff-walk", "beach"] as const).map((k) => (
            <div key={k} className="relative aspect-[4/3] overflow-hidden sm:aspect-auto rounded-3xl">
              <Image placement={`guide.${k}`} src={photo(k).src} unoptimized={(photo(k).src).startsWith("blob:") || (photo(k).src).startsWith("/api/personalization/")} alt={photo(k).alt} fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover" />
            </div>
          ))}
        </div>
      </div>
      {kinds.map((kind) => (
        <section key={kind} aria-labelledby={`k-${kind}`} className="mt-14">
          <h2 id={`k-${kind}`} className="font-tpl-display text-3xl">
            {kind === "Walk" ? t("Walks") : kind === "Cycle" ? t("By bike") : kind === "Beach" ? t("Beaches") : kind === "Café" ? t("Coffee") : t("Dinner")}
          </h2>
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {places
              .filter((p) => p.kind === kind)
              .map((p) => (
                <li key={p.id} className="rounded-2xl bg-tpl-surface p-6 ring-1 ring-tpl-line">
                  <p className="flex items-baseline justify-between gap-4">
                    <span className="font-tpl-display text-xl">{p.name}</span>
                    <span className="shrink-0 text-sm font-semibold text-tpl-accent">{p.distance}</span>
                  </p>
                  <p className="mt-2 text-tpl-muted">{p.note}</p>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
