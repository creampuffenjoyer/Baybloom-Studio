"use client";
import { useSpaCopy } from "../copy";
import { useSpaPhoto } from "../photos";
import { PlacementImage as Image } from "../components/placement-image";
import { usePersonalization } from "../personalization";
import { therapists } from "../content";
import { pebbles } from "../site";

export function AboutPage() {
  const copy = useSpaCopy();
  const photo = useSpaPhoto();
  const { spaTherapists } = usePersonalization();
  return (
    <>
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pt-12 pb-16 sm:px-8 lg:grid-cols-2">
        <div>
          <h1 className="font-tpl-display text-6xl leading-[1.05] sm:text-7xl">{copy("Rest is a practice.")}</h1>
          <div className="mt-8 max-w-[54ch] space-y-5 text-lg leading-relaxed text-tpl-muted">
            <p>{copy("Still Water began in 2018 as two treatment rooms above a bakery on Session Road. Our founder, a hilot practitioner from Ilocos, wanted somewhere in Baguio where people could come to do nothing for an afternoon.")}</p>
            <p>{copy("Today we have six treatment rooms and a small bathhouse in the pines of Camp John Hay. The idea hasn’t changed: unhurried treatments, local ingredients, and no phones past the front desk.")}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className={`relative aspect-[3/4] overflow-hidden ${pebbles[2]}`}>
            <Image placement={"about.reception"} src={photo("reception").src} unoptimized={photo("reception").src.startsWith("blob:") || photo("reception").src.startsWith("/api/personalization/")} alt={photo("reception").alt} fill priority sizes="25vw" className="object-cover" />
          </div>
          <div className={`relative mt-16 aspect-[3/4] overflow-hidden ${pebbles[0]}`}>
            <Image placement={"about.round-leaves"} src={photo("round-leaves").src} unoptimized={photo("round-leaves").src.startsWith("blob:") || photo("round-leaves").src.startsWith("/api/personalization/")} alt={photo("round-leaves").alt} fill sizes="25vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section aria-labelledby="promises" className="bg-tpl-surface">
        <h2 id="promises" className="sr-only">{copy("What we promise")}</h2>
        <dl className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 md:grid-cols-3">
          {[
            ["Local first", "Coffee from Atok, rice water and moringa from La Trinidad, river stones from the Bued."],
            ["Trained hands", "Every therapist trains with us for three months, and hilot practitioners for a year."],
            ["Quiet by design", "Soft voices, no music in the bathhouse, and lockers for your phone."],
          ].map(([t, d]) => (
            <div key={t}>
              <dt className="font-tpl-display text-2xl">{copy(t)}</dt>
              <dd className="mt-3 leading-relaxed text-tpl-muted">{copy(d)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="team" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <h2 id="team" className="font-tpl-display text-4xl sm:text-5xl">{copy("Our therapists")}</h2>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {therapists.map((original, index) => { const t = { ...original, ...spaTherapists?.[["first", "second", "third", "fourth"][index]] }; return (
            <li key={index} className="rounded-[2rem] bg-tpl-soft p-7">
              <p aria-hidden className="grid size-14 place-items-center rounded-full bg-tpl-deep font-tpl-display text-2xl text-tpl-on-deep">
                {t.name[0]}
              </p>
              <h3 className="mt-5 font-tpl-display text-2xl">{t.name}</h3>
              <p className="mt-1 text-tpl-muted">{t.craft}</p>
              <p className="mt-3 text-sm">{t.years} {copy("years with us")}</p>
            </li>
          ); })}
        </ul>
      </section>
    </>
  );
}
