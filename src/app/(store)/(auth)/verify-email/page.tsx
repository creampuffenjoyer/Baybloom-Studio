import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CheckCircle2Icon, XCircleIcon } from "lucide-react";
import { AuthShell } from "@/app/(store)/(auth)/auth-shell";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { consumeToken } from "@/lib/tokens";

export const metadata: Metadata = {
  title: "Verify email",
  robots: { index: false },
  referrer: "no-referrer",
};

export default function VerifyEmailPage(props: PageProps<"/verify-email">) {
  return (
    <AuthShell title="Email verification" intro="Confirming the link from your inbox.">
      <Suspense fallback={<div className="shimmer h-40 rounded-xl" />}>
        <VerifyResult searchParams={props.searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function VerifyResult({ searchParams }: Pick<PageProps<"/verify-email">, "searchParams">) {
  const { token } = await searchParams;
  const email = typeof token === "string" ? await consumeToken(token, "VERIFY_EMAIL") : null;
  if (email) {
    await db.user.updateMany({
      where: { email, emailVerified: null },
      data: { emailVerified: new Date() },
    });
  }

  return (
    <div role="status" className="rounded-2xl bg-white p-6 ring-1 ring-border/70">
      {email ? (
        <>
          <CheckCircle2Icon className="size-7 text-seaglass" aria-hidden />
          <p className="mt-3 text-lg font-medium">Your email is verified</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Thanks! <span className="text-ink">{email}</span> is confirmed.
          </p>
          <Button asChild className="mt-5 rounded-full">
            <Link href="/designs">Browse designs</Link>
          </Button>
        </>
      ) : (
        <>
          <XCircleIcon className="size-7 text-destructive" aria-hidden />
          <p className="mt-3 text-lg font-medium">This link has expired or was already used</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Verification links last 24 hours. You can send a new one from your account.
          </p>
          <Button asChild variant="outline" className="mt-5 rounded-full bg-white">
            <Link href="/account">Go to my account</Link>
          </Button>
        </>
      )}
    </div>
  );
}
