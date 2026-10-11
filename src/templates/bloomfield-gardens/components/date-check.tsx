"use client";

import Link from "next/link";
import { useState } from "react";
import { Calendar } from "../../_kit/calendar";
import { formatLong, type Day } from "../../_kit/dates";
import { isDateFree } from "../content";
import { href } from "../site";

/** "Is our date free?" Pick a day and see whether the estate is open (render inside <Suspense>). */
export function DateCheck({ dark = false }: { dark?: boolean }) {
  const [day, setDay] = useState<Day | null>(null);

  return (
    <div className={`grid gap-8 md:grid-cols-[minmax(0,360px)_1fr] md:items-center ${dark ? "text-t-on-deep" : ""}`}>
      <Calendar
        mode="single"
        start={day}
        onSelect={(d) => setDay(d)}
        isDisabled={(d) => !isDateFree(d)}
        className={`rounded-[1.5rem] p-5 ${dark ? "bg-white/8 ring-1 ring-white/15" : "bg-t-surface ring-1 ring-t-line"}`}
        headerClassName="mb-3 flex items-center gap-2 font-t-display text-2xl italic"
        navClassName="grid size-9 place-items-center rounded-full text-xl hover:bg-t-soft/30 disabled:opacity-25"
        weekdayClassName="pb-2 text-center text-xs opacity-60"
        dayClassName={`mx-auto grid aspect-square w-full max-w-10 place-items-center rounded-full text-[15px] disabled:cursor-not-allowed disabled:line-through disabled:opacity-35 data-[selected=true]:bg-t-alt data-[selected=true]:text-white ${
          dark ? "hover:bg-white/10" : "hover:bg-t-soft"
        }`}
      />
      <div aria-live="polite">
        {day ? (
          <>
            <p className="font-t-display text-4xl italic leading-tight">{formatLong(day)} is free.</p>
            <p className={`mt-3 max-w-[40ch] ${dark ? "text-t-on-deep/75" : "text-t-muted"}`}>
              We can hold it for you for seven days, no deposit needed, while you come and see the estate.
            </p>
            <Link href={`${href("/inquire")}?date=${day}`} className="mt-6 inline-block rounded-full bg-t-accent px-6 py-3 text-t-on-accent">
              Hold this date
            </Link>
          </>
        ) : (
          <>
            <p className="font-t-display text-4xl italic leading-tight">Is your date free?</p>
            <p className={`mt-3 max-w-[40ch] ${dark ? "text-t-on-deep/75" : "text-t-muted"}`}>
              Pick a day to check. Crossed-out days are already taken; Saturdays in the dry season go first.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
