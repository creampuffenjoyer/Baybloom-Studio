"use client";

import { useRef, useState } from "react";
import { DIET_LABEL, menus, type Diet } from "../content";
import { MenuList } from "./menu-list";
import { filterMenu } from "../menu-search";

/** Dinner / drinks / dessert tabs. Every panel stays in the page for search engines. */
export function MenuTabs() {
  const [active, setActive] = useState(menus[0].id);
  const [query, setQuery] = useState("");
  const [diet, setDiet] = useState<Diet | "all">("all");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKey(e: React.KeyboardEvent, i: number) {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    const next = (i + dir + menus.length) % menus.length;
    setActive(menus[next].id);
    tabs.current[next]?.focus();
  }

  return (
    <div>
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm">Search dishes<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Dish or ingredient" className="border border-tpl-line bg-tpl-surface px-4 py-3 text-base" /></label>
        <label className="grid gap-2 text-sm">Dietary label<select value={diet} onChange={(event) => setDiet(event.target.value as Diet | "all")} className="border border-tpl-line bg-tpl-surface px-4 py-3 text-base"><option value="all">All dishes</option>{Object.entries(DIET_LABEL).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      </div>
      <div role="tablist" aria-label="Menus" className="flex gap-8 border-b border-tpl-line">
        {menus.map((m, i) => (
          <button
            key={m.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            role="tab"
            id={`tab-${m.id}`}
            aria-selected={active === m.id}
            aria-controls={`panel-${m.id}`}
            tabIndex={active === m.id ? 0 : -1}
            onClick={() => setActive(m.id)}
            onKeyDown={(e) => onKey(e, i)}
            className={`-mb-px border-b-2 pb-3 font-tpl-display text-2xl transition-colors sm:text-3xl ${
              active === m.id ? "border-tpl-accent text-tpl-ink" : "border-transparent text-tpl-muted hover:text-tpl-ink"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      {menus.map((m) => {
        const sections = filterMenu(m, query, diet);
        return (
        <div
          key={m.id}
          role="tabpanel"
          id={`panel-${m.id}`}
          aria-labelledby={`tab-${m.id}`}
          hidden={active !== m.id}
          className="pt-10"
        >
          <p className="text-tpl-muted">{m.served}</p>
          <p className="mt-3 text-sm text-tpl-muted" role="status">{sections.length ? `${sections.reduce((sum, section) => sum + section.dishes.length, 0)} dishes shown` : "No dishes match in this menu. Try another search, label, or menu."}</p>
          <div className="mt-10 grid gap-16 lg:grid-cols-2 lg:gap-x-20">
            {sections.map((s) => (
              <MenuList key={s.title} section={s} headingLevel={2} />
            ))}
          </div>
        </div>
      ); })}
      <p className="mt-16 border-t border-tpl-line pt-6 text-sm text-tpl-muted">
        {Object.entries(DIET_LABEL)
          .map(([k, v]) => `${k.toUpperCase()} ${v.toLowerCase()}`)
          .join(", ")}
        . Labels describe listed menu attributes and do not guarantee a dish is allergen-free. Tell your server about any allergies; our kitchen handles nuts, gluten and shellfish.
      </p>
    </div>
  );
}
