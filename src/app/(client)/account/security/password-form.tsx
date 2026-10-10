"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Result = { ok?: boolean; message?: string; fieldErrors?: Record<string, string> };

export function PasswordForm({ hasPassword, email }: { hasPassword: boolean; email: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    startTransition(async () => {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current: data.current || undefined,
          password: data.password,
          confirm: data.confirm,
        }),
      });
      const body: Result = await res.json().catch(() => ({ message: "Something went wrong." }));
      setErrors(body.fieldErrors ?? {});
      if (body.ok) {
        toast.success(body.message);
        formRef.current?.reset();
        // Re-render with the new session cookie (e.g. "Set" becomes "Change").
        router.refresh();
      } else if (body.message) {
        toast.error(body.message);
      }
    });
  }

  const fields = [
    ...(hasPassword ? [{ name: "current", label: "Current password", auto: "current-password" }] : []),
    { name: "password", label: "New password", auto: "new-password" },
    { name: "confirm", label: "Confirm new password", auto: "new-password" },
  ];

  return (
    <form ref={formRef} onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
      {/* Lets password managers attach the new password to the right account */}
      <input type="text" name="username" autoComplete="username" value={email} readOnly hidden />
      {fields.map((f) => (
        <div key={f.name} className="space-y-1.5">
          <Label htmlFor={f.name}>{f.label}</Label>
          <Input
            id={f.name}
            name={f.name}
            type="password"
            autoComplete={f.auto}
            aria-invalid={errors[f.name] ? true : undefined}
            aria-describedby={errors[f.name] ? `${f.name}-error` : undefined}
            className="h-11 bg-white"
            required
          />
          {errors[f.name] && (
            <p id={`${f.name}-error`} className="text-sm text-destructive">
              {errors[f.name]}
            </p>
          )}
          {f.name === "password" && !errors.password && (
            <p className="text-xs text-muted-foreground">At least 8 characters.</p>
          )}
        </div>
      ))}
      <Button type="submit" disabled={pending} className="h-11 rounded-full px-8">
        {pending && <Loader2Icon className="animate-spin" />}
        {hasPassword ? "Update password" : "Set password"}
      </Button>
    </form>
  );
}
