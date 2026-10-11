import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "../../_kit/dates";
import { Seasonal } from "../components/seasonal";
import { menu, photo, posts, rooms } from "../content";
import { CURRENCY, href } from "../site";

export function HomePage() {
  return (
    <>
      <Seasonal />

      {/* Rooms */}
      <section aria-labelledby="rooms" className="bg-tpl-surface">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="rooms" className="font-tpl-display text-4xl font-bold sm:text-5xl">
              Rooms and the chalet
            </h2>
            <Link href={href("/rooms")} className="font-bold text-tpl-alt underline underline-offset-4">
              Compare rooms
            </Link>
          </div>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {rooms.map((r) => {
              const p = photo(r.photos[0]);
              return (
                <li key={r.slug}>
                  <Link href={href(`/rooms/${r.slug}`)} className="group block">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-md">
                      <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      <span className="absolute bottom-3 left-3 rounded bg-tpl-deep/90 px-2.5 py-1 text-sm text-tpl-on-deep">
                        Sleeps {r.maxGuests}
                      </span>
                    </div>
                    <h3 className="mt-3 font-tpl-display text-2xl font-bold group-hover:text-tpl-alt">{r.name}</h3>
                    <p className="text-tpl-muted">from {formatMoney(r.price, CURRENCY)} a night</p>
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
            <Image src={photo("dining").src} alt={photo("dining").alt} fill sizes="(min-width: 1024px) 30vw, 50vw" className="object-cover" />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-md">
            <Image src={photo("restaurant").src} alt={photo("restaurant").alt} fill sizes="25vw" className="object-cover" />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-md">
            <Image src={photo("lobby").src} alt={photo("lobby").alt} fill sizes="25vw" className="object-cover" />
          </div>
        </div>
        <div>
          <h2 className="font-tpl-display text-4xl font-bold sm:text-5xl">Supper at the long table</h2>
          <p className="mt-4 text-lg text-tpl-muted">
            Dinner is served at 7, family style, under the old beams. Hearty food from the valley, and a
            wine list heavy on the Okanagan.
          </p>
          <ul className="mt-6 space-y-3">
            {menu.slice(0, 3).map((m) => (
              <li key={m.name} className="flex items-baseline justify-between gap-4 border-b border-tpl-line pb-3">
                <span>
                  <span className="font-tpl-display text-xl font-bold">{m.name}</span>
                  <span className="block text-tpl-muted">{m.detail}</span>
                </span>
                <span className="font-medium">{m.price}</span>
              </li>
            ))}
          </ul>
          <Link href={href("/dining")} className="mt-6 inline-block font-bold text-tpl-alt underline underline-offset-4">
            Dining at the lodge
          </Link>
        </div>
      </section>

      {/* Journal */}
      <section aria-labelledby="journal" className="mx-auto max-w-7xl px-5 sm:px-8">
        <h2 id="journal" className="font-tpl-display text-4xl font-bold">
          From the lodge journal
        </h2>
        <ul className="mt-8 grid gap-8 md:grid-cols-2">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={href(`/journal/${p.slug}`)} className="group grid grid-cols-[140px_1fr] gap-5">
                <span className="relative aspect-square overflow-hidden rounded-md">
                  <Image src={photo(p.photo).src} alt="" fill sizes="140px" className="object-cover" />
                </span>
                <span>
                  <span className="block font-tpl-display text-2xl font-bold group-hover:text-tpl-alt">{p.title}</span>
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
