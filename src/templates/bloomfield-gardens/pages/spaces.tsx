import Image from "next/image";
import Link from "next/link";
import { photo, spaces } from "../content";
import { href } from "../site";

export function SpacesPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pt-14 pb-10 text-center sm:px-8">
        <h1 className="font-t-display text-6xl font-medium italic sm:text-7xl">The estate</h1>
        <p className="mx-auto mt-5 max-w-[56ch] text-lg text-t-muted">
          Five spaces across twelve acres. Most couples use two or three: one for vows, one for dinner and
          one for dancing.
        </p>
      </section>
      <div className="mx-auto max-w-7xl space-y-24 px-5 py-12 sm:px-8">
        {spaces.map((s, i) => {
          const [a, b] = s.photos.map(photo);
          return (
            <article key={s.slug} className="grid items-center gap-10 lg:grid-cols-2">
              <div className={`grid grid-cols-[1.5fr_1fr] items-end gap-3 ${i % 2 ? "lg:order-2" : ""}`}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]">
                  <Image src={a.src} alt={a.alt} fill sizes="(min-width: 1024px) 30vw, 60vw" className="object-cover" />
                </div>
                <div className="relative aspect-[3/4] overflow-hidden rounded-[1.5rem]">
                  <Image src={b.src} alt={b.alt} fill sizes="(min-width: 1024px) 20vw, 40vw" className="object-cover" />
                </div>
              </div>
              <div>
                <p className="text-t-alt">{s.kind}</p>
                <h2 className="mt-1 font-t-display text-5xl font-medium italic">{s.name}</h2>
                <p className="mt-4 max-w-[48ch] text-lg leading-relaxed text-t-muted">{s.short}</p>
                <Capacities space={s} />
                <Link
                  href={href(`/spaces/${s.slug}`)}
                  className="mt-8 inline-block rounded-full px-6 py-3 ring-1 ring-t-ink/25 hover:ring-t-ink/60"
                >
                  See {s.name}
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

export function Capacities({ space }: { space: (typeof spaces)[number] }) {
  const rows = [
    ["Ceremony", space.ceremony],
    ["Seated dinner", space.dinner],
    ["Standing", space.standing],
  ].filter(([, v]) => v) as [string, number][];
  return (
    <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
      {rows.map(([k, v]) => (
        <div key={k} className="flex flex-col-reverse">
          <dt className="text-sm text-t-muted">{k}</dt>
          <dd className="font-t-display text-4xl">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
