"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { consumeToken, peekToken } from "@/lib/tokens";
import { checkBreachedPassword, BREACHED_PASSWORD_MESSAGE, PASSWORD_CHECK_UNAVAILABLE } from "@/lib/breached-passwords";
import { rateLimit } from "@/lib/rate-limit";
import { emailSchema, passwordSchema } from "@/lib/validators";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/account-emails";
import { getCurrentUser } from "@/lib/session";
import { auth } from "@/lib/auth";
import { reportEvent } from "@/lib/monitoring";

export type RecoveryState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<"email" | "password" | "confirm", string>>;
  email?: string;
};

async function clientIp() {
  return (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

export async function requestPasswordResetAction(
  _prev: RecoveryState,
  formData: FormData,
): Promise<RecoveryState> {
  const raw = String(formData.get("email") ?? "");
  const parsed = emailSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: { email: "Enter a valid email address." }, email: raw };
  }
  const email = parsed.data;

  if (
    !(await rateLimit(`reset:ip:${await clientIp()}`, 10, 60 * 60_000)).ok ||
    !(await rateLimit(`reset:email:${email}`, 3, 60 * 60_000)).ok
  ) {
    return { error: "Too many requests. Please wait a while and try again.", email };
  }

  const user = await db.user.findUnique({ where: { email }, select: { disabled: true } });
  if (user && !user.disabled) {
    await sendPasswordResetEmail(email).catch((e) =>
      console.error("[reset] email failed", e),
    );
  }
  // Same answer whether or not the account exists, so emails can't be probed.
  return { ok: true, email };
}

const resetSchema = z
  .object({
    token: z.string().min(10).max(100),
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    error: "Passwords don't match.",
  });

export async function resetPasswordAction(
  _prev: RecoveryState,
  formData: FormData,
): Promise<RecoveryState> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    const fieldErrors: RecoveryState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "password" || key === "confirm") fieldErrors[key] ??= issue.message;
    }
    return Object.keys(fieldErrors).length
      ? { fieldErrors }
      : { error: "This reset link is invalid. Please request a new one." };
  }

  if (!(await rateLimit(`reset-submit:ip:${await clientIp()}`, 10, 15 * 60_000)).ok ||
      !(await rateLimit(`reset-submit:token:${parsed.data.token}`, 5, 15 * 60_000)).ok) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }
  if (!(await peekToken(parsed.data.token, "RESET_PASSWORD"))) return { error: "This reset link has expired or was already used. Please request a new one." };
  const screening = await checkBreachedPassword(parsed.data.password);
  if (screening === "breached") return { fieldErrors: { password: BREACHED_PASSWORD_MESSAGE } };
  if (screening === "unavailable") return { error: PASSWORD_CHECK_UNAVAILABLE };
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const changed = await db.$transaction(async (tx) => {
    const email = await consumeToken(parsed.data.token, "RESET_PASSWORD", tx);
    if (!email) return false;

    const now = new Date();
    await tx.user.update({
      where: { email },
      data: {
        passwordHash,
        // Signs out sessions issued before this reset.
        sessionsValidAfter: now,
        // Following the emailed link proves they own the inbox.
        emailVerified: now,
      },
    });
    return true;
  }).catch(() => {
    reportEvent("password_reset_update_failed");
    return undefined;
  });
  if (changed === undefined) return { error: "We couldn't reset your password right now. Please try again shortly." };
  if (!changed) return { error: "This reset link has expired or was already used. Please request a new one." };
  redirect("/login?reset=1");
}

export async function resendVerificationAction(): Promise<{ ok: boolean; message: string }> {
  let user = await getCurrentUser();
  if (!user) {
    // A password-authenticated admin awaiting enrollment may still verify its
    // own inbox; it receives no normal account/application privileges.
    const session = await auth();
    if (session?.user?.mfaPending) user = { id: session.user.id, email: session.user.email ?? null, name: session.user.name ?? null, role: "CLIENT" };
  }
  if (!user?.email) return { ok: false, message: "Please log in again." };
  if (!(await rateLimit(`verify:${user.id}`, 3, 60 * 60_000)).ok) {
    return { ok: false, message: "We've sent a few already. Please check your inbox and spam folder." };
  }
  const row = await db.user.findUnique({
    where: { id: user.id },
    select: { emailVerified: true, name: true },
  });
  if (row?.emailVerified) return { ok: true, message: "Your email is already verified." };
  try {
    await sendVerificationEmail(user.email, row?.name);
  } catch {
    reportEvent("verification_email_resend_failed");
    return { ok: false, message: "We couldn't send a verification email right now. Please try again shortly." };
  }
  return { ok: true, message: `We sent a new link to ${user.email}.` };
}
