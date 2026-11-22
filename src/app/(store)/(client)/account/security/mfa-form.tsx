"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function MfaForm({ enabled }: { enabled: boolean }) {
  const [secret, setSecret] = useState("");
  const [codes, setCodes] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setPending(true); setError("");
    try {
      const response = await fetch("/api/account/mfa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(secret
        ? { action: "confirm", code: values.get("code") }
        : { action: "begin", password: values.get("password"), code: values.get("code") ?? "" }) });
      const result = await response.json();
      if (!response.ok) { setError(result.error ?? "Please try again."); return; }
      form.reset();
      if (result.secret) setSecret(result.secret);
      if (result.recoveryCodes) { setCodes(result.recoveryCodes); setSecret(""); }
    } catch { setError("The request could not be completed. Please try again."); }
    finally { setPending(false); }
  }
  return <section className="max-w-xl rounded-3xl bg-white p-6 ring-1 ring-border/70 sm:p-8" aria-labelledby="mfa-heading">
    <h2 id="mfa-heading" className="text-2xl font-medium">Administrator verification</h2>
    {codes.length > 0 ? <div className="mt-4 space-y-4">
      <p role="status">Your authenticator is enabled. Save these recovery codes somewhere private before leaving this page. Each code works once; they will not be shown again.</p>
      <ul aria-label="Recovery codes" className="space-y-2 rounded-xl bg-secondary p-4 font-mono text-xs break-all">{codes.map(code => <li key={code}>{code}</li>)}</ul>
      <p className="text-sm text-muted-foreground">All sessions have been signed out. Wait for a new authenticator code, then sign in again. Replacing an authenticator invalidates its previous recovery codes.</p>
      <Link href="/login" className="inline-flex min-h-11 items-center font-medium underline">Return to sign in</Link>
    </div> : <>
      <p className="mt-2 text-sm text-muted-foreground">{enabled ? "An authenticator is required at every administrative sign-in. Replace it here if you are changing devices; your current one keeps working until the replacement is confirmed." : "Administrative accounts must enroll an authenticator before accessing the account. Add a time-based account in your authenticator app, then confirm its code."}</p>
      <form onSubmit={submit} className="mt-5 space-y-4" aria-busy={pending}>
        {secret ? <>
          <p className="text-sm">Choose manual entry in your authenticator app. Use this setup key, time-based codes, six digits and a 30-second interval. Setup expires in ten minutes. Keep the key private.</p>
          <Label htmlFor="setup-key">Setup key</Label>
          <Input id="setup-key" value={secret} readOnly className="h-12 font-mono text-sm" />
          <Label htmlFor="mfa-code">New authenticator code</Label>
          <Input id="mfa-code" name="code" required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} className="h-12" />
        </> : <>
          <Label htmlFor="mfa-password">Current password</Label>
          <Input id="mfa-password" name="password" type="password" required autoComplete="current-password" className="h-12" />
          {enabled && <><Label htmlFor="mfa-code">Current authenticator or recovery code</Label><Input id="mfa-code" name="code" required autoComplete="one-time-code" maxLength={40} className="h-12" /></>}
        </>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button disabled={pending} type="submit" className="h-12 rounded-full px-6">{pending ? "Checking…" : secret ? "Confirm authenticator" : enabled ? "Replace authenticator" : "Set up authenticator"}</Button>
        {secret && <Button type="button" variant="outline" className="ml-2 h-12 rounded-full" disabled={pending} onClick={() => { setSecret(""); setError(""); }}>Start again</Button>}
      </form>
    </>}
  </section>;
}
