"use client";
import { useCoral } from "../language";

import { formHandler, useDemoSubmit } from "../../_kit/demo-form";

export function Newsletter() {
  const { t } = useCoral();
  const { status, submit } = useDemoSubmit();
  if (status === "sent") {
    return <p role="status" className="text-lg">{t("Sample complete. No subscription was created.")}</p>;
  }
  return (
    <form onSubmit={formHandler(submit)} className="flex max-w-md flex-col gap-3 sm:flex-row">
      <label htmlFor="cc-news" className="sr-only">{t("Email address")}</label>
      <input
        id="cc-news"
        name="email"
        type="email"
        required
        placeholder="you@example.com"
        className="h-12 min-w-0 flex-1 rounded-lg border border-white/30 bg-transparent px-4 text-white placeholder:text-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="h-12 rounded-lg bg-white px-6 font-medium text-tpl-deep transition-colors hover:bg-tpl-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-70"
      >
        {status === "sending" ? t("Trying…") : t("Try signup")}
      </button>
    </form>
  );
}
