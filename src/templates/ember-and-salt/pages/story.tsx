"use client";
import { useEmberCopy } from "../copy";
import { PlacementImage as Image } from "../components/placement-image";
import { useEmberData } from "../data";
import { usePersonalization } from "../personalization";

const timeline = [
  { year: "2019", text: "Chef Paolo Cruz builds a brick oven in his parents’ garden in Lipa and starts cooking Sunday lunches for friends." },
  { year: "2021", text: "The Sunday lunches become a weekend pop-up in Poblacion, with a forty-person waiting list by the third week." },
  { year: "2023", text: "Ember & Salt opens in a former printing shop on Calle Hormiga, with a hand-built oven and a charcoal grill." },
  { year: "2025", text: "The Back Room opens behind the wine wall, and the bar starts its smoked cocktail list." },
];

export function StoryPage() {
  const t = useEmberCopy();
  const { photo } = useEmberData();
  const story = usePersonalization().emberStory;
  return (
    <>
      <section className="mx-auto grid max-w-7xl gap-12 px-5 pt-16 pb-20 sm:px-8 lg:grid-cols-2 lg:items-center">
        <div>
          <h1 className="font-tpl-display text-6xl leading-[0.92] sm:text-8xl">{story?.heading || "Fire first."}</h1>
          <div className="mt-8 max-w-[54ch] space-y-5 text-lg leading-relaxed text-tpl-muted">
            <p>
              {story?.introduction || "Our kitchen has no gas burners. Everything is cooked over native hardwood, coconut husk and charcoal, which means every service starts at two in the afternoon, when the first fire is lit."}
            </p>
            <p>
              {story?.sourcing || "We buy whole animals from two farms in Batangas, fish from the morning auction in Navotas, and vegetables from a cooperative in Benguet. Whatever we can’t use fresh, we cure, smoke or ferment."}
            </p>
          </div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image placement={"story.oven"} src={photo("oven").src} unoptimized={photo("oven").src.startsWith("blob:") || photo("oven").src.startsWith("/api/personalization/")} alt={photo("oven").alt} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
      </section>

      <section aria-labelledby="timeline" className="border-t border-tpl-line">
        <div className="mx-auto max-w-4xl px-5 py-20 sm:px-8">
          <h2 id="timeline" className="font-tpl-display text-4xl">{t("How we got here")}</h2>
          <ol className="mt-10 space-y-8">
            {timeline.map((t, index) => (
              <li key={index} className="grid gap-2 sm:grid-cols-[140px_1fr]">
                <span className="font-tpl-display text-4xl text-tpl-accent">{story?.chapters?.[["first", "second", "third", "fourth"][index]]?.year || t.year}</span>
                <p className="text-lg leading-relaxed">{story?.chapters?.[["first", "second", "third", "fourth"][index]]?.text || t.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-1 sm:grid-cols-3">
        {(["flame", "fire-dish", "tables"] as const).map((k) => (
          <div key={k} className="relative aspect-[4/3]">
            <Image placement={`story.${k}`} src={photo(k).src} unoptimized={photo(k).src.startsWith("blob:") || photo(k).src.startsWith("/api/personalization/")} alt={photo(k).alt} fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover" />
          </div>
        ))}
      </div>
    </>
  );
}
