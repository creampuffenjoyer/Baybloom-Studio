import { addDays, type Day } from "./dates";

/*
 * Demo availability. Real sites replace these functions with calls to their
 * booking engine or channel manager; the UI only needs the same signatures.
 * Results are deterministic (seeded by date + key) so every visitor sees the
 * same calendar.
 */

function hash(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

/** True when `key` (a room, table, therapist, space...) is free on `day`. */
export function isAvailable(day: Day, key = "", busyRate = 0.22) {
  return hash(`${key}:${day}`) >= busyRate;
}

/** A stay is bookable when every night from check-in to the night before check-out is free. */
export function isStayAvailable(key: string, checkIn: Day, nights: number, busyRate?: number) {
  for (let i = 0; i < nights; i++) {
    if (!isAvailable(addDays(checkIn, i), key, busyRate)) return false;
  }
  return true;
}

/** Time slots between `open` and `close` (24h, e.g. "17:30"), every `step` minutes. */
export function timeSlots(open: string, close: string, step = 30) {
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const out: string[] = [];
  for (let t = toMin(open); t <= toMin(close); t += step) {
    out.push(`${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`);
  }
  return out;
}

/** Slots still free on `day` for `key` (deterministic per slot). */
export function freeSlots(day: Day, slots: string[], key = "", busyRate = 0.35) {
  return slots.filter((s) => hash(`${key}:${day}:${s}`) >= busyRate);
}

export function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = ((h + 11) % 12) + 1;
  return m === 0 ? `${h12}${suffix}` : `${h12}:${String(m).padStart(2, "0")}${suffix}`;
}

/** A short, readable booking reference. */
export function bookingRef(prefix: string) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `${prefix}-${out}`;
}
