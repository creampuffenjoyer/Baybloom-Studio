import Image from "next/image";
import { photo, therapists } from "../content";
import { pebbles } from "../site";

export function AboutPage() {
  return (
    <>
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pt-12 pb-16 sm:px-8 lg:grid-cols-2">
        <div>
          <h1 className="font-t-display text-6xl leading-[1.05] sm:text-7xl">Rest is a practice.</h1>
          <div className="mt-8 max-w-[54ch] space-y-5 text-lg leading-relaxed text-t-muted">
            <p>
              Still Water began in 2018 as two treatment rooms above a bakery on Session Road. Our founder,
              a hilot practitioner from Ilocos, wanted somewhere in Baguio where people could come to do
              nothing for an afternoon.
            </p>
            <p>
              Today we have six treatment rooms and a small bathhouse in the pines of Camp John Hay. The
              idea hasn’t changed: unhurried treatments, local ingredients, and no phones past the front
              desk.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className={`relative aspect-[3/4] overflow-hidden ${pebbles[2]}`}>
            <Image src={photo("reception").src} alt={photo("reception").alt} fill priority sizes="25vw" className="object-cover" />
          </div>
          <div className={`relative mt-16 aspect-[3/4] overflow-hidden ${pebbles[0]}`}>
            <Image src={photo("round-leaves").src} alt={photo("round-leaves").alt} fill sizes="25vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section aria-labelledby="promises" className="bg-t-surface">
        <h2 id="promises" className="sr-only">
          What we promise
        </h2>
        <dl className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 md:grid-cols-3">
          {[
            ["Local first", "Coffee from Atok, rice water and moringa from La Trinidad, river stones from the Bued."],
            ["Trained hands", "Every therapist trains with us for three months, and hilot practitioners for a year."],
            ["Quiet by design", "Soft voices, no music in the bathhouse, and lockers for your phone."],
          ].map(([t, d]) => (
            <div key={t}>
              <dt className="font-t-display text-2xl">{t}</dt>
              <dd className="mt-3 leading-relaxed text-t-muted">{d}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="team" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <h2 id="team" className="font-t-display text-4xl sm:text-5xl">
          Our therapists
        </h2>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {therapists.map((t) => (
            <li key={t.name} className="rounded-[2rem] bg-t-soft p-7">
              <p aria-hidden className="grid size-14 place-items-center rounded-full bg-t-deep font-t-display text-2xl text-t-on-deep">
                {t.name[0]}
              </p>
              <h3 className="mt-5 font-t-display text-2xl">{t.name}</h3>
              <p className="mt-1 text-t-muted">{t.craft}</p>
              <p className="mt-3 text-sm">{t.years} years with us</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
