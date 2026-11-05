"use client";

import { useActionState, useEffect } from "react";
import { BadgeCheckIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import type { Account } from "@/lib/account";
import { COUNTRIES } from "@/lib/validators";
import { updateProfileAction, type FormState } from "@/app/(store)/(client)/account/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const countryName = new Intl.DisplayNames(["en"], { type: "region" });

function Field({
  name,
  label,
  error,
  className,
  ...props
}: React.ComponentProps<typeof Input> & { name: string; label: string; error?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className="h-11 bg-white"
        {...props}
      />
      {error && (
        <p id={`${name}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function ProfileForm({ account }: { account: Account }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfileAction, {});
  const e = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
    else if (!state.ok && state.message) toast.error(state.message);
  }, [state]);

  return (
    <form action={action} className="space-y-8" noValidate>
      <section className="rounded-3xl bg-white p-6 ring-1 ring-border/70 sm:p-8" aria-labelledby="profile-heading">
        <h2 id="profile-heading" className="text-2xl font-medium">
          Profile
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field name="name" label="Full name" autoComplete="name" defaultValue={account.name ?? ""} error={e.name} required />
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="flex h-11 items-center gap-2 rounded-md border border-input bg-sand px-3 text-sm text-ink/80">
              <span id="email" className="truncate">{account.email}</span>
              {account.emailVerified && (
                <BadgeCheckIcon className="ml-auto size-4 shrink-0 text-bay" aria-label="Verified" />
              )}
            </div>
          </div>
          <Field name="phone" label="Phone" type="tel" autoComplete="tel" defaultValue={account.phone ?? ""} error={e.phone} placeholder="+63 917 123 4567" />
          <Field name="company" label="Business or company" autoComplete="organization" defaultValue={account.company ?? ""} error={e.company} />
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 ring-1 ring-border/70 sm:p-8" aria-labelledby="billing-heading">
        <h2 id="billing-heading" className="text-2xl font-medium">
          Billing details
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">Used on your receipts and to pre-fill checkout.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field name="addressLine1" label="Address" autoComplete="address-line1" defaultValue={account.addressLine1 ?? ""} error={e.addressLine1} className="sm:col-span-2" />
          <Field name="addressLine2" label="Apartment, suite, etc. (optional)" autoComplete="address-line2" defaultValue={account.addressLine2 ?? ""} error={e.addressLine2} className="sm:col-span-2" />
          <Field name="city" label="City" autoComplete="address-level2" defaultValue={account.city ?? ""} error={e.city} />
          <Field name="region" label="Province / state" autoComplete="address-level1" defaultValue={account.region ?? ""} error={e.region} />
          <Field name="postalCode" label="Postal code" autoComplete="postal-code" defaultValue={account.postalCode ?? ""} error={e.postalCode} />
          <div className="space-y-1.5">
            <Label htmlFor="country">Country</Label>
            <select
              id="country"
              name="country"
              autoComplete="country"
              defaultValue={account.country}
              className="h-11 w-full rounded-md border border-input bg-white px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {countryName.of(c)}
                </option>
              ))}
            </select>
            {e.country && <p className="text-sm text-destructive">{e.country}</p>}
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending} className="h-11 rounded-full px-8">
          {pending && <Loader2Icon className="animate-spin" />}
          Save changes
        </Button>
      </div>
    </form>
  );
}
