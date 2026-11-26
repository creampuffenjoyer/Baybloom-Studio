"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useDemoSubmit } from "./demo-form";
import { action, input, label, outlineAction } from "./hospitality-site";

export function SampleRequest({ children, submitLabel, confirmation, validate }: {
  children: ReactNode;
  submitLabel: string;
  confirmation: string;
  validate?: (form: FormData) => string | undefined;
}) {
  const { status, submit, reset } = useDemoSubmit();
  const [error, setError] = useState<string>();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status !== "idle") return;
    const form = new FormData(event.currentTarget);
    const issue = validate?.(form);
    setError(issue);
    if (!issue) void submit(form);
  }

  return (
    <div>
      <p role="status" className={status === "sent" ? "mb-4 text-lg font-semibold" : "sr-only"}>
        {status === "sent" ? confirmation : status === "sending" ? "Preparing sample request…" : ""}
      </p>
      {status === "sent" ? <button type="button" className={outlineAction} onClick={reset}>Start another sample</button> : (
        <form onSubmit={handleSubmit} className="grid gap-5" aria-busy={status === "sending"}>
          <p className="border-l-2 border-tpl-accent pl-3 text-sm text-tpl-muted">Demo only. Use sample details. No order, reservation, or message will be sent.</p>
          <fieldset disabled={status === "sending"} className="grid min-w-0 gap-5">
            {children}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={label}>Name<input className={input} name="name" autoComplete="name" maxLength={100} required /></label>
              <label className={label}>Email<input className={input} name="email" type="email" autoComplete="email" maxLength={254} required /></label>
            </div>
            {error && <p role="alert" className="font-semibold text-tpl-accent">{error}</p>}
            <button type="submit" className={`${action} justify-self-start disabled:cursor-wait disabled:opacity-70`}>{status === "sending" ? "Preparing…" : submitLabel}</button>
          </fieldset>
        </form>
      )}
    </div>
  );
}
