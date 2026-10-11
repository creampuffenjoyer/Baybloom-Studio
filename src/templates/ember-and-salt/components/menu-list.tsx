import { DIET_LABEL, type MenuSection } from "../content";

const DIET_SHORT = { v: "V", vg: "VG", gf: "GF", df: "DF" } as const;

/** A menu section set like a printed card: dish, dotted leader, price. */
export function MenuList({ section, headingLevel = 3 }: { section: MenuSection; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <section>
      <H className="font-tpl-display text-3xl sm:text-4xl">{section.title}</H>
      {section.intro && <p className="mt-2 max-w-[52ch] text-tpl-muted">{section.intro}</p>}
      <ul className="mt-6 space-y-5">
        {section.dishes.map((d) => (
          <li key={d.name}>
            <div className="flex items-baseline gap-3">
              <span className="text-lg font-semibold">
                {d.name}
                {d.note && <span className="ml-2 text-sm font-normal text-tpl-alt">{d.note}</span>}
              </span>
              <span aria-hidden className="min-w-6 flex-1 translate-y-[-4px] border-b border-dotted border-tpl-muted/60" />
              <span className="font-tpl-display text-xl tabular-nums">{d.price.toLocaleString("en-PH")}</span>
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-tpl-muted">
              {d.detail}
              {d.diet?.map((x) => (
                <abbr
                  key={x}
                  title={DIET_LABEL[x]}
                  className="rounded-sm border border-tpl-line px-1.5 text-[11px] font-semibold tracking-wide text-tpl-ink no-underline"
                >
                  {DIET_SHORT[x]}
                </abbr>
              ))}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
