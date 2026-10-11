"use client";

import { formHandler, useDemoSubmit } from "../../_kit/demo-form";

export function Newsletter() {
  const { status, submit } = useDemoSubmit();
  if (status === "sent") return <p>Thank you. We’ll be in touch, gently.</p>;
  return (
    <form onSubmit={formHandler(submit)} className="flex max-w-md gap-2">
      <label htmlFor="sw-news" className="sr-only">
        Email address
      </label>
      <input
        id="sw-news"
        name="email"
        type="email"
        required
        placeholder="Email address"
        className="h-12 min-w-0 flex-1 rounded-full bg-white/10 px-5 text-tpl-on-deep placeholder:text-tpl-on-deep/50 focus:bg-white/15 focus:outline-none"
      />
      <button type="submit" disabled={status === "sending"} className="h-12 rounded-full bg-tpl-on-deep px-5 font-semibold text-tpl-deep">
        Join
      </button>
    </form>
  );
}
