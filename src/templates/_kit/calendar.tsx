"use client";

import { useState } from "react";
import { addDays, fromDay, monthGrid, monthLabel, WEEKDAYS, type Day } from "./dates";
import { useToday } from "./use-today";

/*
 * Unstyled month calendar (render inside <Suspense>; it reads today's date). Each day button exposes its state as data
 * attributes so templates style it with Tailwind variants, e.g.
 * `data-[selected=true]:bg-tpl-accent data-[in-range=true]:bg-tpl-soft`.
 *   data-selected   start or end of the range (or the single picked day)
 *   data-in-range   strictly between start and end
 *   data-disabled   not selectable (past or unavailable)
 *   data-today      today's date
 */

type Props = {
  mode: "single" | "range";
  start?: Day | null;
  end?: Day | null;
  onSelect: (start: Day, end: Day | null) => void;
  isDisabled?: (day: Day) => boolean;
  /** How many months to show side by side (1 or 2). */
  months?: 1 | 2;
  className?: string;
  monthClassName?: string;
  headerClassName?: string;
  navClassName?: string;
  weekdayClassName?: string;
  dayClassName?: string;
  /** Optional content under each day number (e.g. a price or "full"). */
  renderDayNote?: (day: Day, disabled: boolean) => React.ReactNode;
};

export function Calendar({
  mode,
  start = null,
  end = null,
  onSelect,
  isDisabled,
  months = 1,
  className,
  monthClassName,
  headerClassName,
  navClassName,
  weekdayClassName,
  dayClassName,
  renderDayNote,
}: Props) {
  const now = useToday();
  const first = fromDay(start ?? now);
  const [cursor, setCursor] = useState({ y: first.getFullYear(), m: first.getMonth() });
  const minCursor = fromDay(now);
  const atMin = cursor.y === minCursor.getFullYear() && cursor.m === minCursor.getMonth();

  const shift = (n: number) =>
    setCursor(({ y, m }) => {
      const d = new Date(y, m + n, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  function pick(day: Day) {
    if (mode === "single") return onSelect(day, null);
    if (!start || end || day <= start) return onSelect(day, null);
    // Reject ranges that cross an unavailable night.
    for (let d = start; d < day; d = addDays(d, 1)) {
      if (d !== start && isDisabled?.(d)) return onSelect(day, null);
    }
    onSelect(start, day);
  }

  const views = Array.from({ length: months }, (_, i) => {
    const d = new Date(cursor.y, cursor.m + i, 1);
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  return (
    <div className={className}>
      <div className={headerClassName}>
        <button
          type="button"
          className={navClassName}
          onClick={() => shift(-1)}
          disabled={atMin}
          aria-label="Previous month"
        >
          ‹
        </button>
        <span aria-live="polite" className="flex-1 text-center">
          {months === 1 ? monthLabel(views[0].y, views[0].m) : <span className="sr-only">{views.map((v) => monthLabel(v.y, v.m)).join(" to ")}</span>}
        </span>
        <button type="button" className={navClassName} onClick={() => shift(1)} aria-label="Next month">
          ›
        </button>
      </div>
      <div className={months === 2 ? "grid gap-6 sm:grid-cols-2" : undefined}>
        {views.map((v) => (
          <div key={`${v.y}-${v.m}`} className={monthClassName}>
            {months === 2 && <p className="mb-3 text-center font-semibold">{monthLabel(v.y, v.m)}</p>}
            <div role="grid" aria-label={monthLabel(v.y, v.m)} className="grid grid-cols-7 gap-y-1">
              {WEEKDAYS.map((w) => (
                <span key={w} role="columnheader" className={weekdayClassName}>
                  {w}
                </span>
              ))}
              {monthGrid(v.y, v.m).map((day, i) => {
                if (!day) return <span key={`pad-${i}`} aria-hidden />;
                const disabled = day < now || !!isDisabled?.(day);
                // In range mode a booked day can still be a check-out day.
                const checkoutOk = mode === "range" && !!start && !end && day > start && day >= now;
                const selectable = !disabled || checkoutOk;
                const selected = day === start || day === end;
                const inRange = !!start && !!end && day > start && day < end;
                return (
                  <button
                    key={day}
                    type="button"
                    role="gridcell"
                    className={dayClassName}
                    disabled={!selectable}
                    aria-selected={selected}
                    aria-label={fromDay(day).toDateString()}
                    data-selected={selected}
                    data-in-range={inRange}
                    data-disabled={!selectable}
                    data-today={day === now}
                    onClick={() => pick(day)}
                  >
                    <span>{Number(day.slice(8))}</span>
                    {renderDayNote?.(day, !selectable)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
