"use client";
import { usePine, LocalLink as Link } from "../language";

import Image from "next/image";




import { type Season } from "../content";
import { href } from "../site";
import { Contours } from "./contours";

/**
 * The home page's seasonal hero and "this season" activities. Defaults to the
 * current season once hydrated; guests can flip it with the switch.
 */
export function Seasonal() {
  const { t, activities, photo, seasons, season, setSeason } = usePine();
  const s = seasons[season];

  return (
    <>
      <section className="relative isolate overflow-hidden bg-tpl-deep text-tpl-on-deep">
        {(Object.keys(seasons) as Season[]).map((key) => {
          const p = photo(seasons[key].hero);
          return (
            <Image
              key={key}
              src={p.src}
              alt={key === season ? p.alt : ""}
              fill
              priority
              sizes="100vw"
              className={`-z-20 object-cover transition-opacity duration-700 motion-reduce:transition-none ${key === season ? "opacity-100" : "opacity-0"}`}
            />
          );
        })}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#10221a]/90 via-[#10221a]/55 to-transparent" />
        <Contours className="absolute inset-y-0 left-0 -z-10 w-2/3 text-white/10" />
        <div className="mx-auto flex min-h-[560px] max-w-7xl flex-col justify-center px-5 py-12 sm:min-h-[620px] sm:px-8 sm:py-20">
          <div role="group" aria-label={t("Season")} className="inline-flex self-start rounded-md bg-black/30 p-1 backdrop-blur">
            {(Object.keys(seasons) as Season[]).map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={season === key}
                onClick={() => setSeason(key)}
                className={`rounded px-4 py-1.5 font-medium transition-colors ${season === key ? "bg-tpl-accent text-tpl-on-accent" : "text-tpl-on-deep/85 hover:text-tpl-on-deep"}`}
              >
                {seasons[key].label}
              </button>
            ))}
          </div>
          <h1 key={season} className="mt-6 max-w-2xl font-tpl-display text-5xl leading-[1] font-bold animate-in fade-in slide-in-from-bottom-3 duration-500 motion-reduce:animate-none sm:mt-8 sm:text-7xl">
            {s.headline}
          </h1>
          <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-tpl-on-deep/85 sm:text-xl">{s.lede}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href={`${href("/activities")}?season=${season}`} className="rounded-md bg-tpl-accent px-6 py-3.5 font-bold text-tpl-on-accent">{t("Plan a sample stay")}</Link>
            <Link href={`${href("/activities")}?season=${season}`} className="rounded-md px-6 py-3.5 font-bold ring-1 ring-white/40 hover:bg-white/10">
              {t("Explore this season")}
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="season-acts" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="season-acts" className="font-tpl-display text-4xl font-bold sm:text-5xl">
            {t("This season at the lodge")}
          </h2>
          <p className="text-tpl-muted">{t("Season:")}{" "}{s.months}</p>
        </div>
        <ul className="mt-10 grid gap-8 md:grid-cols-3">
          {activities
            .filter((a) => a.season === season)
            .slice(0, 3)
            .map((a) => {
              const p = photo(a.photo);
              return (
                <li key={a.name}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-md">
                    <Image src={p.src} alt={p.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                  </div>
                  <h3 className="mt-4 font-tpl-display text-2xl font-bold">{a.name}</h3>
                  <p className="mt-1 text-tpl-muted">{a.detail}</p>
                  <p className="mt-2 text-sm font-medium text-tpl-alt">
                    {a.level} · {a.duration}
                  </p>
                </li>
              );
            })}
        </ul>
      </section>
    </>
  );
}
