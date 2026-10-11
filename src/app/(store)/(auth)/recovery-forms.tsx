"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CheckCircle2Icon, Loader2Icon } from "lucide-react";
import {
  requestPasswordResetAction,
  resetPasswordAction,
  type RecoveryState,
} from "@/app/(store)/(auth)/recovery-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const submitClass =
  "h-11 w-full rounded-full bg-hibiscus-strong text-white hover:bg-hibiscus-strong/90";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-sm text-destructive">
      {message}
    </p>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<RecoveryState, FormData>(
    requestPasswordResetAction,
    {},
  );

  if (state.ok) {
    return (
      <div role="status" className="rounded-2xl bg-white p-6 ring-1 ring-border/70">
        <CheckCircle2Icon className="size-6 text-seaglass" aria-hidden />
        <p className="mt-3 font-medium">Check your inbox</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          If an account exists for <span className="text-ink">{state.email}</span>, we&apos;ve
          sent a link to reset your password. It expires in 1 hour.
        </p>
        <Link href="/login" className="mt-4 inline-block text-sm font-medium text-bay underline underline-offset-4">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.email}
          aria-invalid={state.fieldErrors?.email ? true : undefined}
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
          className="h-11 bg-white"
          required
        />
        <FieldError id="email-error" message={state.fieldErrors?.email} />
      </div>
      {state.error && (
        <p role="alert" className="rounded-lg bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className={submitClass}>
        {pending && <Loader2Icon className="animate-spin" />}
        Send reset link
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-bay underline underline-offset-4">
          Log in
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<RecoveryState, FormData>(
    resetPasswordAction,
    {},
  );
  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="token" value={token} />
      <div className="space-y-1.5">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          aria-invalid={state.fieldErrors?.password ? true : undefined}
          aria-describedby="password-help"
          className="h-11 bg-white"
          required
        />
        {state.fieldErrors?.password ? (
          <FieldError id="password-help" message={state.fieldErrors.password} />
        ) : (
          <p id="password-help" className="text-xs text-muted-foreground">
            At least 8 characters.
          </p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm">Confirm new password</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          aria-invalid={state.fieldErrors?.confirm ? true : undefined}
          aria-describedby={state.fieldErrors?.confirm ? "confirm-error" : undefined}
          className="h-11 bg-white"
          required
        />
        <FieldError id="confirm-error" message={state.fieldErrors?.confirm} />
      </div>
      {state.error && (
        <p role="alert" className="rounded-lg bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
          {state.error}{" "}
          <Link href="/forgot-password" className="font-medium underline underline-offset-2">
            Request a new link
          </Link>
        </p>
      )}
      <Button type="submit" disabled={pending} className={submitClass}>
        {pending && <Loader2Icon className="animate-spin" />}
        Save new password
      </Button>
    </form>
  );
}
