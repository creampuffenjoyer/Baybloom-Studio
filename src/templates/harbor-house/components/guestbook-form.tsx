"use client";

import { formHandler, useDemoSubmit } from "../../_kit/demo-form";

const input =
  "mt-2 w-full rounded-xl bg-tpl-surface px-4 py-3 ring-1 ring-tpl-line focus:ring-2 focus:ring-tpl-accent focus:outline-none";

export function GuestbookForm() {
  const { status, submit } = useDemoSubmit();
  if (status === "sent") {
    return <p className="font-[family-name:var(--hh-hand)] text-3xl text-tpl-accent">Thank you! We’ll pin it up in the hallway.</p>;
  }
  return (
    <form onSubmit={formHandler(submit)} className="grid gap-4 sm:grid-cols-2">
      <label className="block font-semibold">
        Your name
        <input name="name" required className={input} />
      </label>
      <label className="block font-semibold">
        Where from?
        <input name="from" className={input} />
      </label>
      <label className="block font-semibold sm:col-span-2">
        Your note
        <textarea name="note" required rows={4} className={input} />
      </label>
      <div>
        <button type="submit" disabled={status === "sending"} className="rounded-full bg-tpl-accent px-6 py-3 font-bold text-tpl-on-accent">
          {status === "sending" ? "Signing…" : "Sign the guestbook"}
        </button>
      </div>
    </form>
  );
}
