import Image from "next/image";
import Link from "next/link";
import { Postcard } from "../components/postcard";
import { breakfast, guestbook, photo, places, rooms } from "../content";
import { href, site } from "../site";

const TILTS = [-1.5, 1, 1.5, -1];

export function HomePage() {
  const cove = photo("cove");
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pt-8 sm:px-8">
        <h1 className="max-w-3xl font-tpl-display text-5xl leading-[1.08] sm:text-6xl lg:text-7xl">
          A room by the harbour, and breakfast like home.
        </h1>
        <div className="relative mt-10">
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl sm:aspect-[21/10]">
            <Image src={cove.src} alt={cove.alt} fill priority sizes="(min-width: 1152px) 1088px, 100vw" className="object-cover" />
          </div>
          <div className="relative -mt-16 ml-4 max-w-sm -rotate-2 bg-tpl-soft p-6 shadow-xl sm:absolute sm:-bottom-10 sm:left-8 sm:mt-0 sm:ml-0">
            <p className="font-[family-name:var(--hh-hand)] text-[1.7rem] leading-snug">
              Welcome! Four rooms, one big breakfast table and the whole of Batanes on the doorstep. We can’t wait to have you.
            </p>
            <p className="mt-3 text-right font-[family-name:var(--hh-hand)] text-2xl text-tpl-accent">— {site.hosts}</p>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-4 sm:mt-20 sm:justify-end">
          <Link href={href("/book")} className="rounded-full bg-tpl-accent px-6 py-3 font-bold text-tpl-on-accent">
            Check dates
          </Link>
          <Link href={href("/rooms")} className="font-semibold underline decoration-tpl-alt decoration-2 underline-offset-8">
            See the rooms
          </Link>
        </div>
      </section>

      {/* Rooms */}
      <section aria-labelledby="rooms" className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <h2 id="rooms" className="font-tpl-display text-4xl sm:text-5xl">
          Four rooms, all different
        </h2>
        <p className="mt-3 max-w-[52ch] text-lg text-tpl-muted">Breakfast, wifi and a warm welcome included. Free cancellation up to five days before.</p>
        <div className="mt-12 grid gap-10 md:grid-cols-2">
          {rooms.map((r, i) => (
            <Postcard key={r.slug} room={r} tilt={TILTS[i]} />
          ))}
        </div>
      </section>

      {/* Breakfast */}
      <section className="bg-tpl-soft">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 md:grid-cols-2 md:items-center">
          <div className="relative aspect-square overflow-hidden rounded-3xl">
            <Image src={photo("breakfast").src} alt={photo("breakfast").alt} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className="font-tpl-display text-4xl sm:text-5xl">Breakfast is the main event</h2>
            <p className="mt-4 text-lg text-tpl-ink/80">Served from 7 to 10 at the big table, or in bed if you ask nicely.</p>
            <ul className="mt-6 space-y-3">
              {breakfast[0].items.map((i) => (
                <li key={i} className="flex gap-3">
                  <span aria-hidden className="mt-2 size-2 shrink-0 rounded-full bg-tpl-accent" />
                  {i}
                </li>
              ))}
            </ul>
            <Link href={href("/breakfast")} className="mt-8 inline-block font-semibold underline decoration-2 underline-offset-8">
              The whole breakfast menu
            </Link>
          </div>
        </div>
      </section>

      {/* Around */}
      <section aria-labelledby="around" className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 id="around" className="font-tpl-display text-4xl sm:text-5xl">
              Right outside the door
            </h2>
            <p className="mt-4 text-lg text-tpl-muted">
              Joel keeps a hand-drawn map at the front desk. Here are the places guests love most.
            </p>
            <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-3xl">
              <Image src={photo("lighthouse").src} alt={photo("lighthouse").alt} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
            </div>
          </div>
          <ul className="divide-y divide-tpl-line self-center border-y border-tpl-line">
            {places.slice(0, 5).map((p) => (
              <li key={p.name} className="grid grid-cols-[1fr_auto] gap-4 py-5">
                <div>
                  <p className="font-tpl-display text-xl">{p.name}</p>
                  <p className="text-tpl-muted">{p.note}</p>
                </div>
                <p className="text-right text-sm font-semibold text-tpl-accent">{p.distance}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Guestbook */}
      <section aria-labelledby="gb" className="mx-auto max-w-6xl px-5 sm:px-8">
        <h2 id="gb" className="font-tpl-display text-4xl">
          From the guestbook
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {guestbook.slice(0, 2).map((g, i) => (
            <figure key={g.who} className={`bg-tpl-surface p-7 ring-1 ring-tpl-line ${i ? "md:mt-10 md:rotate-1" : "md:-rotate-1"}`}>
              <blockquote className="font-[family-name:var(--hh-hand)] text-[1.7rem] leading-snug">{g.text}</blockquote>
              <figcaption className="mt-3 text-sm text-tpl-muted">
                {g.who}, {g.from}, {g.month}
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-8">
          <Link href={href("/guestbook")} className="font-semibold underline decoration-tpl-alt decoration-2 underline-offset-8">
            Read the guestbook
          </Link>
        </p>
      </section>
    </>
  );
}
