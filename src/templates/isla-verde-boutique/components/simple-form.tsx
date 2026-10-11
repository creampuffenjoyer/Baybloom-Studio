"use client";

import { formHandler, useDemoSubmit } from "../../_kit/demo-form";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "date" | "time" | "number" | "textarea" | "select";
  options?: string[];
  required?: boolean;
  wide?: boolean;
  min?: number;
  max?: number;
  defaultValue?: string;
};

const input =
  "mt-2 w-full border-0 border-b border-t-line bg-transparent px-0 py-2.5 text-base focus:border-t-alt focus:ring-0 focus:outline-none [color-scheme:light]";

/** A short form for reservations and inquiries, set like a letter. */
export function SimpleForm({ fields, submitLabel, sentTitle, sentBody }: { fields: Field[]; submitLabel: string; sentTitle: string; sentBody: string }) {
  const { status, submit, reset } = useDemoSubmit();

  if (status === "sent") {
    return (
      <div role="status" className="border-l-2 border-t-alt py-2 pl-6">
        <p className="font-t-display text-3xl italic">{sentTitle}</p>
        <p className="mt-2 text-t-muted">{sentBody}</p>
        <button type="button" onClick={reset} className="mt-4 border-b border-t-ink pb-0.5 text-[15px]">
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={formHandler(submit)} className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
      {fields.map((f) => (
        <label key={f.name} className={`block text-[15px] text-t-muted ${f.wide || f.type === "textarea" ? "sm:col-span-2" : ""}`}>
          {f.label}
          {f.type === "textarea" ? (
            <textarea name={f.name} required={f.required} rows={3} className={input} defaultValue={f.defaultValue} />
          ) : f.type === "select" ? (
            <select name={f.name} className={input} defaultValue={f.defaultValue}>
              {f.options?.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          ) : (
            <input
              name={f.name}
              type={f.type ?? "text"}
              required={f.required}
              min={f.min}
              max={f.max}
              defaultValue={f.defaultValue}
              className={input}
            />
          )}
        </label>
      ))}
      <div className="sm:col-span-2">
        <button type="submit" disabled={status === "sending"} className="bg-t-accent px-6 py-3.5 text-t-on-accent hover:bg-t-alt disabled:opacity-60">
          {status === "sending" ? "Sending…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
