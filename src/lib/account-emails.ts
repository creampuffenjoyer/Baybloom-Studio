import "server-only";
import { actionEmail, sendEmail, siteUrl } from "@/lib/email";
import { issueToken } from "@/lib/tokens";

export async function sendVerificationEmail(email: string, name?: string | null) {
  const token = await issueToken(email, "VERIFY_EMAIL");
  const url = siteUrl(`/verify-email?token=${token}`);
  await sendEmail({
    to: email,
    subject: "Confirm your email for Baybloom Studio",
    ...actionEmail({
      heading: `Welcome${name ? `, ${name.split(" ")[0]}` : ""}!`,
      body: "Please confirm your email address. You'll need a verified email to check out and receive your design files.",
      cta: "Confirm email",
      url,
      footer: "This link expires in 24 hours. If you didn't create an account, you can ignore this email.",
    }),
  });
}

export async function sendPasswordResetEmail(email: string) {
  const token = await issueToken(email, "RESET_PASSWORD");
  const url = siteUrl(`/reset-password?token=${token}`);
  await sendEmail({
    to: email,
    subject: "Reset your Baybloom Studio password",
    ...actionEmail({
      heading: "Reset your password",
      body: "We received a request to reset the password for your Baybloom Studio account. Choose a new one with the button below.",
      cta: "Choose a new password",
      url,
      footer: "This link expires in 1 hour and can be used once. If you didn't ask for this, you can ignore this email; your password won't change.",
    }),
  });
}
