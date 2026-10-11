"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { consumeToken } from "@/lib/tokens";
import { rateLimit } from "@/lib/rate-limit";
import { emailSchema, passwordSchema } from "@/lib/validators";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/account-emails";
import { getCurrentUser } from "@/lib/session";

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
    !rateLimit(`reset:ip:${await clientIp()}`, 10, 60 * 60_000).ok ||
    !rateLimit(`reset:email:${email}`, 3, 60 * 60_000).ok
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

  const email = await consumeToken(parsed.data.token, "RESET_PASSWORD");
  if (!email) return { error: "This reset link has expired or was already used. Please request a new one." };

  const now = new Date();
  await db.user.update({
    where: { email },
    data: {
      passwordHash: await bcrypt.hash(parsed.data.password, 12),
      // Signs out every existing session, including any an attacker may hold.
      sessionsValidAfter: now,
      // Following the emailed link proves they own the inbox.
      emailVerified: now,
    },
  });
  redirect("/login?reset=1");
}

export async function resendVerificationAction(): Promise<{ ok: boolean; message: string }> {
  const user = await getCurrentUser();
  if (!user?.email) return { ok: false, message: "Please log in again." };
  if (!rateLimit(`verify:${user.id}`, 3, 60 * 60_000).ok) {
    return { ok: false, message: "We've sent a few already. Please check your inbox and spam folder." };
  }
  const row = await db.user.findUnique({
    where: { id: user.id },
    select: { emailVerified: true, name: true },
  });
  if (row?.emailVerified) return { ok: true, message: "Your email is already verified." };
  await sendVerificationEmail(user.email, row?.name);
  return { ok: true, message: `We sent a new link to ${user.email}.` };
}
