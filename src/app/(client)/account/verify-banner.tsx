"use client";

import { useState, useTransition } from "react";
import { Loader2Icon, MailWarningIcon } from "lucide-react";
import { resendVerificationAction } from "@/app/(auth)/recovery-actions";
import { Button } from "@/components/ui/button";

export function VerifyBanner({ email }: { email: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-[#fff4e5] p-5 ring-1 ring-[#f3d9b1] sm:flex-row sm:items-center">
      <MailWarningIcon className="size-6 shrink-0 text-[#a15c07]" aria-hidden />
      <div className="flex-1 text-sm">
        <p className="font-medium text-ink">Please verify your email</p>
        <p className="mt-0.5 text-ink/75" role="status">
          {message ?? (
            <>
              We sent a link to <span className="font-medium">{email}</span>. You&apos;ll need a
              verified email to check out.
            </>
          )}
        </p>
      </div>
      <Button
        variant="outline"
        disabled={pending}
        className="shrink-0 rounded-full bg-white"
        onClick={() =>
          startTransition(async () => {
            const res = await resendVerificationAction();
            setMessage(res.message);
          })
        }
      >
        {pending && <Loader2Icon className="animate-spin" />}
        Resend link
      </Button>
    </div>
  );
}
