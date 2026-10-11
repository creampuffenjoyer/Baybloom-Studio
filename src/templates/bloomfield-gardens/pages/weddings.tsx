import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "../../_kit/dates";
import { packages, photo } from "../content";
import { href } from "../site";

export function WeddingsPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pt-14 pb-12 text-center sm:px-8">
        <h1 className="font-t-display text-6xl font-medium italic sm:text-7xl">Weddings at Bloomfield</h1>
        <p className="mx-auto mt-5 max-w-[56ch] text-lg text-t-muted">
          Three starting points, every one shaped around you by your own coordinator. Prices include VAT,
          our kitchen and our team.
        </p>
      </section>
      <div className="mx-auto grid max-w-7xl gap-6 px-5 sm:px-8 lg:grid-cols-3">
        {packages.map((p) => (
          <article
            key={p.name}
            className={`flex flex-col rounded-[2rem] p-8 ${p.featured ? "bg-t-deep text-t-on-deep" : "bg-t-surface ring-1 ring-t-line"}`}
          >
            {p.featured && <p className="mb-3 self-start rounded-full bg-t-alt px-3 py-1 text-sm text-white">Most chosen</p>}
            <h2 className="font-t-display text-5xl italic">{p.name}</h2>
            <p className={p.featured ? "mt-1 text-t-on-deep/70" : "mt-1 text-t-muted"}>{p.guests}</p>
            <p className="mt-5 text-lg">{p.blurb}</p>
            <ul className="mt-6 flex-1 space-y-2.5">
              {p.includes.map((it) => (
                <li key={it} className="flex gap-3">
                  <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-t-alt" />
                  {it}
                </li>
              ))}
            </ul>
            <p className="mt-8 font-t-display text-4xl">from {formatMoney(p.price)}</p>
            <Link
              href={`${href("/inquire")}?package=${encodeURIComponent(p.name)}`}
              className={`mt-6 rounded-full px-6 py-3 text-center ${p.featured ? "bg-t-on-deep text-t-deep" : "bg-t-accent text-t-on-accent"}`}
            >
              Inquire about {p.name}
            </Link>
          </article>
        ))}
      </div>
      <section className="mx-auto mt-24 grid max-w-7xl items-center gap-10 px-5 sm:px-8 md:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
          <Image src={photo("tent-night").src} alt={photo("tent-night").alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div>
          <h2 className="font-t-display text-5xl font-medium italic">Stay the night</h2>
          <p className="mt-4 max-w-[46ch] text-lg leading-relaxed text-t-muted">
            Twelve bell tents in the walled garden sleep 24 guests, with proper beds, lanterns and a
            breakfast hamper at the door in the morning. Included with the Whole estate package, or
            from ₱6,500 a tent.
          </p>
        </div>
      </section>
    </>
  );
}
