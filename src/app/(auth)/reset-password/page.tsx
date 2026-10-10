import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/app/(auth)/auth-shell";
import { ResetPasswordForm } from "@/app/(auth)/recovery-forms";
import { peekToken } from "@/lib/tokens";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false },
  referrer: "no-referrer",
};

export default function ResetPasswordPage(props: PageProps<"/reset-password">) {
  return (
    <AuthShell
      title="Choose a new password"
      intro="Pick something you haven't used here before. You'll be signed out on other devices."
    >
      <Suspense fallback={<div className="shimmer h-64 rounded-xl" />}>
        <ResetForm searchParams={props.searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function ResetForm({ searchParams }: Pick<PageProps<"/reset-password">, "searchParams">) {
  const { token } = await searchParams;
  const value = typeof token === "string" ? token : "";
  if (!(await peekToken(value, "RESET_PASSWORD"))) {
    return (
      <div role="alert" className="rounded-2xl bg-white p-6 ring-1 ring-border/70">
        <p className="font-medium">This link has expired or was already used</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Reset links last 1 hour and work once.
        </p>
        <Link
          href="/forgot-password"
          className="mt-4 inline-block text-sm font-medium text-bay underline underline-offset-4"
        >
          Request a new link
        </Link>
      </div>
    );
  }
  return <ResetPasswordForm token={value} />;
}
