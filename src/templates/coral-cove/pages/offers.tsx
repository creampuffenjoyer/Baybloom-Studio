import Image from "next/image";
import Link from "next/link";
import { PageIntro } from "../components/page-intro";
import { offers, photo } from "../content";
import { href } from "../site";

export function OffersPage() {
  return (
    <>
      <PageIntro
        title="Offers and packages"
        lede="Book direct for our best rates, free speedboat transfers on stays of four nights or more, and the offers below."
      />
      <div className="mx-auto max-w-7xl space-y-10 px-5 py-20 sm:px-8">
        {offers.map((o, i) => {
          const p = photo(o.photo);
          return (
            <article
              key={o.slug}
              id={o.slug}
              className={`grid scroll-mt-28 overflow-hidden rounded-[2rem] md:grid-cols-[1fr_1.1fr] ${
                i === 0 ? "bg-t-accent text-white" : "bg-t-soft"
              }`}
            >
              <div className="relative min-h-[280px]">
                <Image src={p.src} alt={p.alt} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
              </div>
              <div className="p-8 sm:p-12">
                <p className={`font-semibold ${i === 0 ? "text-white/85" : "text-t-accent"}`}>{o.name}</p>
                <h2 className="mt-2 font-t-display text-4xl leading-[1.02] font-bold tracking-[-0.035em]">{o.headline}</h2>
                <p className={`mt-4 text-lg leading-relaxed ${i === 0 ? "text-white/90" : "text-t-muted"}`}>{o.body}</p>
                <ul className="mt-6 space-y-2">
                  {o.includes.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span aria-hidden className={`mt-2.5 size-1.5 shrink-0 rounded-full ${i === 0 ? "bg-white" : "bg-t-accent"}`} />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className={`mt-6 text-sm ${i === 0 ? "text-white/75" : "text-t-muted"}`}>{o.terms}</p>
                <Link
                  href={`${href("/book")}?offer=${o.slug}`}
                  className={`mt-8 inline-block rounded-full px-6 py-3 font-semibold ${
                    i === 0 ? "bg-white text-t-accent" : "bg-t-ink text-white"
                  }`}
                >
                  Book this offer
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
