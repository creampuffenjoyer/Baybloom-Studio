"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MIN_PASSWORD_CHARACTERS } from "@/lib/password-policy";
import {
  googleSignInAction,
  loginAction,
  registerAction,
  type AuthFormState,
} from "@/app/(store)/(auth)/actions";

function Field({
  id,
  label,
  error,
  type,
  ...props
}: React.ComponentProps<typeof Input> & { id: string; label: string; error?: string }) {
  const [visible, setVisible] = useState(false);
  const password = type === "password";
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
      <Input
        id={id}
        name={id}
        type={password && visible ? "text" : type}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : password && props.minLength ? "password-hint" : undefined}
        className={`h-12 rounded-lg bg-white ${password ? "pr-16" : ""}`}
        {...props}
      />
      {password && <button type="button" aria-label={visible ? "Hide password" : "Show password"} aria-controls={id} aria-pressed={visible} onClick={() => setVisible((value) => !value)} className="absolute top-0 right-0 flex h-12 w-16 items-center justify-center rounded-r-lg text-xs font-semibold text-bay hover:bg-secondary/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">{visible ? "Hide" : "Show"}</button>}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function AuthForm({
  mode,
  googleEnabled,
}: {
  mode: "login" | "register";
  googleEnabled: boolean;
}) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "";
  const justReset = mode === "login" && searchParams.get("reset") === "1";
  const googleDenied = searchParams.get("error") === "AccessDenied";
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    mode === "login" ? loginAction : registerAction,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.fieldErrors && Object.keys(state.fieldErrors).length) {
      formRef.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus();
    } else if (state.error) {
      formRef.current?.querySelector<HTMLElement>('[role="alert"]')?.focus();
    }
  }, [state]);
  const otherHref = `${mode === "login" ? "/register" : "/login"}${
    callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""
  }`;

  return (
    <div className="space-y-6">
      {googleDenied && (
        <p role="alert" className="rounded-lg bg-secondary px-3 py-2.5 text-sm text-bay-deep">
          Google sign-in could not be completed. If you already have an account with this email,
          log in with your password or use the password reset link. Accounts are not linked automatically.
        </p>
      )}
      {justReset && !state.error && (
        <p role="status" className="rounded-lg bg-secondary px-3 py-2.5 text-sm text-bay-deep">
          Your password has been changed. Log in with your new password.
        </p>
      )}
      <form ref={formRef} action={action} className="space-y-5" noValidate aria-busy={pending}>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        {mode === "register" && (
          <Field
            id="name"
            label="Full name"
            autoComplete="name"
            defaultValue={state.values?.name}
            error={state.fieldErrors?.name}
            required
          />
        )}
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          defaultValue={state.values?.email}
          error={state.fieldErrors?.email}
          required
        />
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          error={state.fieldErrors?.password}
          minLength={mode === "register" ? MIN_PASSWORD_CHARACTERS : undefined}
          required
        />
        {mode === "login" && (
          <details className="rounded-lg border border-border p-3">
            <summary className="min-h-11 cursor-pointer text-sm font-medium">Administrator verification</summary>
            <Field id="code" label="Authenticator or recovery code" autoComplete="one-time-code" maxLength={40} />
            <p className="mt-2 text-xs text-muted-foreground">Use a fresh six-digit code or paste one of your recovery codes. First-time administrators can leave this empty to enroll.</p>
          </details>
        )}
        {mode === "login" && (
          <p className="-mt-2 text-right text-sm">
            <Link href="/forgot-password" className="inline-flex min-h-11 items-center text-bay underline-offset-4 hover:underline">
              Forgot password?
            </Link>
          </p>
        )}
        {mode === "register" && !state.fieldErrors?.password && (
          <p id="password-hint" className="-mt-2 text-sm text-muted-foreground">At least {MIN_PASSWORD_CHARACTERS} characters. A memorable passphrase works well.</p>
        )}

        {state.error && (
          <p role="alert" tabIndex={-1} className="rounded-lg bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
            {state.error}
          </p>
        )}

        <Button
          type="submit"
          disabled={pending}
          className="h-12 w-full rounded-lg bg-hibiscus-strong text-base text-white hover:bg-hibiscus-strong/90"
        >
          {pending && <Loader2Icon aria-hidden className="animate-spin" />}
          {pending ? (mode === "login" ? "Logging in…" : "Creating account…") : (mode === "login" ? "Log in" : "Create account")}
        </Button>
      </form>

      {googleEnabled && (
        <>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>
          <form action={googleSignInAction}>
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <Button type="submit" variant="outline" className="h-12 w-full rounded-lg bg-white">
              <GoogleMark /> Continue with Google
            </Button>
          </form>
        </>
      )}

      <p className="text-center text-sm text-muted-foreground">
        {mode === "login" ? "New to Baybloom? " : "Already have an account? "}
        <Link href={otherHref} className="font-medium text-bay underline underline-offset-4">
          {mode === "login" ? "Create an account" : "Log in"}
        </Link>
      </p>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.2 12 2.2 6.6 2.2 2.3 6.6 2.3 12s4.3 9.8 9.7 9.8c5.6 0 9.3-3.9 9.3-9.5 0-.6-.1-1.1-.2-1.6H12z" />
    </svg>
  );
}
