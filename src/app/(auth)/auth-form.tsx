"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  googleSignInAction,
  loginAction,
  registerAction,
  type AuthFormState,
} from "@/app/(auth)/actions";

function Field({
  id,
  label,
  error,
  ...props
}: React.ComponentProps<typeof Input> & { id: string; label: string; error?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-11 bg-white"
        {...props}
      />
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
  const callbackUrl = useSearchParams().get("callbackUrl") ?? "";
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    mode === "login" ? loginAction : registerAction,
    {},
  );
  const otherHref = `${mode === "login" ? "/register" : "/login"}${
    callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""
  }`;

  return (
    <div className="space-y-6">
      <form action={action} className="space-y-4" noValidate>
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
          minLength={mode === "register" ? 8 : undefined}
          required
        />
        {mode === "register" && !state.fieldErrors?.password && (
          <p className="-mt-2 text-xs text-muted-foreground">At least 8 characters.</p>
        )}

        {state.error && (
          <p role="alert" className="rounded-lg bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
            {state.error}
          </p>
        )}

        <Button
          type="submit"
          disabled={pending}
          className="h-11 w-full rounded-full bg-hibiscus-strong text-white hover:bg-hibiscus-strong/90"
        >
          {pending && <Loader2Icon className="animate-spin" />}
          {mode === "login" ? "Log in" : "Create account"}
        </Button>
      </form>

      {googleEnabled && (
        <>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>
          <form action={googleSignInAction}>
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <Button type="submit" variant="outline" className="h-11 w-full rounded-full bg-white">
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
