"use client";

import { formHandler, useDemoSubmit } from "../../_kit/demo-form";

const input = "mt-1.5 w-full rounded-md bg-tpl-surface px-4 py-3 ring-1 ring-tpl-line focus:ring-2 focus:ring-tpl-accent focus:outline-none";

/** Gear rental or general inquiry. */
export function RentalForm() {
  const { status, submit, reset } = useDemoSubmit();
  if (status === "sent") {
    return (
      <div role="status" className="rounded-md bg-tpl-deep p-7 text-tpl-on-deep">
        <p className="font-tpl-display text-3xl font-bold">Request received.</p>
        <p className="mt-2 text-tpl-on-deep/80">We’ll have your gear sized and waiting in the boot room.</p>
        <button type="button" onClick={reset} className="mt-4 font-bold text-tpl-accent underline underline-offset-4">
          Send another request
        </button>
      </div>
    );
  }
  return (
    <form onSubmit={formHandler(submit)} className="grid gap-4 sm:grid-cols-2">
      <label className="block font-medium">
        Name
        <input name="name" required autoComplete="name" className={input} />
      </label>
      <label className="block font-medium">
        Email
        <input name="email" type="email" required autoComplete="email" className={input} />
      </label>
      <label className="block font-medium">
        I’d like to
        <select name="topic" className={input} defaultValue="rental">
          <option value="rental">Rent gear</option>
          <option value="guide">Book a guide</option>
          <option value="group">Plan a group trip</option>
          <option value="other">Ask something else</option>
        </select>
      </label>
      <label className="block font-medium">
        Dates
        <input name="dates" placeholder="e.g. 12–15 Feb" className={input} />
      </label>
      <fieldset className="sm:col-span-2">
        <legend className="font-medium">Gear</legend>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
          {["Skis", "Snowboard", "Snowshoes", "Mountain bike", "Canoe", "Hiking poles"].map((g) => (
            <label key={g} className="flex items-center gap-2">
              <input type="checkbox" name="gear" value={g} className="size-4 accent-[var(--t-accent)]" />
              {g}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block font-medium sm:col-span-2">
        Sizes and notes
        <textarea name="notes" rows={3} placeholder="Heights, boot sizes, ability…" className={input} />
      </label>
      <div>
        <button type="submit" disabled={status === "sending"} className="rounded-md bg-tpl-accent px-6 py-3 font-bold text-tpl-on-accent">
          {status === "sending" ? "Sending…" : "Send request"}
        </button>
      </div>
    </form>
  );
}
