/** Small date helpers that work on local calendar days (no time zones involved). */

export type Day = string; // "YYYY-MM-DD"

export function toDay(d: Date): Day {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function fromDay(day: Day): Date {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(day: Day, n: number): Day {
  const d = fromDay(day);
  d.setDate(d.getDate() + n);
  return toDay(d);
}

export function today(): Day {
  return toDay(new Date());
}

export function nightsBetween(from: Day, to: Day): number {
  return Math.round((fromDay(to).getTime() - fromDay(from).getTime()) / 86_400_000);
}

export function isDay(value: string | null | undefined): value is Day {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(fromDay(value).getTime());
}

export function formatDay(day: Day, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) {
  return new Intl.DateTimeFormat("en-GB", opts).format(fromDay(day));
}

export function formatLong(day: Day) {
  return formatDay(day, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

/** Days of a month view, padded with nulls so the grid starts on Monday. */
export function monthGrid(year: number, month: number): (Day | null)[] {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  const cells: (Day | null)[] = Array.from({ length: lead }, () => null);
  for (let d = 1; d <= count; d++) cells.push(toDay(new Date(year, month, d)));
  while (cells.length % 7) cells.push(null);
  return cells;
}

export const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function monthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(
    new Date(year, month, 1),
  );
}

export function formatMoney(amount: number, currency = "PHP") {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
