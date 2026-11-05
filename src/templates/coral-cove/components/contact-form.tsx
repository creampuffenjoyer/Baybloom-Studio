"use client";
import { useCoral } from "../language";

import { formHandler, useDemoSubmit } from "../../_kit/demo-form";

const input =
  "mt-2 w-full rounded-2xl border border-tpl-line bg-white px-4 py-3 text-base focus:border-tpl-deep focus:ring-2 focus:ring-tpl-alt focus:outline-none";

export function ContactForm() {
  const { t } = useCoral();
  const { status, submit, reset } = useDemoSubmit();

  if (status === "sent") {
    return (
      <div role="status" className="rounded-3xl bg-tpl-deep p-8 text-white sm:p-10">
        <p className="font-tpl-display text-3xl font-bold tracking-tight">{t("Sample message complete.")}</p>
        <p className="mt-3 text-white/80">{t("Nothing was sent. This form demonstrates the guest enquiry experience.")}</p>
        <button type="button" onClick={reset} className="mt-6 font-semibold underline underline-offset-4">{t("Try another message")}</button>
      </div>
    );
  }

  return (
    <form onSubmit={formHandler(submit)} className="grid gap-5 sm:grid-cols-2">
      <p className="text-tpl-muted sm:col-span-2">{t("Sample form. Use fictional details; no message will be sent.")}</p>
      <label className="block">
        <span className="font-semibold">{t("Your name")}</span>
        <input name="name" required autoComplete="name" className={input} />
      </label>
      <label className="block">
        <span className="font-semibold">{t("Email")}</span>
        <input name="email" type="email" required autoComplete="email" className={input} />
      </label>
      <label className="block">
        <span className="font-semibold">{t("Phone or WhatsApp")}</span>
        <span className="text-tpl-muted">{" "}{t("(optional)")}</span>
        <input name="phone" type="tel" autoComplete="tel" className={input} />
      </label>
      <label className="block">
        <span className="font-semibold">{t("What’s it about?")}</span>
        <select name="topic" className={input} defaultValue="stay">
          <option value="stay">{t("Planning a stay")}</option>
          <option value="booking">{t("An existing booking")}</option>
          <option value="celebration">{t("Honeymoon or celebration")}</option>
          <option value="group">{t("Group or retreat")}</option>
          <option value="other">{t("Something else")}</option>
        </select>
      </label>
      <label className="block sm:col-span-2">
        <span className="font-semibold">{t("Message")}</span>
        <textarea name="message" required rows={5} className={input} />
      </label>
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-full bg-tpl-accent px-7 py-3.5 text-lg font-bold text-tpl-on-accent disabled:opacity-70"
        >
          {status === "sending" ? t("Trying…") : t("Try sample message")}
        </button>
      </div>
    </form>
  );
}
