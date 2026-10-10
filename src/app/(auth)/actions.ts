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
  };
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error), values: { email: input.email } };
  }

  try {
    await signIn("credentials", {
      ...parsed.data,
      redirectTo: safeCallbackUrl(formData.get("callbackUrl")),
    });
  } catch (error) {
    // signIn throws a redirect on success; only Auth.js errors are failures.
    if (error instanceof AuthError) {
      const limited = "code" in error && error.code === "rate_limited";
      return {
        error: limited
          ? "Too many sign-in attempts. Please wait a few minutes and try again."
          : "That email and password don't match an account.",
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

  if (!rateLimit(`register:${await clientIp()}`, 5, 60 * 60_000).ok) {
    return { error: "Too many sign-ups from this network. Please try again later.", values };
  }

  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };

  const { name, email, password } = parsed.data;
  const exists = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (exists) {
    return {
      fieldErrors: { email: "An account with this email already exists. Try logging in." },
      values,
    };
  }

  await db.user.create({
    data: { name, email, passwordHash: await bcrypt.hash(password, 12) },
  });

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
