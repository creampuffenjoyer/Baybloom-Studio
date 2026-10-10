"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { COUNTRIES } from "@/lib/validators";

export type FormState = {
  ok?: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max, { error: `Use at most ${max} characters.` })
    .transform((v) => v || null);

const profileSchema = z.object({
  name: z.string().trim().min(2, { error: "Enter your name." }).max(80),
  phone: optional(30).refine((v) => !v || /^[+\d][\d\s()-]{5,}$/.test(v), {
    error: "Enter a valid phone number.",
  }),
  company: optional(120),
  addressLine1: optional(160),
  addressLine2: optional(160),
  city: optional(80),
  region: optional(80),
  postalCode: optional(20),
  country: z.enum(COUNTRIES, { error: "Choose a country." }),
});

function toFieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) out[String(issue.path[0])] ??= issue.message;
  return out;
}

export async function updateProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { message: "Your session expired. Please log in again." };

  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error) };

  await db.user.update({ where: { id: user.id }, data: parsed.data });
  refresh(); // re-render the header name and form with saved values
  return { ok: true, message: "Profile saved." };
}
