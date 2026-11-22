import bcrypt from "bcryptjs";
import { connection } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { guardBrowserWrite, readJsonBody, privateResponseHeaders as headers } from "@/lib/request-security";
import { beginMfaEnrollment, confirmMfaEnrollment, MfaError } from "@/lib/mfa";

const schema = z.discriminatedUnion("action", [
  z.strictObject({ action: z.literal("begin"), password: z.string().min(1).max(128), code: z.string().max(40).default("") }),
  z.strictObject({ action: z.literal("confirm"), code: z.string().regex(/^\d{6}$/) }),
]);
export async function POST(request: Request) {
  const rejected = guardBrowserWrite(request); if (rejected) return rejected;
  await connection();
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in again to set up verification." }, { status: 401, headers });
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.disabled || user.role !== "ADMIN" || !user.emailVerified) return Response.json({ error: "A verified administrative account is required." }, { status: 403, headers });
  if (!session.user.authAt || Date.now() - session.user.authAt > 10 * 60_000) return Response.json({ error: "Sign in again before changing your authenticator." }, { status: 401, headers });
  if (!(await rateLimit(`mfa-manage:${user.id}`, 10, 10 * 60_000)).ok) return Response.json({ error: "Too many attempts. Please wait ten minutes." }, { status: 429, headers });
  const body = await readJsonBody(request); if (!body.ok) return body.response;
  const parsed = schema.safeParse(body.value);
  if (!parsed.success) return Response.json({ error: "Check the password and verification code." }, { status: 400, headers });
  try {
    if (parsed.data.action === "begin") {
      if (!user.passwordHash || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return Response.json({ error: "Enter your current password. Google-only administrators must first set a password using email recovery." }, { status: 400, headers });
      const setup = await beginMfaEnrollment(user.id, parsed.data.code, db, session.user.authAt, user.passwordHash);
      return Response.json(setup, { headers });
    }
    const recoveryCodes = await confirmMfaEnrollment(user.id, parsed.data.code, db, session.user.authAt);
    return Response.json({ recoveryCodes }, { headers });
  } catch (error) {
    if (error instanceof MfaError) return Response.json({ error: error.message }, { status: 400, headers });
    return Response.json({ error: "Authenticator setup is temporarily unavailable. Please try again later." }, { status: 503, headers });
  }
}
