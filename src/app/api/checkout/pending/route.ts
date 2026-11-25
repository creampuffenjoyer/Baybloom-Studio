import { z } from "zod";
import { CheckoutError } from "@/lib/checkout";
import { closeCheckout, continueCheckout, ExpiredCheckoutError } from "@/lib/checkout-payment";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { guardBrowserWrite, privateResponseHeaders, readJsonBody } from "@/lib/request-security";
import { getCurrentUser } from "@/lib/session";

const input = z.strictObject({ orderId: z.string().min(1).max(128), action: z.enum(["resume", "close"]) });

export async function POST(request: Request) {
  const rejected = guardBrowserWrite(request);
  if (rejected) return rejected;
  const respond = (body: object, status = 200) => Response.json(body, { status, headers: privateResponseHeaders });
  const user = await getCurrentUser();
  if (!user) return respond({ error: "Please log in." }, 401);
  const body = await readJsonBody(request);
  if (!body.ok) return body.response;
  const parsed = input.safeParse(body.value);
  if (!parsed.success) return respond({ error: "Choose a pending checkout." }, 400);
  try {
    if (!(await rateLimit(`checkout-pending:${user.id}`, 10, 10 * 60_000)).ok) return respond({ error: "Please wait before retrying." }, 429);
    const order = await db.order.findFirst({ where: { id: parsed.data.orderId, userId: user.id } });
    if (!order) return respond({ error: "Order not found." }, 404);
    if (order.status === "FAILED") return respond({ closed: true });
    if (parsed.data.action === "resume") return respond({ url: await continueCheckout(order) });
    await closeCheckout(order);
    const current = await db.order.findUniqueOrThrow({ where: { id: order.id }, select: { status: true } });
    if (current.status === "FAILED") return respond({ closed: true });
    return respond({ url: `/checkout/success?order=${order.id}` });
  } catch (error) {
    if (error instanceof ExpiredCheckoutError) return respond({ closed: true });
    if (error instanceof CheckoutError) return respond({ error: error.message }, error.status);
    return respond({ error: "We couldn't confirm the pending checkout. Please retry before starting another payment." }, 503);
  }
}
