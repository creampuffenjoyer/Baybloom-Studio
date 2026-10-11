"use client";

import { useState } from "react";
import { bookingRef } from "../../_kit/availability";
import { formatMoney } from "../../_kit/dates";
import { useDemoSubmit } from "../../_kit/demo-form";
import { giftAmounts } from "../content";

const input =
  "mt-2 w-full border border-t-line bg-t-surface px-4 py-3 text-base text-t-ink focus:border-t-accent focus:outline-none";

export function GiftCardForm() {
  const [amount, setAmount] = useState(giftAmounts[1]);
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");
  const { status, submit } = useDemoSubmit();

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_420px]">
      {status === "sent" ? (
        <div role="status">
          <p className="font-t-display text-5xl">Gift card sent.</p>
          <p className="mt-4 text-lg text-t-muted">
            {to || "Your recipient"} will receive a {formatMoney(amount)} gift card by email, code{" "}
            <span className="text-t-ink">{code}</span>. Valid for 12 months on food and drink.
          </p>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setCode(bookingRef("GIFT"));
            submit(new FormData(e.currentTarget));
          }}
          className="space-y-8"
        >
          <fieldset>
            <legend className="font-t-display text-3xl">Choose an amount</legend>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {giftAmounts.map((a) => (
                <button
                  key={a}
                  type="button"
                  aria-pressed={amount === a}
                  onClick={() => setAmount(a)}
                  className={`border py-4 font-t-display text-xl ${
                    amount === a ? "border-t-accent bg-t-accent text-t-on-accent" : "border-t-line hover:border-t-ink"
                  }`}
                >
                  {formatMoney(a)}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              Recipient’s name
              <input name="to" required value={to} onChange={(e) => setTo(e.target.value)} className={input} />
            </label>
            <label className="block">
              Recipient’s email
              <input name="toEmail" type="email" required className={input} />
            </label>
            <label className="block">
              Your name
              <input name="from" required autoComplete="name" className={input} />
            </label>
            <label className="block">
              Send on
              <input name="sendOn" type="date" className={`${input} [color-scheme:dark]`} />
            </label>
            <label className="block sm:col-span-2">
              Message
              <textarea
                name="message"
                rows={3}
                maxLength={200}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={input}
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={status === "sending"}
            className="bg-t-accent px-7 py-4 text-lg font-semibold text-t-on-accent hover:bg-t-alt disabled:opacity-60"
          >
            {status === "sending" ? "Processing…" : `Buy ${formatMoney(amount)} gift card`}
          </button>
          <p className="text-sm text-t-muted">Demo: connect your payment provider here. No payment is taken.</p>
        </form>
      )}

      {/* Live preview of the card */}
      <div aria-hidden className="lg:sticky lg:top-36 lg:self-start">
        <div className="relative aspect-[1.6] overflow-hidden bg-t-deep p-7 ring-1 ring-t-line">
          <div className="absolute -right-10 -bottom-16 size-56 rounded-full bg-t-alt/30 blur-3xl" />
          <p className="font-t-display text-2xl">
            Ember <span className="text-t-accent">&amp;</span> Salt
          </p>
          <p className="mt-6 font-t-display text-5xl text-t-accent">{formatMoney(amount)}</p>
          <p className="mt-4 line-clamp-2 text-sm text-t-ink/80">{message || "A dinner by the fire, on us."}</p>
          <p className="absolute bottom-6 left-7 text-sm text-t-muted">For {to || "someone special"}</p>
        </div>
      </div>
    </div>
  );
}
