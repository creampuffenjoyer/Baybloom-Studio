import Image from "next/image";
import { photo } from "../content";
import { arch } from "../site";

const chapters = [
  { year: "1887", text: "Don Ramon Verde, a tobacco merchant, builds the house on Calle Crisologo: stone below, hardwood and capiz above, the way Vigan had built since the 1700s." },
  { year: "1945", text: "The house survives the war with a cracked façade and a family story about a carabao hidden in the kitchen." },
  { year: "1972", text: "For twenty years the ground floor is a school. Generations of Vigan children learn to read in what is now our dining room." },
  { year: "1999", text: "UNESCO inscribes the Historic Town of Vigan as a World Heritage Site. The house stands empty, waiting." },
  { year: "2019", text: "After four years of careful restoration with local craftsmen, the house opens as a hotel of twelve rooms." },
];

export function StoryPage() {
  return (
    <>
      <section className="mx-auto grid max-w-7xl gap-12 px-5 pt-16 sm:px-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <div className="lg:pb-12">
          <h1 className="font-tpl-display text-6xl leading-[0.98] italic sm:text-8xl">The story of the house</h1>
          <p className="mt-8 max-w-[52ch] text-lg leading-relaxed text-tpl-muted">
            Vigan’s old houses are built in two halves: stone below to stand up to earthquakes, wood above to
            breathe in the heat. Ours has stood for more than 130 years.
          </p>
        </div>
        <div className={`relative aspect-[3/4] overflow-hidden ${arch}`}>
          <Image src={photo("facade").src} alt={photo("facade").alt} fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
        </div>
      </section>
      <section aria-label="Timeline" className="mx-auto max-w-4xl px-5 py-24 sm:px-8">
        <ol className="space-y-14">
          {chapters.map((c) => (
            <li key={c.year} className="grid gap-4 sm:grid-cols-[180px_1fr]">
              <span className="font-tpl-display text-6xl text-tpl-alt italic">{c.year}</span>
              <p className="pt-2 font-tpl-display text-2xl leading-snug">{c.text}</p>
            </li>
          ))}
        </ol>
      </section>
      <div className="mx-auto grid max-w-7xl grid-cols-3 gap-4 px-5 sm:px-8">
        {(["street", "bougainvillea", "library"] as const).map((k) => (
          <div key={k} className={`relative aspect-[3/4] overflow-hidden ${arch}`}>
            <Image src={photo(k).src} alt={photo(k).alt} fill sizes="33vw" className="object-cover" />
          </div>
        ))}
      </div>
    </>
  );
}
