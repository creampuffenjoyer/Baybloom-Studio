import { z } from "zod";
import { cookies } from "next/headers";
import { COUPON_COOKIE } from "@/lib/cart";
import { setCouponCookie } from "@/lib/cart-request";
import { getCurrentUser } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { CheckoutError, prepareCheckout } from "@/lib/checkout";
import { continueCheckout, ExpiredCheckoutError, reconcileExpiredCheckouts } from "@/lib/checkout-payment";
import { stripeConfigured } from "@/lib/stripe";
import { checkoutChoiceSchema } from "@/lib/personalization/checkout-choice";
import { guardBrowserWrite, readJsonBody, privateResponseHeaders } from "@/lib/request-security";

export async function POST(request: Request) {
  const rejected = guardBrowserWrite(request);
  if (rejected) return rejected;
  const user = await getCurrentUser();
  if (!user?.email) return Response.json({ error: "Please log in." }, { status: 401 });
  if (!(await rateLimit(`checkout:${user.id}`, 10, 10 * 60_000)).ok) {
    return Response.json({ error: "Too many checkout attempts. Please wait a few minutes." }, { status: 429 });
  }
  const parsed = z.string().uuid().safeParse(request.headers.get("idempotency-key"));
  if (!parsed.success) return Response.json({ error: "A valid checkout request key is required." }, { status: 400 });
  const body = await readJsonBody(request);
  if (!body.ok) return body.response;
  const choices = checkoutChoiceSchema.safeParse(body.value);
  if (!choices.success) return Response.json({ error: "Choose supported saved drafts and confirm photo permissions." }, { status: 400 });

  try {
    await reconcileExpiredCheckouts();
    const code = (await cookies()).get(COUPON_COOKIE)?.value ?? null;
    const order = await prepareCheckout(user.id, parsed.data, code, stripeConfigured(), undefined,
      choices.data.savedDraftTemplates, choices.data.imageRightsConfirmed);
    const url = await continueCheckout(order);
    if (order.totalCents === 0) await setCouponCookie(null);
    return Response.json({ url }, { headers: privateResponseHeaders });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return Response.json({ error: error.message, resetAttempt: error instanceof ExpiredCheckoutError }, { status: error.status });
    }
    // Do not discard this attempt or its reservation after an ambiguous failure.
    console.error("[checkout] attempt interrupted; retry with the same request key");
    return Response.json({ error: "Checkout could not be completed. Please retry; your checkout attempt will be reused." }, { status: 503 });
  }
}
