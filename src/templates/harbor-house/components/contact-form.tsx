"use client";

import { formHandler, useDemoSubmit } from "../../_kit/demo-form";

const input =
  "mt-2 w-full rounded-xl bg-tpl-surface px-4 py-3 ring-1 ring-tpl-line focus:ring-2 focus:ring-tpl-accent focus:outline-none";

export function ContactForm() {
  const { status, submit } = useDemoSubmit();
  if (status === "sent") {
    return <p className="font-[family-name:var(--hh-hand)] text-3xl text-tpl-accent">Got it! We’ll write back today.</p>;
  }
  return (
    <form onSubmit={formHandler(submit)} className="grid gap-4">
      <label className="block font-semibold">
        Your name
        <input name="name" required autoComplete="name" className={input} />
      </label>
      <label className="block font-semibold">
        Email
        <input name="email" type="email" required autoComplete="email" className={input} />
      </label>
      <label className="block font-semibold">
        Message
        <textarea name="message" required rows={4} className={input} />
      </label>
      <div>
        <button type="submit" disabled={status === "sending"} className="rounded-full bg-tpl-accent px-6 py-3 font-bold text-tpl-on-accent">
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
