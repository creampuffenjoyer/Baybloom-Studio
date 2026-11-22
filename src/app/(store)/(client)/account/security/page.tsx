import type { Metadata } from "next";
import { Suspense } from "react";
import { getAccount } from "@/lib/account";
import { requireUser } from "@/lib/session";
import { PasswordForm } from "@/app/(store)/(client)/account/security/password-form";
import { FormSkeleton } from "@/app/(store)/(client)/account/skeletons";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MfaForm } from "./mfa-form";
import { VerifyBanner } from "../verify-banner";

export const metadata: Metadata = { title: "Security" };

export default function SecurityPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <Security />
    </Suspense>
  );
}

async function Security() {
  await connection();
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=%2Faccount%2Fsecurity");
  const user = session.user.mfaPending ? session.user : await requireUser("/account/security");
  const account = await getAccount(user.id);
  if (!account) return null;
  const administrator = session.user.mfaPending || user.role === "ADMIN";
  const factor = administrator ? await db.mfaCredential.findUnique({ where: { userId: user.id }, select: { enabledAt: true } }) : null;
  return (
    <div className="space-y-8">
    {administrator && !account.emailVerified && <VerifyBanner email={account.email} />}
    {administrator && <MfaForm enabled={!!factor?.enabledAt} />}
    {!session.user.mfaPending &&
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
    </section>}
    </div>
  );
}
