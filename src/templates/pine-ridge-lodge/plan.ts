import { fromDay, nightsBetween, toDay } from "../_kit/dates";
import type { Season } from "./content";

export const seasonOf = (value: string | null): Season => value === "summer" ? "summer" : "winter";
export function validStay(start: string | null, end: string | null, today: string | null) {
  const real = (s: string | null): s is string => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && toDay(fromDay(s)) === s;
  return real(start) && real(end) && !!today && start >= today && end > start && nightsBetween(start, end) <= 30;
}
export function matchesSeason(start: string | null, end: string | null, season: Season) {
  if (!start || !end) return false;
  const count = nightsBetween(start, end);
  if (count < 1 || count > 30) return false;
  for (let i = 0; i < count; i++) {
    const day = fromDay(start); day.setDate(day.getDate() + i);
    const month = day.getMonth() + 1;
    if (!(season === "winter" ? month === 12 || month <= 4 : month >= 6 && month <= 10)) return false;
  }
  return true;
}
export function extraCost(id: string, price: number, guests: number, nights: number) {
  // One rental set per night; lift passes and dinners for each guest, each night.
  return price * nights * (id === "rental" ? 1 : guests);
}
