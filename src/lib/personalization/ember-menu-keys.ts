import { menus } from "@/templates/ember-and-salt/content";
export const EMBER_MENU_KEYS = menus.map((menu) => menu.id);
export const EMBER_SECTION_KEYS = menus.flatMap((menu) => menu.sections.map((_, index) => `${menu.id}:${index}`));
export const EMBER_DISH_KEYS = menus.flatMap((menu) => menu.sections.flatMap((section, sectionIndex) => section.dishes.map((_, dishIndex) => `${menu.id}:${sectionIndex}:${dishIndex}`)));
