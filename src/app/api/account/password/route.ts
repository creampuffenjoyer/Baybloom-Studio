import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { signIn } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { passwordSchema } from "@/lib/validators";
import { guardBrowserWrite, readJsonBody } from "@/lib/request-security";
import { checkBreachedPassword, BREACHED_PASSWORD_MESSAGE, PASSWORD_CHECK_UNAVAILABLE } from "@/lib/breached-passwords";

/*
 * A route handler rather than a Server Action on purpose: changing the
 * password revokes older sessions and issues a new session cookie. A Server
 * Action would re-render the page in the same response using the request's
 * old (now revoked) cookie and bounce the user to the login page.
 */

const schema = z
  .object({
    current: z.string().max(128).optional(),
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    error: "Passwords don't match.",
  });

export async function POST(request: Request) {
  const rejected = guardBrowserWrite(request);
  if (rejected) return rejected;

  const user = await getCurrentUser();
  if (!user?.email) {
    return Response.json({ message: "Your session expired. Please log in again." }, { status: 401 });
  }
  if (!(await rateLimit(`pw-change:${user.id}`, 5, 15 * 60_000)).ok) {
    return Response.json({ message: "Too many attempts. Please wait a few minutes." }, { status: 429 });
  }

  const body = await readJsonBody(request);
  if (!body.ok) return body.response;
  const parsed = schema.safeParse(body.value);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return Response.json({ fieldErrors }, { status: 400 });
  }

  const row = await db.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
  if (row?.passwordHash) {
    const ok = await bcrypt.compare(parsed.data.current ?? "", row.passwordHash);
    if (!ok) {
      return Response.json(
        { fieldErrors: { current: "That's not your current password." } },
        { status: 400 },
      );
    }
  }

  const screening = await checkBreachedPassword(parsed.data.password);
  if (screening === "breached") return Response.json({ fieldErrors: { password: BREACHED_PASSWORD_MESSAGE } }, { status: 400 });
  if (screening === "unavailable") return Response.json({ message: PASSWORD_CHECK_UNAVAILABLE }, { status: 503 });
  await db.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await bcrypt.hash(parsed.data.password, 12),
      // Signs out every other device; this one gets a fresh session below.
      sessionsValidAfter: new Date(),
    },
  });
  if (user.role === "ADMIN") return Response.json({ ok: true, reauthenticate: true, message: "Password changed. Sign in again with your authenticator or a recovery code." });
  await signIn("credentials", {
    email: user.email,
    password: parsed.data.password,
    redirect: false,
  });

  return Response.json({
    ok: true,
    message: row?.passwordHash
      ? "Password changed. Other devices have been signed out."
      : "Password set. You can now log in with your email too.",
  });
}
