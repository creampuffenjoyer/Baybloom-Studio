"use client";

import { useHarbor } from "../language";

import { PlacementImage as Image } from "../components/placement-image";
import { usePersonalization } from "../personalization";


export function BreakfastPage() {
  const { t, breakfast, photo } = useHarbor();
  const { breakfast: custom } = usePersonalization();
  return (
    <div className="mx-auto max-w-6xl px-5 pt-10 sm:px-8">
      <h1 className="font-tpl-display text-5xl sm:text-6xl">{custom?.heading || t("Breakfast")}</h1>
      <p className="mt-4 max-w-[56ch] text-lg text-tpl-muted">
        {custom?.intro || t("7 to 10 every morning at the big table by the window. Mila cooks, Joel pours the coffee and tells you where to go today.")}</p>
      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {(["breakfast", "tray", "pastries"] as const).map((k, i) => (
          <div key={k} className={`relative aspect-square overflow-hidden rounded-3xl ${i === 1 ? "sm:translate-y-8" : ""}`}>
            <Image placement={`breakfast.${k}`} src={photo(k).src} unoptimized={(photo(k).src).startsWith("blob:") || (photo(k).src).startsWith("/api/personalization/")} alt={photo(k).alt} fill priority={i === 0} sizes="(min-width: 640px) 33vw, 100vw" className="object-cover" />
          </div>
        ))}
      </div>
      <div className="mt-20 grid gap-8 md:grid-cols-2">
        {breakfast.map((section, i) => (
          <section key={section.title} className={`rounded-3xl p-8 ${i === 0 ? "bg-tpl-soft" : "bg-tpl-surface ring-1 ring-tpl-line"}`}>
            <h2 className="font-tpl-display text-3xl">{section.title}</h2>
            <ul className="mt-5 space-y-3">
              {section.items.map((it, index) => (
                <li key={index} className="flex gap-3">
                  <span aria-hidden className="mt-2 size-2 shrink-0 rounded-full bg-tpl-accent" />
                  {it}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p className="mt-10 font-[family-name:var(--hh-hand)] text-3xl text-tpl-accent">{custom?.takeaway || t("Early boat or flight? We’ll pack you breakfast to go.")}</p>
    </div>
  );
}
