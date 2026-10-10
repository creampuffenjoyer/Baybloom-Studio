import { db } from "@/lib/db";
import { getCartForRequest, setCouponCookie } from "@/lib/cart-request";
import { getCurrentUser } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { createPendingOrder, fulfillOrder } from "@/lib/orders";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { siteUrl } from "@/lib/email";

/** Stripe's minimum charge for PHP is ₱20; below that we can't take payment. */
const STRIPE_MIN_PHP_CENTS = 2000;

const fail = (error: string, status: number) => Response.json({ error }, { status });

/**
 * POST /api/checkout: creates a PENDING order from the server-side cart and a
 * Stripe Checkout Session for it. Returns { url } to redirect the browser to.
 */
export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return fail("Unsupported content type.", 415);
  }
  const user = await getCurrentUser();
  if (!user?.email) return fail("Please log in.", 401);
  if (!rateLimit(`checkout:${user.id}`, 10, 10 * 60_000).ok) {
    return fail("Too many checkout attempts. Please wait a few minutes.", 429);
  }

  const account = await db.user.findUnique({
    where: { id: user.id },
    select: {
      emailVerified: true,
      name: true,
      email: true,
      phone: true,
      company: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      region: true,
      postalCode: true,
      country: true,
    },
  });
  if (!account) return fail("Please log in.", 401);

  const cart = await getCartForRequest(user.id);
  if (cart.lines.length === 0) return fail("Your cart is empty.", 400);
  if (cart.couponError) return fail(cart.couponError, 400);

  const { emailVerified, ...billing } = account;
  if (!emailVerified) return fail("Please verify your email before checking out.", 403);

  // Fully discounted orders don't go through Stripe.
  if (cart.totalCents === 0) {
    const order = await createPendingOrder(user.id, cart, billing);
    await fulfillOrder(order.id);
    await setCouponCookie(null);
    return Response.json({ url: `/checkout/success?order=${order.id}` });
  }

  if (!stripeConfigured()) return fail("Online payments aren't set up yet.", 503);
  if (cart.totalCents < STRIPE_MIN_PHP_CENTS) {
    return fail("Order totals under ₱20 can't be paid online.", 400);
  }

  const order = await createPendingOrder(user.id, cart, billing);
  const client = stripe();

  const discounts = cart.discountCents
    ? [
        {
          coupon: (
            await client.coupons.create(
              {
                amount_off: cart.discountCents,
                currency: "php",
                duration: "once",
                max_redemptions: 1,
                name: cart.coupon?.code ?? "Discount",
                metadata: { orderId: order.id },
              },
              { idempotencyKey: `coupon-${order.id}` },
            )
          ).id,
        },
      ]
    : undefined;

  const session = await client.checkout.sessions.create(
    {
      mode: "payment",
      client_reference_id: order.id,
      customer_email: account.email,
      metadata: { orderId: order.id, userId: user.id },
      payment_intent_data: { metadata: { orderId: order.id } },
      line_items: cart.lines.map((l) => ({
        quantity: 1,
        price_data: {
          currency: "php",
          unit_amount: l.lineCents,
          product_data: {
            name: `${l.design.title} (${l.tier.label})`,
            ...(l.addons.length > 0 && {
              description: `Includes: ${l.addons.map((a) => a.name).join(", ")}`,
            }),
            images: [siteUrl(l.design.heroImage)].filter((u) => u.startsWith("https://")),
          },
        },
      })),
      discounts,
      success_url: siteUrl("/checkout/success?session_id={CHECKOUT_SESSION_ID}"),
      cancel_url: siteUrl("/checkout?canceled=1"),
    },
    { idempotencyKey: `checkout-${order.id}` },
  );

  await db.order.update({ where: { id: order.id }, data: { paymentRef: session.id } });
  return Response.json({ url: session.url });
}
