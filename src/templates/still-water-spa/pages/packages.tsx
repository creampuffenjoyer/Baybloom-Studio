import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "../../_kit/dates";
import { memberships, packages, photo } from "../content";
import { href, pebbles } from "../site";

export function PackagesPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pt-12 pb-8 sm:px-8">
        <h1 className="font-tpl-display text-6xl sm:text-7xl">Packages and memberships</h1>
        <p className="mt-5 max-w-[56ch] text-lg text-tpl-muted">
          Longer visits that combine treatments with time in the bathhouse, and memberships for people who
          make rest a habit.
        </p>
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-5 py-12 sm:px-8">
        {packages.map((p, i) => {
          const img = photo(p.photo);
          return (
            <article key={p.name} className="grid items-center gap-10 md:grid-cols-2">
              <div className={`relative aspect-[5/4] overflow-hidden ${pebbles[i % 3]} ${i % 2 ? "md:order-2" : ""}`}>
                <Image src={img.src} alt={img.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
              </div>
              <div>
                <h2 className="font-tpl-display text-4xl sm:text-5xl">{p.name}</h2>
                <p className="mt-2 text-lg text-tpl-muted">
                  About {Math.round(p.minutes / 30) / 2} hours · {formatMoney(p.price)}
                </p>
                <ul className="mt-6 space-y-2.5">
                  {p.items.map((it) => (
                    <li key={it} className="flex gap-3">
                      <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-tpl-accent" />
                      {it}
                    </li>
                  ))}
                </ul>
                <Link href={href("/visit")} className="mt-8 inline-block rounded-full bg-tpl-accent px-6 py-3 font-semibold text-tpl-on-accent">
                  Ask about this package
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      <section aria-labelledby="members" className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="rounded-[3rem] bg-tpl-soft p-8 sm:p-14">
          <h2 id="members" className="font-tpl-display text-4xl sm:text-5xl">
            Memberships
          </h2>
          <p className="mt-3 max-w-[52ch] text-lg text-tpl-muted">Month to month. Pause or cancel any time with 30 days’ notice.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {memberships.map((m, i) => (
              <div key={m.name} className={`rounded-[2rem] p-8 ${i === 1 ? "bg-tpl-deep text-tpl-on-deep" : "bg-tpl-surface"}`}>
                <h3 className="font-tpl-display text-3xl">{m.name}</h3>
                <p className="mt-2">
                  <span className="font-tpl-display text-4xl">{formatMoney(m.price)}</span>
                  <span className={i === 1 ? "text-tpl-on-deep/70" : "text-tpl-muted"}> a {m.per}</span>
                </p>
                <ul className="mt-6 space-y-2.5">
                  {m.perks.map((perk) => (
                    <li key={perk} className="flex gap-3">
                      <span aria-hidden className={`mt-2.5 size-1.5 shrink-0 rounded-full ${i === 1 ? "bg-tpl-on-deep" : "bg-tpl-accent"}`} />
                      {perk}
                    </li>
                  ))}
                </ul>
                <Link
                  href={href("/visit")}
                  className={`mt-8 inline-block rounded-full px-6 py-3 font-semibold ${
                    i === 1 ? "bg-tpl-on-deep text-tpl-deep" : "bg-tpl-accent text-tpl-on-accent"
                  }`}
                >
                  Become a member
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
