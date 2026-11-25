import { randomInt } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { deliveryEmailSchema, deliverySignature } from "@/lib/delivery-credentials";
import { sendEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { guardBrowserWrite, privateResponseHeaders, readJsonBody } from "@/lib/request-security";
import { getCurrentUser } from "@/lib/session";

const input = z.discriminatedUnion("action", [
  z.strictObject({ action: z.literal("send"), email: deliveryEmailSchema }),
  z.strictObject({ action: z.literal("verify"), email: deliveryEmailSchema, code: z.string().regex(/^\d{6}$/) }),
]);

export async function POST(request: Request) {
  const rejected = guardBrowserWrite(request);
  if (rejected) return rejected;
  const respond = (body: object, status = 200) => Response.json(body, { status, headers: privateResponseHeaders });
  const user = await getCurrentUser();
  if (!user) return respond({ error: "Please log in." }, 401);
  const body = await readJsonBody(request);
  if (!body.ok) return body.response;
  const parsed = input.safeParse(body.value);
  if (!parsed.success) return respond({ error: "Enter a valid email address and verification code." }, 400);
  const { action, email } = parsed.data;
  try {
    const account = await db.user.findUnique({ where: { id: user.id }, select: { emailVerified: true, disabled: true, email: true } });
    if (!account || account.disabled || !account.emailVerified) return respond({ error: "Verify your Baybloom account email first." }, 403);
    if (email === account.email.toLowerCase()) return respond({ verified: true });
    const limit = await rateLimit(`checkout-delivery-email:${action}:${user.id}`, action === "send" ? 4 : 8, 15 * 60_000);
    if (!limit.ok) return respond({ error: "Too many attempts. Wait a few minutes and try again." }, 429);

    if (parsed.data.action === "send") {
      const code = randomInt(1_000_000).toString().padStart(6, "0");
      const codeHash = deliverySignature("verify-address", JSON.stringify([user.id, email, code]));
      const challenge = { email, codeHash, expiresAt: new Date(Date.now() + 10 * 60_000), verifiedAt: null };
      await db.checkoutDeliveryVerification.upsert({
        where: { userId: user.id }, create: { userId: user.id, ...challenge }, update: challenge,
      });
      await sendEmail({
        to: email, subject: "Confirm your Baybloom delivery email",
        text: `Your Baybloom checkout code is ${code}. It expires in 10 minutes. If you did not request it, you can ignore this email.`,
        html: `<p>Your Baybloom checkout code is <strong>${code}</strong>. It expires in 10 minutes.</p><p>If you did not request it, you can ignore this email.</p>`,
      });
      return respond({ sent: true });
    }

    const now = new Date();
    const { count } = await db.checkoutDeliveryVerification.updateMany({
      where: { userId: user.id, email, codeHash: deliverySignature("verify-address", JSON.stringify([user.id, email, parsed.data.code])),
        expiresAt: { gt: now }, verifiedAt: null },
      data: { verifiedAt: now, expiresAt: new Date(Date.now() + 30 * 60_000) },
    });
    return count ? respond({ verified: true }) : respond({ error: "That code is invalid or expired. Request a new code and try again." }, 400);
  } catch {
    return respond({ error: "Email verification is temporarily unavailable. Please try again." }, 503);
  }
}
