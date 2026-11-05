import type { Diet, Menu } from "./content";

/** Search the current menu's dish names and descriptions, then apply its dietary label. */
export function filterMenu(menu: Menu, query: string, diet: Diet | "all") {
  const term = query.trim().toLocaleLowerCase();
  return menu.sections.map((section) => ({
    ...section,
    dishes: section.dishes.filter((dish) => (diet === "all" || dish.diet?.includes(diet)) && (!term || `${dish.name} ${dish.detail}`.toLocaleLowerCase().includes(term))),
  })).filter((section) => section.dishes.length > 0);
}
