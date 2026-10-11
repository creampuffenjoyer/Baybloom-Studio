import Image from "next/image";
import { photo, places } from "../content";

export function GuidePage() {
  const kinds = [...new Set(places.map((p) => p.kind))];
  return (
    <div className="mx-auto max-w-6xl px-5 pt-10 sm:px-8">
      <h1 className="font-t-display text-5xl sm:text-6xl">Around Basco</h1>
      <p className="mt-4 max-w-[56ch] text-lg text-t-muted">
        Batanes is small, safe and best seen slowly. Tricycles wait outside the house, and we lend bicycles
        and umbrellas for free.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-[2fr_1fr]">
        <div className="relative aspect-[16/10] overflow-hidden rounded-3xl">
          <Image src={photo("headland").src} alt={photo("headland").alt} fill priority sizes="(min-width: 640px) 66vw, 100vw" className="object-cover" />
        </div>
        <div className="grid gap-4">
          {(["cliff-walk", "beach"] as const).map((k) => (
            <div key={k} className="relative overflow-hidden rounded-3xl">
              <Image src={photo(k).src} alt={photo(k).alt} fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover" />
            </div>
          ))}
        </div>
      </div>
      {kinds.map((kind) => (
        <section key={kind} aria-labelledby={`k-${kind}`} className="mt-14">
          <h2 id={`k-${kind}`} className="font-t-display text-3xl">
            {kind === "Walk" ? "Walks" : kind === "Cycle" ? "By bike" : kind === "Beach" ? "Beaches" : kind === "Café" ? "Coffee" : "Dinner"}
          </h2>
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {places
              .filter((p) => p.kind === kind)
              .map((p) => (
                <li key={p.name} className="rounded-2xl bg-t-surface p-6 ring-1 ring-t-line">
                  <p className="flex items-baseline justify-between gap-4">
                    <span className="font-t-display text-xl">{p.name}</span>
                    <span className="shrink-0 text-sm font-semibold text-t-accent">{p.distance}</span>
                  </p>
                  <p className="mt-2 text-t-muted">{p.note}</p>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
