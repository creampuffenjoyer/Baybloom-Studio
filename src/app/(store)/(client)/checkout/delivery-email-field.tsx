"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DeliveryEmailField({ email, accountEmail, onChange, onVerified, disabled, locked }: {
  email: string;
  accountEmail: string;
  onChange: (email: string) => void;
  onVerified: (email: string) => void;
  disabled: boolean;
  locked: boolean;
}) {
  const [sentTo, setSentTo] = useState("");
  const [confirmed, setConfirmed] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const recipient = email.trim().toLowerCase();
  const alternate = recipient !== accountEmail.toLowerCase();

  async function submit(action: "send" | "verify") {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/checkout/delivery-email", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, email: recipient, ...(action === "verify" && { code }) }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Email verification failed. Try again.");
      } else if (result.verified) {
        setConfirmed(recipient);
        onVerified(recipient);
      } else {
        setSentTo(recipient);
        setCode("");
        setConfirmed("");
        onVerified("");
      }
    } catch {
      setError("Could not reach email verification. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-3xl bg-white p-6 ring-1 ring-border/70">
      <label htmlFor="delivery-email" className="text-2xl font-medium">Delivery email</label>
      <p id="delivery-email-help" className="mt-2 text-sm text-muted-foreground">We’ll email your project ZIP link here, along with your live website link if you purchase Hosting setup.</p>
      <input id="delivery-email" type="email" autoComplete="email" aria-describedby="delivery-email-help"
        className="mt-3 min-h-11 w-full rounded-lg border border-border px-3" value={email} maxLength={254} disabled={disabled || busy}
        onChange={event => { setError(""); onChange(event.target.value); }} />
      {!locked && alternate && confirmed !== recipient && (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-muted-foreground">Verify this address before paying.</p>
          {sentTo === recipient && !!recipient && <div className="flex flex-wrap items-end gap-2">
            <label className="grid gap-1 text-sm" htmlFor="delivery-email-code">Verification code
              <input id="delivery-email-code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6}
                className="h-11 w-36 rounded-lg border border-border px-3" value={code}
                onChange={event => setCode(event.target.value.replace(/\D/g, ""))} disabled={disabled || busy} />
            </label>
            <Button type="button" onClick={() => void submit("verify")} disabled={disabled || busy || code.length !== 6}>Verify email</Button>
          </div>}
          <Button type="button" variant="outline" onClick={() => void submit("send")}
            disabled={disabled || busy || !recipient}>{sentTo === recipient ? "Resend code" : "Send verification code"}</Button>
          {sentTo === recipient && !!recipient && <p role="status" className="text-sm">Check this inbox for a six-digit code.</p>}
        </div>
      )}
      {!locked && alternate && confirmed === recipient && <div className="mt-3 flex flex-wrap items-center gap-3">
        <p role="status" className="text-sm text-bay">Delivery email verified.</p>
        <Button type="button" variant="ghost" onClick={() => void submit("send")} disabled={disabled || busy}>Send a new code</Button>
      </div>}
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
    </section>
  );
}
