import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/app/(auth)/auth-form";
import { AuthShell } from "@/app/(auth)/auth-shell";

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false },
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your client account"
      intro="Free to join. Unlock prices, tier details and add-ons for every design in the catalog."
    >
      <Suspense fallback={<div className="shimmer h-96 rounded-xl" />}>
        <AuthForm
          mode="register"
          googleEnabled={Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET)}
        />
      </Suspense>
    </AuthShell>
  );
}
