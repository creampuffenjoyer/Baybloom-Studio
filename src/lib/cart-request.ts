import "server-only";
import { cookies } from "next/headers";
import { COUPON_COOKIE, getCart } from "@/lib/cart";

/** The signed-in user's cart, with the coupon saved in their cookie applied. */
export async function getCartForRequest(userId: string) {
  const code = (await cookies()).get(COUPON_COOKIE)?.value ?? null;
  return getCart(userId, code);
}

export async function setCouponCookie(code: string | null) {
  const jar = await cookies();
  if (!code) {
    jar.delete(COUPON_COOKIE);
    return;
  }
  jar.set(COUPON_COOKIE, code, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}
