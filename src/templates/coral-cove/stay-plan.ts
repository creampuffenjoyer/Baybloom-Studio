import { fromDay, nightsBetween, toDay } from "../_kit/dates";

/** Sample planning rules, independent of translated display copy. */
export function validStay(start: string | null, end: string | null, today: string | null) {
  const realDay = (value: string | null): value is string => !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) && toDay(fromDay(value)) === value;
  return realDay(start) && realDay(end) && !!today && start >= today && end > start && nightsBetween(start, end) <= 30;
}

export function stayEstimate(roomTotal: number, extrasTotal: number, rate: number, nights: number, offer: string | null) {
  const freeNights = offer === "stay-longer" ? Math.floor(nights / 5) : 0;
  const discount = rate * freeNights;
  return { freeNights, discount, subtotal: roomTotal + extrasTotal - discount };
}
