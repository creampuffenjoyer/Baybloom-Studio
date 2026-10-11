"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { bookingRef, formatTime, freeSlots, timeSlots } from "../../_kit/availability";
import { Calendar } from "../../_kit/calendar";
import { formatLong, formatMoney, fromDay, type Day } from "../../_kit/dates";
import { RITUALS, treatments } from "../content";
import { href, site } from "../site";

const THERAPIST = [
  { id: "any", label: "No preference" },
  { id: "female", label: "Female therapist" },
  { id: "male", label: "Male therapist" },
] as const;

const input =
  "mt-2 w-full rounded-2xl bg-t-surface px-4 py-3 text-base ring-1 ring-t-line focus:ring-2 focus:ring-t-accent focus:outline-none";
const primary =
  "rounded-full bg-t-accent px-7 py-3.5 font-semibold text-t-on-accent disabled:cursor-not-allowed disabled:opacity-40";

function slotsFor(day: Day) {
  const weekend = [0, 6].includes(fromDay(day).getDay());
  return timeSlots(weekend ? "09:00" : "10:00", weekend ? "20:30" : "19:30", 30);
}

export function BookFlow() {
  const params = useSearchParams();
  const initial = treatments.find((t) => t.slug === params.get("treatment"));
  const initialMinutes = Number(params.get("minutes"));

  const [step, setStep] = useState(initial ? 1 : 0);
  const [slug, setSlug] = useState(initial?.slug ?? null);
  const [minutes, setMinutes] = useState(
    initial?.options.find((o) => o.minutes === initialMinutes)?.minutes ?? initial?.options[0].minutes ?? null,
  );
  const [day, setDay] = useState<Day | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [therapist, setTherapist] = useState<(typeof THERAPIST)[number]["id"]>("any");
  const [name, setName] = useState("");
  const [ref, setRef] = useState("");

  const treatment = treatments.find((t) => t.slug === slug) ?? null;
  const option = treatment?.options.find((o) => o.minutes === minutes) ?? null;
  const slots = day ? slotsFor(day) : [];
  const free = day ? freeSlots(day, slots, `${slug}-${therapist}`, therapist === "any" ? 0.3 : 0.5) : [];

  if (step === 3) {
    return (
      <div className="mx-auto max-w-xl py-8 text-center">
        <p className="font-t-display text-5xl sm:text-6xl">We’ll see you soon, {name.split(" ")[0] || "friend"}.</p>
        <p className="mt-6 text-lg text-t-muted">
          {treatment?.name}, {option?.minutes} minutes, on {day && formatLong(day)} at {time && formatTime(time)}.
        </p>
        <p className="mt-2 text-t-muted">Reference {ref}</p>
        <div className="mt-10 rounded-[2rem] bg-t-surface p-7 text-left">
          <h2 className="font-t-display text-2xl">Before you come</h2>
          <ul className="mt-4 space-y-2 text-t-muted">
            <li>Arrive 20 minutes early to change and settle in.</li>
            <li>Robes, slippers and towels are waiting for you.</li>
            <li>Need to move it? Call {site.phone} at least 24 hours ahead.</li>
          </ul>
        </div>
        <Link href={href("/")} className={`${primary} mt-10 inline-block`}>
          Back to Still Water
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_340px]">
      <div>
        <div className="flex items-center gap-4 text-[15px] text-t-muted">
          <span>Step {step + 1} of 3</span>
          <span aria-hidden className="h-1 flex-1 overflow-hidden rounded-full bg-t-soft">
            <span className="block h-full rounded-full bg-t-accent transition-all duration-500" style={{ width: `${((step + 1) / 3) * 100}%` }} />
          </span>
        </div>

        {step === 0 && (
          <section aria-labelledby="choose" className="mt-8">
            <h2 id="choose" className="font-t-display text-4xl">
              What would you like?
            </h2>
            <div className="mt-8 space-y-10">
              {RITUALS.map((r) => (
                <fieldset key={r.id}>
                  <legend className="font-t-display text-xl text-t-muted">{r.label}</legend>
                  <div className="mt-3 space-y-2">
                    {treatments
                      .filter((t) => t.ritual === r.id)
                      .map((t) => (
                        <div
                          key={t.slug}
                          className={`rounded-2xl p-4 ring-1 transition-colors ${slug === t.slug ? "bg-t-surface ring-2 ring-t-accent" : "ring-t-line"}`}
                        >
                          <p className="font-semibold">{t.name}</p>
                          <p className="text-sm text-t-muted">{t.summary}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {t.options.map((o) => {
                              const on = slug === t.slug && minutes === o.minutes;
                              return (
                                <button
                                  key={o.minutes}
                                  type="button"
                                  aria-pressed={on}
                                  onClick={() => {
                                    setSlug(t.slug);
                                    setMinutes(o.minutes);
                                    setTime(null);
                                  }}
                                  className={`rounded-full px-4 py-2 text-[15px] ring-1 ${
                                    on ? "bg-t-accent text-t-on-accent ring-t-accent" : "ring-t-line hover:ring-t-ink/40"
                                  }`}
                                >
                                  {o.minutes} min · {formatMoney(o.price)}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                  </div>
                </fieldset>
              ))}
            </div>
            <button type="button" className={`${primary} mt-10`} disabled={!option} onClick={() => setStep(1)}>
              Choose a time
            </button>
          </section>
        )}

        {step === 1 && (
          <section aria-labelledby="when" className="mt-8">
            <h2 id="when" className="font-t-display text-4xl">
              When suits you?
            </h2>
            <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,340px)_1fr]">
              <Calendar
                mode="single"
                start={day}
                onSelect={(d) => {
                  setDay(d);
                  setTime(null);
                }}
                className="rounded-[2rem] bg-t-surface p-5"
                headerClassName="mb-3 flex items-center gap-2 font-t-display text-lg"
                navClassName="grid size-9 place-items-center rounded-full text-xl hover:bg-t-soft disabled:opacity-25"
                weekdayClassName="pb-2 text-center text-xs text-t-muted"
                dayClassName="mx-auto grid aspect-square w-full max-w-10 place-items-center rounded-full text-[15px] hover:bg-t-soft disabled:cursor-not-allowed disabled:text-t-line disabled:hover:bg-transparent data-[selected=true]:bg-t-accent data-[selected=true]:text-t-on-accent data-[today=true]:font-bold"
              />
              <div>
                <fieldset>
                  <legend className="font-semibold">Therapist</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {THERAPIST.map((x) => (
                      <button
                        key={x.id}
                        type="button"
                        aria-pressed={therapist === x.id}
                        onClick={() => {
                          setTherapist(x.id);
                          setTime(null);
                        }}
                        className={`rounded-full px-4 py-2 text-[15px] ring-1 ${
                          therapist === x.id ? "bg-t-deep text-t-on-deep ring-t-deep" : "ring-t-line"
                        }`}
                      >
                        {x.label}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="mt-6">
                  <legend className="font-semibold">Start time</legend>
                  {!day ? (
                    <p className="mt-2 text-t-muted">Pick a day to see free times.</p>
                  ) : free.length === 0 ? (
                    <p className="mt-2 text-t-muted">Fully booked. Try another day or any therapist.</p>
                  ) : (
                    <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {free.map((s) => (
                        <button
                          key={s}
                          type="button"
                          aria-pressed={time === s}
                          onClick={() => setTime(s)}
                          className={`rounded-full py-2.5 text-[15px] ring-1 ${
                            time === s ? "bg-t-accent text-t-on-accent ring-t-accent" : "ring-t-line hover:ring-t-ink/40"
                          }`}
                        >
                          {formatTime(s)}
                        </button>
                      ))}
                    </div>
                  )}
                </fieldset>
              </div>
            </div>
            <div className="mt-10 flex items-center gap-6">
              <button type="button" className={primary} disabled={!time} onClick={() => setStep(2)}>
                Continue
              </button>
              <button type="button" onClick={() => setStep(0)} className="underline underline-offset-4">
                Back
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <form
            aria-labelledby="details"
            className="mt-8"
            onSubmit={(e) => {
              e.preventDefault();
              setRef(bookingRef("SW"));
              setStep(3);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <h2 id="details" className="font-t-display text-4xl">
              A little about you
            </h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <label className="block">
                Full name
                <input required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={input} />
              </label>
              <label className="block">
                Mobile
                <input type="tel" required autoComplete="tel" className={input} />
              </label>
              <label className="block sm:col-span-2">
                Email
                <input type="email" required autoComplete="email" className={input} />
              </label>
            </div>
            <fieldset className="mt-8">
              <legend className="font-semibold">So your therapist can take care of you</legend>
              <div className="mt-3 space-y-2">
                {["I’m pregnant", "I have an injury or recent surgery", "I have high blood pressure", "I have skin allergies"].map((h) => (
                  <label key={h} className="flex items-center gap-3">
                    <input type="checkbox" className="size-5 accent-[var(--t-accent)]" />
                    {h}
                  </label>
                ))}
              </div>
              <label className="mt-5 block">
                Anything else?
                <textarea rows={3} className={input} placeholder="Areas to focus on or avoid, pressure preference…" />
              </label>
            </fieldset>
            <p className="mt-6 text-sm text-t-muted">
              Demo: connect your spa booking software here. Payment is taken at the spa; nothing is booked.
            </p>
            <div className="mt-8 flex items-center gap-6">
              <button type="submit" className={primary}>
                Confirm booking
              </button>
              <button type="button" onClick={() => setStep(1)} className="underline underline-offset-4">
                Back
              </button>
            </div>
          </form>
        )}
      </div>

      <aside aria-label="Your booking" className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-[2rem] bg-t-deep p-7 text-t-on-deep">
          <h2 className="font-t-display text-2xl">Your booking</h2>
          {treatment && option ? (
            <dl className="mt-5 space-y-3 text-[15px]">
              <div>
                <dt className="text-t-on-deep/60">Treatment</dt>
                <dd>
                  {treatment.name}, {option.minutes} min
                </dd>
              </div>
              <div>
                <dt className="text-t-on-deep/60">When</dt>
                <dd>{day ? `${formatLong(day)}${time ? `, ${formatTime(time)}` : ""}` : "Not chosen yet"}</dd>
              </div>
              <div>
                <dt className="text-t-on-deep/60">Therapist</dt>
                <dd>{THERAPIST.find((x) => x.id === therapist)!.label}</dd>
              </div>
              <div className="flex justify-between border-t border-white/15 pt-3 text-lg">
                <dt>Total</dt>
                <dd>{formatMoney(option.price)}</dd>
              </div>
              {option.minutes >= 90 && <p className="text-sm text-t-on-deep/70">Includes the thermal circuit.</p>}
            </dl>
          ) : (
            <p className="mt-4 text-t-on-deep/70">Choose a treatment to begin.</p>
          )}
        </div>
      </aside>
    </div>
  );
}
