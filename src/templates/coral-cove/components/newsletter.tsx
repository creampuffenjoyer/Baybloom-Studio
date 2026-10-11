"use client";

import { formHandler, useDemoSubmit } from "../../_kit/demo-form";

export function Newsletter() {
  const { status, submit } = useDemoSubmit();
  if (status === "sent") {
    return <p className="text-lg">You’re on the list. Watch for our next tide-table of offers.</p>;
  }
  return (
    <form onSubmit={formHandler(submit)} className="flex max-w-md flex-col gap-3 sm:flex-row">
      <label htmlFor="cc-news" className="sr-only">
        Email address
      </label>
      <input
        id="cc-news"
        name="email"
        type="email"
        required
        placeholder="you@example.com"
        className="h-12 min-w-0 flex-1 rounded-full border border-white/30 bg-white/10 px-5 text-white placeholder:text-white/55 focus:border-white focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="h-12 rounded-full bg-white px-6 font-semibold text-tpl-deep disabled:opacity-70"
      >
        {status === "sending" ? "Subscribing…" : "Subscribe"}
      </button>
    </form>
  );
}
