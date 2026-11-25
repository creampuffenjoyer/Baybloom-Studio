import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { guardBrowserWrite, privateResponseHeaders, readJsonBody } from "@/lib/request-security";
import { getCurrentUser } from "@/lib/session";

const input = z.strictObject({ orderItemId: z.string().min(1).max(128) });

export async function POST(request: Request) {
  const rejected = guardBrowserWrite(request);
  if (rejected) return rejected;
  const respond = (body: object, status = 200) => Response.json(body, { status, headers: privateResponseHeaders });
  const user = await getCurrentUser();
  if (!user) return respond({ error: "Please log in." }, 401);
  const body = await readJsonBody(request);
  if (!body.ok) return body.response;
  const parsed = input.safeParse(body.value);
  if (!parsed.success) return respond({ error: "Choose a project." }, 400);
  if (!(await rateLimit(`project-resend:${user.id}`, 4, 60 * 60_000)).ok) return respond({ error: "Please wait before requesting another email." }, 429);
  const { count } = await db.orderDelivery.updateMany({
    where: { orderItemId: parsed.data.orderItemId, emailSentAt: { not: null },
      orderItem: { order: { userId: user.id, status: "PAID", deliveryEmail: { not: null } } } },
    data: { emailRevision: { increment: 1 }, emailSentAt: null, emailNextAt: new Date(), emailAttempts: 0,
      emailFirstAttemptAt: null, emailPayload: Prisma.DbNull, emailError: null },
  });
  return count ? respond({ ok: true }) : respond({ error: "A new delivery email can be requested after the first one is sent." }, 409);
}
