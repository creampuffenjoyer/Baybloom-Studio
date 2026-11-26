"use client";

import { LocalLink as Link } from "../language";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { bookingRef } from "../../_kit/availability";
import { Calendar } from "../../_kit/calendar";
import { formatLong, isDay, type Day } from "../../_kit/dates";
import { useBloomfield } from "../language";
import { isDateFree } from "../content";
import { href } from "../site";
import { Sprig } from "./sprig";

const STEPS = ["Your date", "Your celebration", "About you"];
const EVENTS = ["Wedding", "Elopement", "Engagement party", "Anniversary", "Corporate event"];

const input =
  "mt-2 w-full rounded-xl bg-tpl-surface px-4 py-3 text-base ring-1 ring-tpl-line focus:ring-2 focus:ring-tpl-alt focus:outline-none";
const primary = "rounded-full bg-tpl-accent px-7 py-3.5 text-tpl-on-accent disabled:cursor-not-allowed disabled:opacity-40";

export function InquiryFlow() {
  const { language, translate: t, packages, spaces } = useBloomfield();
  const locale = language === "tl" ? "fil-PH" : "en-GB";
  const params = useSearchParams();
  const qDate = params.get("date");
  const startDate = isDay(qDate) && isDateFree(qDate) ? qDate : null;

  const [step, setStep] = useState(startDate ? 1 : 0);
  const [day, setDay] = useState<Day | null>(startDate);
  const [flexible, setFlexible] = useState(false);
  const [event, setEvent] = useState(EVENTS[0]);
  const [guests, setGuests] = useState(() => { const n = Number(params.get("guests")); return Number.isInteger(n) && n >= 2 && n <= 250 ? n : 100; });
  const [chosen, setChosen] = useState<string[]>(() => {
    const s = params.get("space");
    return s && spaces.some((x) => x.slug === s) ? [s] : [];
  });
  const [pkg, setPkg] = useState(() => packages.find((p) => p.name === params.get("package"))?.name ?? "Not sure yet");
  const [contact, setContact] = useState({ names: "", email: "", phone: "", notes: "" });
  const [phoneInvalid, setPhoneInvalid] = useState(false);
  const [ref, setRef] = useState("");
  const selectedDate = day && !flexible ? formatLong(day, locale) : null;

  const toggleSpace = (slug: string) =>
    setChosen((c) => (c.includes(slug) ? c.filter((x) => x !== slug) : [...c, slug]));

  if (step === 3) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <Sprig className="mx-auto w-32 text-tpl-alt" />
        <p className="mt-6 font-tpl-display text-6xl font-medium italic">{t("Thank you, {names}.").replace("{names}", () => contact.names.trim() || t("both"))}</p>
        <p className="mt-5 text-lg text-tpl-muted">{selectedDate ? t("Sample date: {date}.").replace("{date}", selectedDate) : t("Your sample inquiry has a flexible date.")}</p>
        <p className="mt-3 text-tpl-muted">{t("Sample reference {ref}. No date is held, no message is sent, and no call is scheduled.").replace("{ref}", ref)}</p>
        <Link href={href("/spaces")} className={`${primary} mt-10 inline-block`}>
          {t("Wander the estate")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <ol className="flex flex-wrap justify-center gap-3 sm:gap-8" aria-label={t("Inquiry steps")}>
        {STEPS.map((s, i) => (
          <li key={s} aria-current={i === step ? "step" : undefined} className="flex items-center gap-2 text-[15px]">
            <span className={`size-2.5 rounded-full ${i <= step ? "bg-tpl-alt" : "bg-tpl-line"}`} />
            <span className={i === step ? "text-tpl-ink" : "text-tpl-muted"}>{t(s)}</span>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <section aria-labelledby="s-date" className="mt-12">
          <h2 id="s-date" className="text-center font-tpl-display text-5xl italic">
            {t("When would you like to celebrate?")}
          </h2>
          <div className="mx-auto mt-10 max-w-md">
            <Calendar
              mode="single"
              start={day}
              onSelect={(d) => setDay(d)}
              isDisabled={(d) => !isDateFree(d)}
              locale={locale}
              labels={{ previous: t("Previous month"), next: t("Next month"), to: t("to") }}
              className="rounded-[1.5rem] bg-tpl-surface p-5 ring-1 ring-tpl-line"
              headerClassName="mb-3 flex items-center gap-2 font-tpl-display text-2xl italic"
              navClassName="grid size-9 place-items-center rounded-full text-xl hover:bg-tpl-soft disabled:opacity-25"
              weekdayClassName="pb-2 text-center text-xs text-tpl-muted"
              dayClassName="mx-auto grid aspect-square w-full max-w-10 place-items-center rounded-full text-[15px] hover:bg-tpl-soft disabled:cursor-not-allowed disabled:line-through disabled:opacity-35 data-[selected=true]:bg-tpl-alt data-[selected=true]:text-white"
            />
            <label className="mt-5 flex items-center gap-3">
              <input type="checkbox" checked={flexible} onChange={(e) => setFlexible(e.target.checked)} className="size-5 accent-[var(--t-alt)]" />
              {t("We’re flexible on the date")}
            </label>
          </div>
          <div className="mt-10 text-center">
            <button type="button" className={primary} disabled={!day && !flexible} onClick={() => setStep(1)}>
              {selectedDate ? t("Continue with {date}").replace("{date}", selectedDate) : t("Continue")}
            </button>
          </div>
        </section>
      )}

      {step === 1 && (
        <section aria-labelledby="s-event" className="mt-12 space-y-10">
          <h2 id="s-event" className="text-center font-tpl-display text-5xl italic">
            {t("Tell us about the day")}
          </h2>
          <fieldset>
            <legend className="text-lg">{t("What are you celebrating?")}</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {EVENTS.map((e) => (
                <button
                  key={e}
                  type="button"
                  aria-pressed={event === e}
                  onClick={() => setEvent(e)}
                  className={`rounded-full px-5 py-2.5 ring-1 ${event === e ? "bg-tpl-deep text-tpl-on-deep ring-tpl-deep" : "ring-tpl-line hover:bg-tpl-soft"}`}
                >
                  {t(e)}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="block">
            <span className="text-lg">
              {t("Roughly how many guests?")} <span className="font-tpl-display text-3xl">{guests}</span>
            </span>
            <input
              type="range"
              min={2}
              max={250}
              step={1}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="mt-4 block w-full accent-[var(--t-alt)]"
            />
          </label>
          <fieldset>
            <legend className="text-lg">{t("Spaces you love")}</legend>
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
                      <span className="text-sm text-tpl-muted">{small ? t("Up to {count} guests").replace("{count}", String(cap)) : s.kind}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          <label className="block">
            <span className="text-lg">{t("Package")}</span>
            <select value={pkg} onChange={(e) => setPkg(e.target.value)} className={input}>
              {packages.map((p) => (
                <option key={p.name} value={p.name}>{t(p.name)}</option>
              ))}
              <option value="Not sure yet">{t("Not sure yet")}</option>
            </select>
          </label>
          <div className="flex justify-center gap-6">
            <button type="button" onClick={() => setStep(0)} className="underline underline-offset-4">
              {t("Back")}
            </button>
            <button type="button" className={primary} onClick={() => setStep(2)}>
              {t("Continue")}
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
            const phone = contact.phone.trim();
            if (!/^\+?[\d(). -]+$/.test(phone) || !/\d/.test(phone)) {
              setPhoneInvalid(true);
              e.currentTarget.querySelector<HTMLInputElement>("#inquiry-phone")?.focus();
              return;
            }
            setRef(bookingRef("BG"));
            setStep(3);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <h2 id="s-you" className="text-center font-tpl-display text-5xl italic">
            {t("And a little about you")}
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              {t("Your names")}
              <input required value={contact.names} onChange={(e) => setContact({ ...contact, names: e.target.value })} placeholder={t("e.g. Bea and Marco")} className={input} />
            </label>
            <label className="block">
              {t("Email")}
              <input type="email" required autoComplete="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} className={input} />
            </label>
            <div>
              <label htmlFor="inquiry-phone">{t("Phone")}</label>
              <input id="inquiry-phone" type="tel" required autoComplete="tel" className={input}
                value={contact.phone} onChange={(e) => {
                  setContact({ ...contact, phone: e.target.value });
                  setPhoneInvalid(false);
                }}
                aria-invalid={phoneInvalid || undefined} aria-describedby={phoneInvalid ? "inquiry-phone-error" : undefined} />
              {phoneInvalid && <p id="inquiry-phone-error" role="alert" className="mt-2 text-sm text-tpl-ink">{t("Enter a phone number with digits. You can use spaces, parentheses or hyphens.")}</p>}
            </div>
            <label className="block sm:col-span-2">
              {t("Anything you’re dreaming of?")}
              <textarea rows={4} className={input} value={contact.notes} onChange={(e) => setContact({ ...contact, notes: e.target.value })} placeholder={t("A lechon at midnight, a string quartet, a rain plan…")} />
            </label>
          </div>
          <div className="mt-6 rounded-xl bg-tpl-soft p-5 text-[15px]">
            <p>
              {t("{event} for about {guests} guests").replace("{event}", t(event)).replace("{guests}", String(guests))}
              {selectedDate ? t(" on {date}").replace("{date}", selectedDate) : t(", date flexible")}
              {chosen.length > 0 && t(", interested in {spaces}").replace("{spaces}", () => chosen.map((slug) => spaces.find((space) => space.slug === slug)!.name).join(", "))}.
            </p>
          </div>
          <p className="mt-4 text-sm text-tpl-muted">{t("Sample inquiry only. No message is sent and no date is held.")}</p>
          <div className="mt-8 flex justify-center gap-6">
            <button type="button" onClick={() => setStep(1)} className="underline underline-offset-4">
              {t("Back")}
            </button>
            <button type="submit" className={primary}>
              {t("Send inquiry")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
