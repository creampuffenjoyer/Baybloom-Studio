import { z } from "zod";
import { evaluateCoupon, getCart } from "@/lib/cart";
import { getCartForRequest, setCouponCookie } from "@/lib/cart-request";
import { getCurrentUser } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";

/** POST /api/cart/coupon { code }: validate and remember a promo code. */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please log in." }, { status: 401 });
  if (!rateLimit(`coupon:${user.id}`, 10, 10 * 60_000).ok) {
    return Response.json({ error: "Too many attempts. Please wait a few minutes." }, { status: 429 });
  }

  const parsed = z.object({ code: z.string().max(40) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Enter a code." }, { status: 400 });

  const cart = await getCart(user.id);
  const result = await evaluateCoupon(parsed.data.code, cart.subtotalCents);
  if (!result.ok) return Response.json({ error: result.error }, { status: 400 });

  await setCouponCookie(result.code);
  return Response.json(await getCart(user.id, result.code));
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please log in." }, { status: 401 });
  await setCouponCookie(null);
  const cart = await getCartForRequest(user.id);
  return Response.json({ ...cart, coupon: null, discountCents: 0, totalCents: cart.subtotalCents });
}
