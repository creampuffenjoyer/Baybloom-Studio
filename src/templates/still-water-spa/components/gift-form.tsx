"use client";

import { useState } from "react";
import { formatMoney } from "../../_kit/dates";
import { formHandler, useDemoSubmit } from "../../_kit/demo-form";
import { packages, treatments } from "../content";

const input =
  "mt-2 w-full rounded-2xl bg-t-surface px-4 py-3 text-base ring-1 ring-t-line focus:ring-2 focus:ring-t-accent focus:outline-none";

const choices = [
  ...[2500, 5000].map((v) => ({ id: `amount-${v}`, label: `${formatMoney(v)} to spend`, price: v })),
  { id: treatments[0].slug, label: `${treatments[0].name}, ${treatments[0].options[0].minutes} min`, price: treatments[0].options[0].price },
  { id: "package", label: packages[0].name, price: packages[0].price },
];

export function GiftForm() {
  const [choice, setChoice] = useState(choices[0].id);
  const { status, submit } = useDemoSubmit();
  const picked = choices.find((c) => c.id === choice)!;

  if (status === "sent") {
    return (
      <div role="status" className="rounded-[2rem] bg-t-surface p-10 text-center">
        <p className="font-t-display text-4xl">A gift of quiet, on its way.</p>
        <p className="mt-4 text-t-muted">We’ve emailed the gift card. It’s valid for twelve months.</p>
      </div>
    );
  }

  return (
    <form onSubmit={formHandler(submit)} className="space-y-8">
      <fieldset>
        <legend className="font-t-display text-2xl">Choose a gift</legend>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {choices.map((c) => (
            <label key={c.id} className="cursor-pointer rounded-2xl bg-t-surface p-5 ring-1 ring-t-line has-checked:ring-2 has-checked:ring-t-accent">
              <input type="radio" name="gift" value={c.id} checked={choice === c.id} onChange={() => setChoice(c.id)} className="sr-only" />
              <span className="block font-semibold">{c.label}</span>
              <span className="text-t-muted">{formatMoney(c.price)}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          To
          <input name="to" required className={input} />
        </label>
        <label className="block">
          Their email
          <input name="toEmail" type="email" required className={input} />
        </label>
        <label className="block">
          From
          <input name="from" required className={input} />
        </label>
        <label className="block">
          Your email
          <input name="fromEmail" type="email" required className={input} />
        </label>
        <label className="block sm:col-span-2">
          A short note
          <textarea name="note" rows={3} className={input} />
        </label>
      </div>
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-full bg-t-accent px-7 py-3.5 font-semibold text-t-on-accent disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : `Send gift card · ${formatMoney(picked.price)}`}
      </button>
      <p className="text-sm text-t-muted">Demo: connect your payment provider here. No payment is taken.</p>
    </form>
  );
}
