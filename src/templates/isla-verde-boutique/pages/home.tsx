import Image from "next/image";
import Link from "next/link";
import { formatDay, formatMoney } from "../../_kit/dates";
import { menuHighlights, photo, posts, rooms } from "../content";
import { arch, href } from "../site";

export function HomePage() {
  const courtyard = photo("courtyard");
  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-7xl gap-12 px-5 pt-14 pb-20 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:items-end">
        <div className="lg:pb-10">
          <h1 className="font-t-display text-6xl leading-[0.98] italic sm:text-8xl">A house with a long memory.</h1>
          <p className="mt-8 max-w-[46ch] text-lg leading-relaxed text-t-muted">
            Twelve rooms in an 1887 bahay na bato on Calle Crisologo, the cobbled heart of old Vigan.
            Capiz windows, narra floors and breakfast under the acacia in the courtyard.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-6">
            <Link href={href("/book")} className="bg-t-accent px-6 py-3.5 text-t-on-accent hover:bg-t-alt">
              Book your stay
            </Link>
            <Link href={href("/rooms")} className="border-b border-t-ink pb-0.5 hover:border-t-alt hover:text-t-alt">
              See the rooms
            </Link>
          </div>
        </div>
        <div className={`relative aspect-[3/4] overflow-hidden ${arch}`}>
          <Image src={courtyard.src} alt={courtyard.alt} fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
        </div>
      </section>

      {/* Story teaser */}
      <section className="border-y border-t-line">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 md:grid-cols-[auto_1fr] md:gap-20">
          <p className="font-t-display text-8xl leading-none text-t-alt italic sm:text-9xl">1887</p>
          <div>
            <p className="max-w-[58ch] font-t-display text-2xl leading-snug sm:text-3xl">
              Built by a tobacco merchant for his eleven children, the house survived two wars, a typhoon and a
              decade as a school before we brought it back in 2019.
            </p>
            <Link href={href("/story")} className="mt-6 inline-block border-b border-t-ink pb-0.5 hover:border-t-alt hover:text-t-alt">
              Read the story of the house
            </Link>
          </div>
        </div>
      </section>

      {/* Rooms */}
      <section aria-labelledby="rooms" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="rooms" className="font-t-display text-5xl italic sm:text-6xl">
            Rooms and suites
          </h2>
          <Link href={href("/rooms")} className="border-b border-t-ink pb-0.5">
            All rooms
          </Link>
        </div>
        <ul className="mt-14 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {rooms.map((r) => {
            const p = photo(r.photos[0]);
            return (
              <li key={r.slug}>
                <Link href={href(`/rooms/${r.slug}`)} className="group block">
                  <div className={`relative aspect-[3/4] overflow-hidden ${arch}`}>
                    <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                  </div>
                  <h3 className="mt-5 font-t-display text-2xl italic group-hover:text-t-alt">{r.name}</h3>
                  <p className="mt-1 text-t-muted">From {formatMoney(r.price)} a night</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Dining */}
      <section className="bg-t-soft">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image src={photo("restaurant").src} alt={photo("restaurant").alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className="font-t-display text-5xl italic">Comedor</h2>
            <p className="mt-4 max-w-[46ch] text-lg text-t-muted">
              Ilocano home cooking, the way the family’s cook made it, in the old dining room. Open to guests
              and visitors for lunch and dinner.
            </p>
            <ul className="mt-8 divide-y divide-t-line border-y border-t-line">
              {menuHighlights.slice(0, 4).map((m) => (
                <li key={m.name} className="py-3">
                  <span className="font-t-display text-xl italic">{m.name}</span>
                  <span className="block text-[15px] text-t-muted">{m.detail}</span>
                </li>
              ))}
            </ul>
            <Link href={href("/dining")} className="mt-8 inline-block bg-t-accent px-6 py-3.5 text-t-on-accent hover:bg-t-alt">
              Reserve a table
            </Link>
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="relative isolate overflow-hidden text-white">
        <Image src={photo("garden-night").src} alt="" fill sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-black/55" />
        <div className="mx-auto max-w-7xl px-5 py-32 text-center sm:px-8">
          <h2 className="mx-auto max-w-3xl font-t-display text-5xl leading-tight italic sm:text-6xl">
            Weddings under the acacia
          </h2>
          <p className="mx-auto mt-5 max-w-[50ch] text-lg text-white/85">
            The courtyard seats 120 for dinner beneath strings of light. Take the whole house for the weekend.
          </p>
          <Link href={href("/events")} className="mt-8 inline-block border border-white px-6 py-3.5 hover:bg-white hover:text-t-ink">
            Plan an event
          </Link>
        </div>
      </section>

      {/* Journal */}
      <section aria-labelledby="journal" className="mx-auto max-w-7xl px-5 pt-24 sm:px-8">
        <h2 id="journal" className="font-t-display text-5xl italic">
          From the journal
        </h2>
        <ul className="mt-10 grid gap-10 md:grid-cols-3">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={href(`/journal/${p.slug}`)} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={photo(p.photo).src} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                </div>
                <p className="mt-4 text-sm text-t-muted">{formatDay(p.date, { day: "numeric", month: "long", year: "numeric" })}</p>
                <h3 className="mt-1 font-t-display text-2xl italic group-hover:text-t-alt">{p.title}</h3>
                <p className="mt-2 text-t-muted">{p.dek}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
