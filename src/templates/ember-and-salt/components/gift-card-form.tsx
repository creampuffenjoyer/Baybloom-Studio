"use client";
import { useEmberCopy } from "../copy";

import { useState } from "react";
import { bookingRef } from "../../_kit/availability";
import { formatMoney } from "../../_kit/dates";
import { useDemoSubmit } from "../../_kit/demo-form";
import { giftAmounts } from "../content";
import { usePersonalization } from "../personalization";

const input =
  "mt-2 w-full border border-tpl-line bg-tpl-surface px-4 py-3 text-base text-tpl-ink focus:border-tpl-accent focus:outline-none";

export function GiftCardForm() {
  const t = useEmberCopy();
  const { business } = usePersonalization();
  const [amount, setAmount] = useState(giftAmounts[1]);
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");
  const { status, submit } = useDemoSubmit();

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_420px]">
      {status === "sent" ? (
        <div role="status">
          <p className="font-tpl-display text-5xl">Sample gift card.</p>
          <p className="mt-4 text-lg text-tpl-muted">
            Sample for {to || "your recipient"}{t(", amount")}{formatMoney(amount)}{t(", reference")}{" "}
            <span className="text-tpl-ink">{code}</span>. No payment was taken and no gift card was sent.
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
            <legend className="font-tpl-display text-3xl">{t("Choose an amount")}</legend>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {giftAmounts.map((a) => (
                <button
                  key={a}
                  type="button"
                  aria-pressed={amount === a}
                  onClick={() => setAmount(a)}
                  className={`border py-4 font-tpl-display text-xl ${
                    amount === a ? "border-tpl-accent bg-tpl-accent text-tpl-on-accent" : "border-tpl-line hover:border-tpl-ink"
                  }`}
                >
                  {formatMoney(a)}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">{t("Recipient’s name")}<input name="to" required value={to} onChange={(e) => setTo(e.target.value)} className={input} />
            </label>
            <label className="block">{t("Recipient’s email")}<input name="toEmail" type="email" required className={input} />
            </label>
            <label className="block">{t("Your name")}<input name="from" required autoComplete="name" className={input} />
            </label>
            <label className="block">{t("Send on")}<input name="sendOn" type="date" className={`${input} [color-scheme:dark]`} />
            </label>
            <label className="block sm:col-span-2">{t("Message")}<textarea
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
            className="bg-tpl-accent px-7 py-4 text-lg font-semibold text-tpl-on-accent hover:bg-tpl-alt disabled:opacity-60"
          >
            {status === "sending" ? "Processing…" : `Try a ${formatMoney(amount)} sample gift card`}
          </button>
          <p className="text-sm text-tpl-muted">Sample only. No payment is taken and no gift card is sent.</p>
        </form>
      )}

      {/* Live preview of the card */}
      <div aria-hidden className="lg:sticky lg:top-36 lg:self-start">
        <div className="relative aspect-[1.6] overflow-hidden bg-tpl-deep p-7 ring-1 ring-tpl-line">
          <div className="absolute -right-10 -bottom-16 size-56 rounded-full bg-tpl-alt/30 blur-3xl" />
          <p className="font-tpl-display text-2xl">{business?.name || <>{t("Ember")}<span className="text-tpl-accent">{t("&amp;")}</span>{t("Salt")}</>}</p>
          <p className="mt-6 font-tpl-display text-5xl text-tpl-accent">{formatMoney(amount)}</p>
          <p className="mt-4 line-clamp-2 text-sm text-tpl-ink/80">{message || "A dinner by the fire, on us."}</p>
          <p className="absolute bottom-6 left-7 text-sm text-tpl-muted">{t("For")}{to || "someone special"}</p>
        </div>
      </div>
    </div>
  );
}
