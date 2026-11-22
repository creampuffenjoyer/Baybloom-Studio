"use client";
import { usePine, LocalLink as Link } from "../language";

import { PlacementImage as Image } from "./placement-image";




import { type Season } from "../content";
import { href } from "../site";
import { Contours } from "./contours";
import { usePersonalization } from "../personalization";

/**
 * The home page's seasonal hero and "this season" activities. Defaults to the
 * current season once hydrated; guests can flip it with the switch.
 */
export function Seasonal() {
  const { t, activities, photo, seasons, season: browsingSeason, setSeason } = usePine();
  const personalization = usePersonalization();
  const selected = personalization.photoSelection;
  const selectedActivity = activities.find(a => selected === `home.activity.${a.id}`);
  const season = personalization.photoEditing ? selected === "home.hero.summer" ? "summer" : selected === "home.hero.winter" ? "winter" : selectedActivity?.season ?? browsingSeason : browsingSeason;
  const s = seasons[season];

  return (
    <>
      <section className="relative isolate overflow-hidden bg-tpl-deep text-tpl-on-deep">
        {(Object.keys(seasons) as Season[]).map((key) => {
          const p = photo(seasons[key].hero);
          return (
            <Image placement={`home.hero.${key}`}
              key={key}
              src={personalization.heroImage || p.src}
              alt={key === season ? (personalization.heroImage ? "Your selected hero image" : p.alt) : ""}
              unoptimized={!!personalization.heroImage || p.src.startsWith("blob:") || p.src.startsWith("/api/personalization/")}
              fill
              preload={key === season}
              sizes="100vw"
              className={`-z-20 object-cover ${personalization.photoEditing ? "transition-none" : "transition-opacity duration-700 motion-reduce:transition-none"} ${key === season ? "opacity-100" : "opacity-0"}`}
            />
          );
        })}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#10221a]/90 via-[#10221a]/55 to-transparent" />
        <Contours className="absolute inset-y-0 left-0 -z-10 w-2/3 text-white/10" />
        <div className="mx-auto flex min-h-[560px] max-w-7xl flex-col justify-center px-5 py-12 sm:min-h-[620px] sm:px-8 sm:py-20">
          <div role="group" aria-label={t("Season")} className="inline-flex self-start rounded-md border border-white/20 bg-tpl-deep/90 p-1">
            {(Object.keys(seasons) as Season[]).map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={season === key}
                onClick={() => setSeason(key)}
                className={`min-h-10 rounded px-4 py-2 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${season === key ? "bg-tpl-accent text-tpl-on-accent" : "text-tpl-on-deep/85 hover:text-tpl-on-deep"}`}
              >
                {seasons[key].label}
              </button>
            ))}
          </div>
          <h1 key={season} className="mt-6 max-w-2xl font-tpl-display text-5xl leading-[1.05] font-bold text-balance sm:mt-8 sm:text-7xl">
            {personalization.home?.headline || s.headline}
          </h1>
          <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-tpl-on-deep/85 sm:text-xl">{personalization.home?.welcome || s.lede}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`${href("/book")}?season=${season}`} className="rounded-md bg-tpl-accent px-6 py-4 font-semibold text-tpl-on-accent transition-colors hover:bg-tpl-surface hover:text-tpl-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">{t("Plan a sample stay")}</Link>
            <Link href={`${href("/activities")}?season=${season}`} className="rounded-md px-6 py-4 font-medium ring-1 ring-white/40 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
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
                    <Image placement={`home.activity.${a.id}`} src={p.src} alt={p.alt} unoptimized={p.src.startsWith("blob:") || p.src.startsWith("/api/personalization/")} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
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
