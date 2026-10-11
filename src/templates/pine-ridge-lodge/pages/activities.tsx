import Image from "next/image";
import { activities, photo, seasons, type Season } from "../content";

export function ActivitiesPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 pt-14 sm:px-8">
      <h1 className="font-tpl-display text-5xl font-bold sm:text-6xl">Activities</h1>
      <p className="mt-4 max-w-[56ch] text-lg text-tpl-muted">
        The front desk books guides, passes and rentals. Most things leave from the boot room door.
      </p>
      <nav aria-label="Seasons" className="mt-8 flex gap-3">
        {(Object.keys(seasons) as Season[]).map((s) => (
          <a key={s} href={`#${s}`} className="rounded-md bg-tpl-surface px-4 py-2 font-medium ring-1 ring-tpl-line hover:bg-tpl-soft">
            {seasons[s].label}, {seasons[s].months}
          </a>
        ))}
      </nav>
      {(Object.keys(seasons) as Season[]).map((s) => (
        <section key={s} id={s} aria-labelledby={`h-${s}`} className="scroll-mt-8 pt-16">
          <h2 id={`h-${s}`} className="border-b border-tpl-line pb-4 font-tpl-display text-4xl font-bold">
            {seasons[s].label}
          </h2>
          <ul className="divide-y divide-tpl-line">
            {activities
              .filter((a) => a.season === s)
              .map((a) => {
                const p = photo(a.photo);
                return (
                  <li key={a.name} className="grid gap-6 py-8 md:grid-cols-[320px_1fr]">
                    <div className="relative aspect-[3/2] overflow-hidden rounded-md">
                      <Image src={p.src} alt={p.alt} fill sizes="320px" className="object-cover" />
                    </div>
                    <div>
                      <h3 className="font-tpl-display text-3xl font-bold">{a.name}</h3>
                      <p className="mt-2 max-w-[60ch] text-lg text-tpl-muted">{a.detail}</p>
                      <dl className="mt-4 flex gap-8">
                        <div>
                          <dt className="text-sm text-tpl-muted">Level</dt>
                          <dd className="font-bold">{a.level}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-tpl-muted">Time</dt>
                          <dd className="font-bold">{a.duration}</dd>
                        </div>
                      </dl>
                    </div>
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
    </div>
  );
}
