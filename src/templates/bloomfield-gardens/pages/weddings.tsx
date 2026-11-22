"use client";
import { useBloomCopy } from "../copy";
import { useBloomfield } from "../language";

import { PlacementImage as Image } from "../components/placement-image";
import { LocalLink as Link } from "../language";
import { formatMoney } from "../../_kit/dates";

import { href } from "../site";

export function WeddingsPage() {
  const copy = useBloomCopy();
  const { packages, photo } = useBloomfield();
  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pt-14 pb-12 text-center sm:px-8">
        <h1 className="font-tpl-display text-6xl font-medium italic sm:text-7xl">{copy("Weddings at Bloomfield")}</h1>
        <p className="mx-auto mt-5 max-w-[56ch] text-lg text-tpl-muted">{copy("Three starting points, every one shaped around you by your own coordinator. Prices include VAT, our kitchen and our team.")}</p>
      </section>
      <div className="mx-auto grid max-w-7xl gap-6 px-5 sm:px-8 lg:grid-cols-3">
        {packages.map((p) => (
          <article
            key={p.name}
            className={`flex flex-col rounded-[2rem] p-8 ${p.featured ? "bg-tpl-deep text-tpl-on-deep" : "bg-tpl-surface ring-1 ring-tpl-line"}`}
          >
            {p.featured && <p className="mb-3 self-start rounded-full bg-tpl-alt px-3 py-1 text-sm text-white">{copy("Most chosen")}</p>}
            <h2 className="font-tpl-display text-5xl italic">{p.name}</h2>
            <p className={p.featured ? "mt-1 text-tpl-on-deep/70" : "mt-1 text-tpl-muted"}>{p.guests}</p>
            <p className="mt-5 text-lg">{p.blurb}</p>
            <ul className="mt-6 flex-1 space-y-2.5">
              {p.includes.map((it) => (
                <li key={it} className="flex gap-3">
                  <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-tpl-alt" />
                  {it}
                </li>
              ))}
            </ul>
            <p className="mt-8 font-tpl-display text-4xl">{copy("from")} {formatMoney(p.price)}</p>
            <Link
              href={`${href("/inquire")}?package=${encodeURIComponent(p.name)}`}
              className={`mt-6 rounded-full px-6 py-3 text-center ${p.featured ? "bg-tpl-on-deep text-tpl-deep" : "bg-tpl-accent text-tpl-on-accent"}`}
            >{copy("Inquire about")} {p.name}
            </Link>
          </article>
        ))}
      </div>
      <section className="mx-auto mt-24 grid max-w-7xl items-center gap-10 px-5 sm:px-8 md:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
          <Image placement={"weddings.tent"} src={photo("tent-night").src} unoptimized={photo("tent-night").src.startsWith("blob:") || photo("tent-night").src.startsWith("/api/personalization/")} alt={photo("tent-night").alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div>
          <h2 className="font-tpl-display text-5xl font-medium italic">{copy("Stay the night")}</h2>
          <p className="mt-4 max-w-[46ch] text-lg leading-relaxed text-tpl-muted">{copy("Twelve bell tents in the walled garden sleep 24 guests, with proper beds, lanterns and a breakfast hamper at the door in the morning. Included with the Whole estate package, or from ₱6,500 a tent.")}</p>
        </div>
      </section>
    </>
  );
}
