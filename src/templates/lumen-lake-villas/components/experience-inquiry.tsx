"use client";

import { useState } from "react";
import { formHandler, useDemoSubmit } from "../../_kit/demo-form";

const input = "mt-1 w-full border-0 border-b border-tpl-line bg-transparent px-0 py-2 focus:border-tpl-accent focus:ring-0 focus:outline-none";

/** A small inquiry form that opens under each experience. */
export function ExperienceInquiry({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const { status, submit } = useDemoSubmit();

  if (status === "sent") return <p className="mt-6 text-sm">Thank you. We’ll confirm “{name}” by email within a day.</p>;

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-6 border-b border-tpl-ink pb-0.5 text-sm">
        Ask about this
      </button>
    );
  }

  return (
    <form onSubmit={formHandler(submit)} className="mt-6 grid max-w-md gap-4 text-sm">
      <input type="hidden" name="experience" value={name} />
      <label className="block text-tpl-muted">
        Name
        <input name="name" required autoComplete="name" className={input} />
      </label>
      <label className="block text-tpl-muted">
        Email
        <input name="email" type="email" required autoComplete="email" className={input} />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block text-tpl-muted">
          Date
          <input name="date" type="date" className={input} />
        </label>
        <label className="block text-tpl-muted">
          People
          <input name="people" type="number" min={1} max={12} defaultValue={2} className={input} />
        </label>
      </div>
      <div className="flex items-center gap-6">
        <button type="submit" disabled={status === "sending"} className="bg-tpl-accent px-5 py-3 text-tpl-on-accent">
          {status === "sending" ? "Sending…" : "Send"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-tpl-muted">
          Cancel
        </button>
      </div>
    </form>
  );
}
