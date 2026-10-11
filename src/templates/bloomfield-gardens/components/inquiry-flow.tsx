"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { bookingRef } from "../../_kit/availability";
import { Calendar } from "../../_kit/calendar";
import { addDays, formatLong, isDay, today, type Day } from "../../_kit/dates";
import { isDateFree, packages, spaces } from "../content";
import { href, site } from "../site";
import { Sprig } from "./sprig";

const STEPS = ["Your date", "Your celebration", "About you"];
const EVENTS = ["Wedding", "Elopement", "Engagement party", "Anniversary", "Corporate event"];

const input =
  "mt-2 w-full rounded-xl bg-tpl-surface px-4 py-3 text-base ring-1 ring-tpl-line focus:ring-2 focus:ring-tpl-alt focus:outline-none";
const primary = "rounded-full bg-tpl-accent px-7 py-3.5 text-tpl-on-accent disabled:cursor-not-allowed disabled:opacity-40";

export function InquiryFlow() {
  const params = useSearchParams();
  const qDate = params.get("date");
  const startDate = isDay(qDate) && isDateFree(qDate) ? qDate : null;

  const [step, setStep] = useState(startDate ? 1 : 0);
  const [day, setDay] = useState<Day | null>(startDate);
  const [flexible, setFlexible] = useState(false);
  const [event, setEvent] = useState(EVENTS[0]);
  const [guests, setGuests] = useState(100);
  const [chosen, setChosen] = useState<string[]>(() => {
    const s = params.get("space");
    return s && spaces.some((x) => x.slug === s) ? [s] : [];
  });
  const [pkg, setPkg] = useState(() => packages.find((p) => p.name === params.get("package"))?.name ?? "Not sure yet");
  const [names, setNames] = useState("");
  const [ref, setRef] = useState("");
  const [holdUntil, setHoldUntil] = useState<Day | null>(null);

  const toggleSpace = (slug: string) =>
    setChosen((c) => (c.includes(slug) ? c.filter((x) => x !== slug) : [...c, slug]));

  if (step === 3) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <Sprig className="mx-auto w-32 text-tpl-alt" />
        <p className="mt-6 font-tpl-display text-6xl font-medium italic">Thank you, {names || "both"}.</p>
        {day && !flexible && holdUntil && holdUntil >= day ? (
          <p className="mt-5 text-lg text-tpl-muted">
            <span className="text-tpl-ink">{formatLong(day)}</span> is only days away, so we’ll call you today to
            confirm everything.
          </p>
        ) : day && !flexible ? (
          <p className="mt-5 text-lg text-tpl-muted">
            We’re holding <span className="text-tpl-ink">{formatLong(day)}</span> for you until{" "}
            {holdUntil && formatLong(holdUntil)}.
          </p>
        ) : (
          <p className="mt-5 text-lg text-tpl-muted">We’ll send you the open dates that fit what you told us.</p>
        )}
        <p className="mt-3 text-tpl-muted">
          Your coordinator will call within one working day to arrange a viewing. Reference {ref}.
        </p>
        <Link href={href("/spaces")} className={`${primary} mt-10 inline-block`}>
          Wander the estate
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <ol className="flex justify-center gap-3 sm:gap-8" aria-label="Inquiry steps">
        {STEPS.map((s, i) => (
          <li key={s} aria-current={i === step ? "step" : undefined} className="flex items-center gap-2 text-[15px]">
            <span className={`size-2.5 rounded-full ${i <= step ? "bg-tpl-alt" : "bg-tpl-line"}`} />
            <span className={i === step ? "text-tpl-ink" : "text-tpl-muted"}>{s}</span>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <section aria-labelledby="s-date" className="mt-12">
          <h2 id="s-date" className="text-center font-tpl-display text-5xl italic">
            When would you like to celebrate?
          </h2>
          <div className="mx-auto mt-10 max-w-md">
            <Calendar
              mode="single"
              start={day}
              onSelect={(d) => setDay(d)}
              isDisabled={(d) => !isDateFree(d)}
              className="rounded-[1.5rem] bg-tpl-surface p-5 ring-1 ring-tpl-line"
              headerClassName="mb-3 flex items-center gap-2 font-tpl-display text-2xl italic"
              navClassName="grid size-9 place-items-center rounded-full text-xl hover:bg-tpl-soft disabled:opacity-25"
              weekdayClassName="pb-2 text-center text-xs text-tpl-muted"
              dayClassName="mx-auto grid aspect-square w-full max-w-10 place-items-center rounded-full text-[15px] hover:bg-tpl-soft disabled:cursor-not-allowed disabled:line-through disabled:opacity-35 data-[selected=true]:bg-tpl-alt data-[selected=true]:text-white"
            />
            <label className="mt-5 flex items-center gap-3">
              <input type="checkbox" checked={flexible} onChange={(e) => setFlexible(e.target.checked)} className="size-5 accent-[var(--t-alt)]" />
              We’re flexible on the date
            </label>
          </div>
          <div className="mt-10 text-center">
            <button type="button" className={primary} disabled={!day && !flexible} onClick={() => setStep(1)}>
              {day && !flexible ? `Continue with ${formatLong(day)}` : "Continue"}
            </button>
          </div>
        </section>
      )}

      {step === 1 && (
        <section aria-labelledby="s-event" className="mt-12 space-y-10">
          <h2 id="s-event" className="text-center font-tpl-display text-5xl italic">
            Tell us about the day
          </h2>
          <fieldset>
            <legend className="text-lg">What are you celebrating?</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {EVENTS.map((e) => (
                <button
                  key={e}
                  type="button"
                  aria-pressed={event === e}
                  onClick={() => setEvent(e)}
                  className={`rounded-full px-5 py-2.5 ring-1 ${event === e ? "bg-tpl-deep text-tpl-on-deep ring-tpl-deep" : "ring-tpl-line hover:bg-tpl-soft"}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="block">
            <span className="text-lg">
              Roughly how many guests? <span className="font-tpl-display text-3xl">{guests}</span>
            </span>
            <input
              type="range"
              min={2}
              max={250}
              step={2}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="mt-4 block w-full accent-[var(--t-alt)]"
            />
          </label>
          <fieldset>
            <legend className="text-lg">Spaces you love</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {spaces.map((s) => {
                const cap = Math.max(s.ceremony ?? 0, s.dinner ?? 0, s.standing ?? 0);
                const small = cap < guests;
                return (
                  <label
                    key={s.slug}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl p-4 ring-1 has-checked:bg-tpl-soft has-checked:ring-tpl-alt ${small ? "opacity-50" : ""} ring-tpl-line`}
                  >
                    <input type="checkbox" checked={chosen.includes(s.slug)} onChange={() => toggleSpace(s.slug)} className="size-5 accent-[var(--t-alt)]" />
                    <span>
                      <span className="block">{s.name}</span>
                      <span className="text-sm text-tpl-muted">{small ? `Up to ${cap} guests` : s.kind}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          <label className="block">
            <span className="text-lg">Package</span>
            <select value={pkg} onChange={(e) => setPkg(e.target.value)} className={input}>
              {packages.map((p) => (
                <option key={p.name}>{p.name}</option>
              ))}
              <option>Not sure yet</option>
            </select>
          </label>
          <div className="flex justify-center gap-6">
            <button type="button" onClick={() => setStep(0)} className="underline underline-offset-4">
              Back
            </button>
            <button type="button" className={primary} onClick={() => setStep(2)}>
              Continue
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <form
          aria-labelledby="s-you"
          className="mt-12"
          onSubmit={(e) => {
            e.preventDefault();
            setRef(bookingRef("BG"));
            setHoldUntil(addDays(today(), 7));
            setStep(3);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <h2 id="s-you" className="text-center font-tpl-display text-5xl italic">
            And a little about you
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              Your names
              <input required value={names} onChange={(e) => setNames(e.target.value)} placeholder="e.g. Bea and Marco" className={input} />
            </label>
            <label className="block">
              Email
              <input type="email" required autoComplete="email" className={input} />
            </label>
            <label className="block">
              Phone
              <input type="tel" required autoComplete="tel" className={input} />
            </label>
            <label className="block sm:col-span-2">
              Anything you’re dreaming of?
              <textarea rows={4} className={input} placeholder="A lechon at midnight, a string quartet, a rain plan…" />
            </label>
          </div>
          <div className="mt-6 rounded-xl bg-tpl-soft p-5 text-[15px]">
            <p>
              {event} for about {guests} guests
              {day && !flexible ? ` on ${formatLong(day)}` : ", date flexible"}
              {chosen.length > 0 && `, interested in ${chosen.map((s) => spaces.find((x) => x.slug === s)!.name).join(", ")}`}.
            </p>
          </div>
          <p className="mt-4 text-sm text-tpl-muted">Demo: send this to your CRM or email ({site.email}). Nothing is sent.</p>
          <div className="mt-8 flex justify-center gap-6">
            <button type="button" onClick={() => setStep(1)} className="underline underline-offset-4">
              Back
            </button>
            <button type="submit" className={primary}>
              Send inquiry
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
