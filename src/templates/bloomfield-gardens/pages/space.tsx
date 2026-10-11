import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Sprig } from "../components/sprig";
import { photo, spaces } from "../content";
import { href } from "../site";
import { Capacities } from "./spaces";

export function SpacePage({ slug }: { slug: string }) {
  const s = spaces.find((x) => x.slug === slug);
  if (!s) notFound();
  const [hero, ...rest] = s.photos.map(photo);
  const others = spaces.filter((x) => x.slug !== slug);

  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pt-12 sm:px-8">
        <nav aria-label="Breadcrumb" className="text-[15px] text-tpl-muted">
          <Link href={href("/spaces")} className="hover:text-tpl-ink">
            The estate
          </Link>
          {" / "}
          {s.name}
        </nav>
        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <p className="text-tpl-alt">{s.kind}</p>
            <h1 className="mt-1 font-tpl-display text-6xl leading-none font-medium italic sm:text-7xl">{s.name}</h1>
          </div>
          <Capacities space={s} />
        </div>
        <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-[2rem]">
          <Image src={hero.src} alt={hero.alt} fill priority sizes="100vw" className="object-cover" />
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5 text-lg leading-relaxed">
          {s.description.map((d) => (
            <p key={d.slice(0, 16)}>{d}</p>
          ))}
          <Sprig className="w-24 pt-4 text-tpl-alt" />
        </div>
        <div className="rounded-[2rem] bg-tpl-soft p-8">
          <h2 className="font-tpl-display text-3xl italic">Lovely for</h2>
          <ul className="mt-4 space-y-2">
            {s.bestFor.map((b) => (
              <li key={b} className="flex gap-3">
                <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-tpl-alt" />
                {b}
              </li>
            ))}
          </ul>
          <Link href={`${href("/inquire")}?space=${s.slug}`} className="mt-8 inline-block rounded-full bg-tpl-accent px-6 py-3 text-tpl-on-accent">
            Ask about {s.name}
          </Link>
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl gap-4 px-5 sm:grid-cols-2 sm:px-8">
        {rest.map((p) => (
          <div key={p.src} className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
            <Image src={p.src} alt={p.alt} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
          </div>
        ))}
      </div>
      <section aria-labelledby="others" className="mx-auto max-w-7xl px-5 pt-20 sm:px-8">
        <h2 id="others" className="font-tpl-display text-4xl italic">
          Elsewhere on the estate
        </h2>
        <ul className="mt-6 flex flex-wrap gap-3">
          {others.map((o) => (
            <li key={o.slug}>
              <Link href={href(`/spaces/${o.slug}`)} className="inline-block rounded-full px-5 py-2.5 ring-1 ring-tpl-line hover:bg-tpl-soft">
                {o.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
