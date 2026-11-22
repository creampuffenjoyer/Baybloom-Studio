"use client";
import { usePine, LocalLink as Link } from "../language";
import { PlacementImage as Image } from "../components/placement-image";

import { formatMoney } from "../../_kit/dates";
import { Seasonal } from "../components/seasonal";

import { CURRENCY, href } from "../site";

export function HomePage() {
  const { t, menu, photo, posts, rooms } = usePine();
  return (
    <>
      <Seasonal />

      {/* Rooms */}
      <section aria-labelledby="rooms" className="bg-tpl-surface">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="rooms" className="font-tpl-display text-4xl font-bold sm:text-5xl">{t("Rooms and the chalet")}</h2>
            <Link href={href("/rooms")} className="font-bold text-tpl-alt underline underline-offset-4">{t("Compare rooms")}</Link>
          </div>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {rooms.map((r) => {
              const p = photo(r.photos[0]);
              return (
                <li key={r.slug}>
                  <Link href={href(`/rooms/${r.slug}`)} className="group block rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tpl-deep">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-md">
                      <Image placement={`home.room.${r.slug}`} src={p.src} alt={p.alt} unoptimized={p.src.startsWith("blob:") || p.src.startsWith("/api/personalization/")} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
                      <span className="absolute bottom-3 left-3 rounded bg-tpl-deep/90 px-2.5 py-1 text-sm text-tpl-on-deep">{t("Sleeps")}{" "}{r.maxGuests}
                      </span>
                    </div>
                    <h3 className="mt-3 font-tpl-display text-2xl font-bold group-hover:text-tpl-alt">{r.name}</h3>
                    <p className="text-tpl-muted tabular-nums">{t("from")}{" "}{formatMoney(r.price, CURRENCY)}{" "}{t("a night")}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Dining */}
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div className="grid grid-cols-2 gap-3">
          <div className="relative row-span-2 aspect-[3/4] overflow-hidden rounded-md">
            <Image placement={"home.dining"} src={photo("dining").src} alt={photo("dining").alt} unoptimized={photo("dining").src.startsWith("blob:") || photo("dining").src.startsWith("/api/personalization/")} fill sizes="(min-width: 1024px) 30vw, 50vw" className="object-cover" />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-md">
            <Image placement={"home.restaurant"} src={photo("restaurant").src} alt={photo("restaurant").alt} unoptimized={photo("restaurant").src.startsWith("blob:") || photo("restaurant").src.startsWith("/api/personalization/")} fill sizes="25vw" className="object-cover" />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-md">
            <Image placement={"home.lobby"} src={photo("lobby").src} alt={photo("lobby").alt} unoptimized={photo("lobby").src.startsWith("blob:") || photo("lobby").src.startsWith("/api/personalization/")} fill sizes="25vw" className="object-cover" />
          </div>
        </div>
        <div>
          <h2 className="font-tpl-display text-4xl font-bold sm:text-5xl">{t("Supper at the long table")}</h2>
          <p className="mt-4 text-lg text-tpl-muted">{t("Dinner is served at 7, family style, under the old beams. Hearty food from the valley, and a wine list heavy on the Okanagan.")}</p>
          <ul className="mt-6 space-y-3">
            {menu.slice(0, 3).map((m) => (
              <li key={m.name} className="flex items-baseline justify-between gap-4 border-b border-tpl-line pb-3">
                <span>
                  <span className="font-tpl-display text-xl font-bold">{m.name}</span>
                  <span className="block text-tpl-muted">{m.detail}</span>
                </span>
                <span className="shrink-0 font-medium tabular-nums">{m.price}</span>
              </li>
            ))}
          </ul>
          <Link href={href("/dining")} className="mt-6 inline-block font-bold text-tpl-alt underline underline-offset-4">{t("Dining at the lodge")}</Link>
        </div>
      </section>

      {/* Journal */}
      <section aria-labelledby="journal" className="mx-auto max-w-7xl px-5 sm:px-8">
        <h2 id="journal" className="font-tpl-display text-4xl font-bold">{t("From the lodge journal")}</h2>
        <ul className="mt-8 grid gap-8 md:grid-cols-2">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={href(`/journal/${p.slug}`)} className="group grid grid-cols-[96px_minmax(0,1fr)] gap-4 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tpl-deep sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-6">
                <span className="relative aspect-square overflow-hidden rounded-md">
                  <Image placement={`home.post.${p.slug}`} src={photo(p.photo).src} alt="" unoptimized={photo(p.photo).src.startsWith("blob:") || photo(p.photo).src.startsWith("/api/personalization/")} fill sizes="140px" className="object-cover" />
                </span>
                <span>
                  <span className="block font-tpl-display text-xl leading-snug font-bold group-hover:text-tpl-alt sm:text-2xl">{p.title}</span>
                  <span className="mt-1 block text-tpl-muted">{p.dek}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
