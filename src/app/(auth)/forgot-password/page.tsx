import type { Metadata } from "next";
import { AuthShell } from "@/app/(auth)/auth-shell";
import { ForgotPasswordForm } from "@/app/(auth)/recovery-forms";

export const metadata: Metadata = {
  title: "Forgot password",
  robots: { index: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgot your password?"
      intro="Enter the email you signed up with and we'll send you a link to choose a new one."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
