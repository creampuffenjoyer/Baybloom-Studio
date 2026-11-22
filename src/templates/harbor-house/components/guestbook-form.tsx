"use client";

import { useHarbor } from "../language";

import { formHandler, useDemoSubmit } from "../../_kit/demo-form";

const input =
  "mt-2 w-full rounded-xl bg-tpl-surface px-4 py-3 ring-1 ring-tpl-line focus:ring-2 focus:ring-tpl-accent focus:outline-none";

export function GuestbookForm() {
  const { t } = useHarbor();
  const { status, submit } = useDemoSubmit();
  if (status === "sent") {
    return <p role="status" className="font-[family-name:var(--hh-hand)] text-3xl text-tpl-accent">{t("Sample note complete. Nothing was published.")}</p>;
  }
  return (
    <form onSubmit={formHandler(submit)} className="grid gap-4 sm:grid-cols-2">
      <label className="block font-semibold">
        {t("Your name")}<input name="name" required className={input} />
      </label>
      <label className="block font-semibold">
        {t("Where from?")}<input name="from" className={input} />
      </label>
      <label className="block font-semibold sm:col-span-2">
        {t("Your note")}<textarea name="note" required rows={4} className={input} />
      </label>
      <p className="text-sm text-tpl-muted sm:col-span-2">{t("Use sample details. This form does not send a reservation or message.")}</p>
      <div>
        <button type="submit" disabled={status === "sending"} className="rounded-full bg-tpl-accent px-6 py-3 font-bold text-tpl-on-accent">
          {status === "sending" ? t("Signing…") : t("Sign the guestbook")}
        </button>
      </div>
    </form>
  );
}
