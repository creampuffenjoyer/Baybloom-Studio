import Image from "next/image";
import { menu, photo } from "../content";

export function DiningPage() {
  return (
    <>
      <div className="relative aspect-[16/9] max-h-[560px] w-full overflow-hidden sm:aspect-[21/8]">
        <Image src={photo("restaurant").src} alt={photo("restaurant").alt} fill priority sizes="100vw" className="object-cover" />
      </div>
      <div className="mx-auto grid max-w-7xl gap-14 px-5 pt-14 sm:px-8 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h1 className="font-tpl-display text-5xl font-bold sm:text-6xl">Dining</h1>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-tpl-muted">
            <p>Breakfast from 7 to 10: porridge, eggs any way, sourdough from our oven and bottomless coffee.</p>
            <p>
              Trail lunches are packed to order the night before. Supper is at 7, family style at the long table,
              with a lighter menu in the bar from 5.
            </p>
            <p>Non-residents are welcome for supper; please book a day ahead.</p>
          </div>
        </div>
        <section aria-labelledby="tonight">
          <h2 id="tonight" className="font-tpl-display text-3xl font-bold">
            Tonight’s supper menu
          </h2>
          <ul className="mt-6 divide-y divide-tpl-line border-y border-tpl-line">
            {menu.map((m) => (
              <li key={m.name} className="flex items-baseline justify-between gap-6 py-4">
                <span>
                  <span className="font-tpl-display text-2xl font-bold">{m.name}</span>
                  <span className="block text-tpl-muted">{m.detail}</span>
                </span>
                <span className="text-lg font-medium">{m.price}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-tpl-muted">Prices in Canadian dollars. Vegetarian and gluten-free on request.</p>
        </section>
      </div>
    </>
  );
}
