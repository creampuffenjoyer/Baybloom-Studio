"use client";
import { useEmberCopy } from "../copy";

import { formHandler, useDemoSubmit } from "../../_kit/demo-form";
import { useEmberData } from "../data";

const input =
  "mt-2 w-full border border-tpl-line bg-tpl-surface px-4 py-3 text-base text-tpl-ink focus:border-tpl-accent focus:outline-none";

export function InquiryForm() {
  const t = useEmberCopy();
  const { spaces } = useEmberData();
  const { status, submit, reset } = useDemoSubmit();

  if (status === "sent") {
    return (
      <div role="status" className="border border-tpl-accent p-8">
        <p className="font-tpl-display text-4xl">{t("Thank you.")}</p>
        <p className="mt-3 text-tpl-muted">
          This was a sample inquiry. No message was sent and no reply is scheduled.
        </p>
        <button type="button" onClick={reset} className="mt-6 text-tpl-accent underline underline-offset-4">{t("Send another inquiry")}</button>
      </div>
    );
  }

  return (
    <form onSubmit={formHandler(submit)} className="grid gap-5 sm:grid-cols-2">
      <p className="text-sm text-tpl-muted sm:col-span-2">Sample inquiry only. Nothing will be sent.</p>
      <label className="block">{t("Name")}<input name="name" required autoComplete="name" className={input} />
      </label>
      <label className="block">{t("Email")}<input name="email" type="email" required autoComplete="email" className={input} />
      </label>
      <label className="block">{t("Preferred date")}<input name="date" type="date" required className={`${input} [color-scheme:dark]`} />
      </label>
      <label className="block">{t("Guests")}<input name="guests" type="number" min={2} max={90} required defaultValue={12} className={input} />
      </label>
      <label className="block sm:col-span-2">{t("Space")}<select name="space" className={input} defaultValue={spaces[0].slug}>
          {spaces.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name} ({s.seats.toLowerCase()})
            </option>
          ))}
          <option value="unsure">{t("Not sure yet")}</option>
        </select>
      </label>
      <label className="block sm:col-span-2">{t("Tell us about the occasion")}<textarea name="message" rows={4} className={input} />
      </label>
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={status === "sending"}
          className="bg-tpl-accent px-7 py-4 text-lg font-semibold text-tpl-on-accent hover:bg-tpl-alt disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Send inquiry"}
        </button>
      </div>
    </form>
  );
}
