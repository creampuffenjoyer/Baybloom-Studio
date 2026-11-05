import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/app/(store)/(auth)/auth-form";
import { AuthShell } from "@/app/(store)/(auth)/auth-shell";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      intro="Log in to see pricing, compare tiers and save the designs you love."
    >
      <Suspense fallback={<div className="shimmer h-72 rounded-xl" />}>
        <AuthForm
          mode="login"
          googleEnabled={Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET)}
        />
      </Suspense>
    </AuthShell>
  );
}
