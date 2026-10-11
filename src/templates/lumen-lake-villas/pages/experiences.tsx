import Image from "next/image";
import { ExperienceInquiry } from "../components/experience-inquiry";
import { experiences, photo } from "../content";

export function ExperiencesPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 pt-10 sm:px-10">
      <h1 className="font-tpl-display text-7xl sm:text-8xl">Experiences</h1>
      <p className="mt-6 max-w-[48ch] text-lg text-tpl-muted">
        Kayaks, bicycles and the sauna are always free to use. These take a little arranging.
      </p>
      <ul className="mt-24 space-y-32">
        {experiences.map((x, i) => {
          const p = photo(x.photo);
          return (
            <li key={x.slug} id={x.slug} className="grid scroll-mt-10 gap-10 md:grid-cols-2 md:items-center md:gap-20">
              <div className={`relative aspect-[4/5] overflow-hidden ${i % 2 ? "md:order-2" : ""}`}>
                <Image src={p.src} alt={p.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
              </div>
              <div>
                <p className="text-sm text-tpl-muted">
                  {x.when} · {x.price}
                </p>
                <h2 className="mt-3 font-tpl-display text-5xl">{x.name}</h2>
                <p className="mt-5 max-w-[44ch] text-lg leading-relaxed text-tpl-muted">{x.text}</p>
                <ExperienceInquiry name={x.name} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
