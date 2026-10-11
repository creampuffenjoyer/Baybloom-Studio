import type { Metadata } from "next";
import { Suspense } from "react";
import { getAccount } from "@/lib/account";
import { requireUser } from "@/lib/session";
import { PasswordForm } from "@/app/(store)/(client)/account/security/password-form";
import { FormSkeleton } from "@/app/(store)/(client)/account/skeletons";

export const metadata: Metadata = { title: "Password" };

export default function SecurityPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <Security />
    </Suspense>
  );
}

async function Security() {
  const user = await requireUser("/account/security");
  const account = await getAccount(user.id);
  if (!account) return null;
  return (
    <section className="max-w-xl rounded-3xl bg-white p-6 ring-1 ring-border/70 sm:p-8" aria-labelledby="pw-heading">
      <h2 id="pw-heading" className="text-2xl font-medium">
        {account.hasPassword ? "Change password" : "Set a password"}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {account.hasPassword
          ? "Changing your password signs you out on all other devices."
          : `You sign in with ${account.providers.includes("google") ? "Google" : "a linked account"}. Add a password to also log in with your email.`}
      </p>
      <PasswordForm hasPassword={account.hasPassword} email={account.email} />
    </section>
  );
}
