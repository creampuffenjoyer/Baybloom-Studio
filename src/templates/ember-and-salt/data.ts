"use client";
import { useMemo } from "react";
import { menus, spaces, press, signatureDishes, photo as originalPhoto, type PhotoKey } from "./content";
import { site } from "./site";
import { usePersonalization } from "./personalization";

/** Keep stable menu indices while applying the customer's validated overrides. */
export function useEmberData() {
  const draft = usePersonalization();
  return useMemo(() => ({
    menus: menus.map(menu => ({ ...menu, ...draft.emberMenus?.[menu.id], sections: menu.sections.map((section, sectionIndex) => ({
      ...section, ...draft.emberSections?.[`${menu.id}:${sectionIndex}`], dishes: section.dishes.map((dish, dishIndex) => {
        const override = draft.emberDishes?.[`${menu.id}:${sectionIndex}:${dishIndex}`];
        if (!override) return dish;
        // A changed dish must not silently inherit the example's dietary labels.
        const diet = override.diet ?? (override.name || override.detail ? [] : dish.diet);
        return { ...dish, ...override, diet };
      }),
    })) })),
    spaces: spaces.map(space => ({ ...space, ...draft.emberSpaces?.[space.slug] })),
    hours: site.hours.map((hours, index) => ({ ...hours, ...draft.emberHours?.[["first", "second", "third", "fourth"][index]] })),
    press: press.map((item, index) => ({ ...item, ...draft.emberPress?.[["first", "second", "third"][index]] })),
    signatures: signatureDishes.map((item, index) => ({ ...item, ...draft.emberSignatures?.[["first", "second", "third"][index]] })),
    site: { ...site, ...draft.business },
    pressHidden: draft.emberPressHidden ?? false,
    photo: (key: PhotoKey) => { const original = originalPhoto(key); const custom = draft.emberPhotos?.[key]; return { ...original, src: custom || original.src, alt: draft.emberPhotoAlt?.[key] || (custom ? "Your selected website photo" : original.alt) }; },
  }), [draft]);
}
