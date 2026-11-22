"use client";

import { useState } from "react";

/**
 * Form state for the demo. Submissions wait briefly and succeed without
 * sending anything. In a real deployment, replace `send` with a call to your
 * email service, CRM or booking engine (see the setup guide).
 */
export function useDemoSubmit<T = FormData>(send?: (data: T) => Promise<void>) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  async function submit(data: T) {
    setStatus("sending");
    await (send ? send(data) : new Promise((r) => setTimeout(r, 700)));
    setStatus("sent");
  }

  return { status, submit, reset: () => setStatus("idle") };
}

/** onSubmit handler that collects the form's fields and calls `submit`. */
export function formHandler(submit: (data: FormData) => unknown) {
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit(new FormData(e.currentTarget));
  };
}
