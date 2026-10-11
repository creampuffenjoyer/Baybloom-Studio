import Image from "next/image";
import Link from "next/link";
import { PageIntro } from "../components/page-intro";
import { experiences, photo } from "../content";
import { href } from "../site";

export function ExperiencesPage() {
  return (
    <>
      <PageIntro
        title="Days on the water"
        lede="Snorkel gear, kayaks and paddleboards are free for every guest. Everything else, our front desk can book in a few minutes, or ask us before you arrive."
        image={photo("sandbar")}
      />
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <ul className="grid gap-x-10 gap-y-20 md:grid-cols-2">
          {experiences.map((x, i) => {
            const p = photo(x.photo);
            return (
              <li key={x.slug} id={x.slug} className={`scroll-mt-28 ${i % 2 ? "md:mt-24" : ""}`}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
                  <Image src={p.src} alt={p.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                </div>
                <h2 className="mt-6 font-t-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl">{x.name}</h2>
                <p className="mt-3 text-lg text-t-ink">{x.summary}</p>
                <p className="mt-3 leading-relaxed text-t-muted">{x.detail}</p>
                <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                  <div>
                    <dt className="inline text-t-muted">Length: </dt>
                    <dd className="inline font-semibold">{x.duration}</dd>
                  </div>
                  <div>
                    <dt className="inline text-t-muted">Price: </dt>
                    <dd className="inline font-semibold">{x.price}</dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      </div>
      <section className="bg-t-deep px-5 py-20 text-center text-white">
        <h2 className="mx-auto max-w-2xl font-t-display text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
          Plan your days before you land
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
          Tell us what you love and we’ll pencil in boats, dives and dinners around the tides.
        </p>
        <Link href={href("/contact")} className="mt-8 inline-block rounded-full bg-white px-7 py-3.5 font-semibold text-t-deep">
          Ask our team
        </Link>
      </section>
    </>
  );
}
