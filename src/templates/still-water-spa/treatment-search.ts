import type { Ritual, Treatment } from "./content";
export function findTreatments(treatments: Treatment[], ritual: Ritual | "all", duration: number | null) {
  return treatments.filter((treatment) => (ritual === "all" || treatment.ritual === ritual) && (duration === null || treatment.options.some((option) => option.minutes === duration)));
}
