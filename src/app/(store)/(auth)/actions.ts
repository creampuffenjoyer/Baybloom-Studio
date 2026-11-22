"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { signIn, signOut } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { loginSchema, registerSchema } from "@/lib/validators";
import { safeCallbackUrl } from "@/lib/urls";
import { sendVerificationEmail } from "@/lib/account-emails";
import { checkBreachedPassword, BREACHED_PASSWORD_MESSAGE, PASSWORD_CHECK_UNAVAILABLE } from "@/lib/breached-passwords";

export type AuthFormState = {
  error?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "password", string>>;
  values?: { name?: string; email?: string };
};

async function clientIp() {
  return (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

function fieldErrors(error: z.ZodError): AuthFormState["fieldErrors"] {
  const out: AuthFormState["fieldErrors"] = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as "name" | "email" | "password";
    out[key] ??= issue.message;
  }
  return out;
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const input = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    code: String(formData.get("code") ?? ""),
  };
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error), values: { email: input.email } };
  }

  const accountRole = await db.user.findUnique({ where: { email: parsed.data.email }, select: { role: true } });
  try {
    await signIn("credentials", {
      ...parsed.data,
      redirectTo: accountRole?.role === "ADMIN" ? "/account/security" : safeCallbackUrl(formData.get("callbackUrl")),
    });
  } catch (error) {
    // signIn throws a redirect on success; only Auth.js errors are failures.
    if (error instanceof AuthError) {
      const limited = "code" in error && error.code === "rate_limited";
      return {
        error: limited
          ? "Too many sign-in attempts. Please wait a few minutes and try again."
          : "Check your sign-in details. Administrators also need a current authenticator code or unused recovery code after enrollment.",
        values: { email: parsed.data.email },
      };
    }
    throw error;
  }
  return {};
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const input = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
  const values = { name: input.name, email: input.email };

  if (!(await rateLimit(`register:${await clientIp()}`, 5, 60 * 60_000)).ok) {
    return { error: "Too many sign-ups from this network. Please try again later.", values };
  }

  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };

  const { name, email, password } = parsed.data;
  if (!(await rateLimit(`register:email:${email}`, 3, 60 * 60_000)).ok) {
    return { error: "Too many sign-up attempts. Please try again later.", values };
  }
  const exists = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (exists) {
    return {
      fieldErrors: { email: "An account with this email already exists. Try logging in." },
      values,
    };
  }

  const screening = await checkBreachedPassword(password);
  if (screening === "breached") return { fieldErrors: { password: BREACHED_PASSWORD_MESSAGE }, values };
  if (screening === "unavailable") return { error: PASSWORD_CHECK_UNAVAILABLE, values };
  if (!(await rateLimit("register:global", 100, 60 * 60_000)).ok) {
    return { error: "Sign-ups are temporarily busy. Please try again later.", values };
  }
  try {
    await db.user.create({
      data: { name, email, passwordHash: await bcrypt.hash(password, 12) },
    });
  } catch (error) {
    if (!(error && typeof error === "object" && "code" in error && error.code === "P2002")) throw error;
    return { fieldErrors: { email: "An account with this email already exists. Try logging in." }, values };
  }
  // Don't block sign-up if the email provider is down; they can resend later.
  await sendVerificationEmail(email, name).catch((e) =>
    console.error("[register] verification email failed", e),
  );

  await signIn("credentials", {
    email,
    password,
    redirectTo: safeCallbackUrl(formData.get("callbackUrl")),
  });
  return {};
}

export async function googleSignInAction(formData: FormData) {
  await signIn("google", { redirectTo: safeCallbackUrl(formData.get("callbackUrl")) });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
