import "server-only";
import { createHash } from "node:crypto";
import type { Order, Prisma, PrismaClient } from "@prisma/client";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { gcashEligible } from "@/lib/checkout-methods";
import { evaluateCoupon, getCart, tierRank } from "@/lib/cart";
import { siteUrl } from "@/lib/email";
import { capturePurchase, isPurchaseTemplate } from "@/lib/personalization/purchases";

export class CheckoutError extends Error {
  constructor(message: string, public status = 409) { super(message); }
}

export function couponId(orderId: string) { return `bb-order-${orderId}`; }

/** Database-only transaction. Row locks serialize buyers and coupon capacity. */
export async function prepareCheckout(
  userId: string, requestKey: string, rawCoupon: string | null, stripeReady: boolean,
  client: PrismaClient = db,
  savedDraftTemplates: readonly string[] = [],
  imageRightsConfirmed = false,
  options?: { method: "STRIPE" | "GCASH"; gcashReady: boolean; deliveryEmail?: string },
) {
  // Serializable isolation captures content/images consistently and detects stale
  // coupon-capacity reads after waiting for a competing transaction's locks.
  const transact = () => client.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${userId} FOR UPDATE`;
    const account = await tx.user.findUnique({
      where: { id: userId },
      select: {
        emailVerified: true, disabled: true, name: true, email: true, phone: true,
        company: true, addressLine1: true, addressLine2: true, city: true,
        region: true, postalCode: true, country: true,
      },
    });
    if (!account || account.disabled) throw new CheckoutError("Please log in.", 401);
    if (!account.emailVerified) throw new CheckoutError("Please verify your email before checking out.", 403);

    const previous = await tx.checkoutRequest.findUnique({
      where: { userId_key: { userId, key: requestKey } }, include: { order: true },
    });
    if (previous) return previous.order;
    const method = options?.method ?? "STRIPE";
    const deliveryEmail = options?.deliveryEmail ?? account.email.toLowerCase();
    if (deliveryEmail !== account.email.toLowerCase()) {
      const verified = await tx.checkoutDeliveryVerification.findUnique({ where: { userId } });
      if (verified?.email !== deliveryEmail || !verified.verifiedAt || verified.expiresAt <= new Date()) {
        throw new CheckoutError("Verify your delivery email before checking out.", 400);
      }
    }
    if (savedDraftTemplates.length && !imageRightsConfirmed) throw new CheckoutError("Confirm you have permission to use the uploaded photos before checkout.", 400);

    // Key includes cart item ids, so a later intentional repurchase gets a new order.
    const base = await getCart(userId, null, tx);
    if (!base.lines.length) throw new CheckoutError("Your cart is empty.", 400);
    if (savedDraftTemplates.some(template => !isPurchaseTemplate(template) || !base.lines.some(line => line.design.slug === template))) {
      throw new CheckoutError("A selected saved draft is not supported or is no longer in your cart.", 400);
    }
    const purchases = new Map<string, Awaited<ReturnType<typeof capturePurchase>>>();
    for (const line of base.lines) {
      if (!isPurchaseTemplate(line.design.slug)) continue;
      try {
        purchases.set(line.design.slug, await capturePurchase(tx, userId, line.design.slug, savedDraftTemplates.includes(line.design.slug)));
      } catch (error) {
        if (retryableCheckoutConflict(error)) throw error;
        throw new CheckoutError(`The ${line.design.title} package could not be captured. Check your saved draft or contact support before paying.`);
      }
    }
    const code = rawCoupon?.trim().toUpperCase() || null;
    const billing = {
      name: account.name, email: account.email, phone: account.phone, company: account.company,
      addressLine1: account.addressLine1, addressLine2: account.addressLine2, city: account.city,
      region: account.region, postalCode: account.postalCode, country: account.country,
    };
    // Database result order and display-copy changes must not create a second
    // payable session for the same priced cart.
    const lines = base.lines.map((line) => ({
      id: line.id, designId: line.design.id, tierId: line.tier.id,
      priceCents: line.tier.priceCents, lineCents: line.lineCents,
      addons: line.addons.map(({ id, priceCents }) => ({ id, priceCents }))
        .sort((a, b) => a.id.localeCompare(b.id)),
    })).sort((a, b) => a.id.localeCompare(b.id));
    const checkoutKey = createHash("sha256")
      .update(JSON.stringify({ userId, lines, currency: base.currency, code, billing,
        purchases: [...purchases].map(([template, purchase]) => ({ template, digest: purchase.digest, mode: purchase.mode })).sort((a, b) => a.template.localeCompare(b.template)),
      })).digest("hex");
    const existing = await tx.order.findUnique({ where: { checkoutKey } });
    if (existing) {
      if (options && existing.status === "PENDING" && (existing.paymentMethod !== method && existing.totalCents > 0
        || (existing.deliveryEmail ?? account.email.toLowerCase()) !== deliveryEmail)) {
        throw new CheckoutError("Close your pending checkout before changing payment method or delivery email.");
      }
      await tx.checkoutRequest.create({ data: { userId, key: requestKey, orderId: existing.id } });
      return existing;
    }
    if (options && await tx.order.findFirst({ where: { userId, status: "PENDING" }, select: { id: true } })) {
      throw new CheckoutError("Close your pending checkout before starting a new one.");
    }

    if (code) {
      await tx.$queryRaw`SELECT "id" FROM "Coupon" WHERE "code" = ${code} FOR UPDATE`;
    }
    let cart = base;
    if (code) {
      const discount = await evaluateCoupon(code, base.subtotalCents, tx);
      if (!discount.ok) throw new CheckoutError(discount.error, 400);
      cart = {
        ...base, coupon: { code: discount.code, label: discount.label },
        discountCents: discount.discountCents, totalCents: base.subtotalCents - discount.discountCents,
      };
      const coupon = await tx.coupon.findUniqueOrThrow({ where: { code } });
      const reserved = await tx.order.count({ where: { couponCode: code, couponReserved: true } });
      if (coupon.maxRedemptions !== null && coupon.redemptions + reserved >= coupon.maxRedemptions) {
        throw new CheckoutError("That code is currently fully used or reserved by another checkout.");
      }
    }
    if (cart.totalCents > 0 && !(method === "GCASH" ? options?.gcashReady : stripeReady)) {
      throw new CheckoutError("That payment method is unavailable.", 503);
    }
    if (cart.totalCents > 0 && method === "GCASH" && !gcashEligible(cart.totalCents, cart.currency)) {
      throw new CheckoutError("This order total is outside the GCash payment limits.", 400);
    }
    if (cart.totalCents > 0 && method === "STRIPE" && cart.totalCents < 2000) {
      throw new CheckoutError("Order totals under ₱20 can't be paid online.", 400);
    }
    const expiresAt = new Date(Math.floor(Date.now() / 1000) * 1000 + 60 * 60_000);
    const legacySources = new Map<string, string>();
    if (options) {
      for (const line of cart.lines) {
        if (purchases.has(line.design.slug)) continue;
        const files = await tx.deliverableFile.findMany({ where: { designId: line.design.id },
          select: { storageKey: true, minTier: { select: { level: true } } }, orderBy: { id: "asc" } });
        const source = files.find(file => /-source\.zip$/i.test(file.storageKey)
          && (!file.minTier || tierRank(file.minTier.level) <= tierRank(line.tier.level)));
        if (!source) throw new CheckoutError(`The ${line.design.title} project ZIP is unavailable. Please contact the studio before paying.`);
        legacySources.set(line.design.id, source.storageKey);
      }
    }
    const order = await tx.order.create({
      data: {
        userId, checkoutKey, checkoutExpiresAt: expiresAt, deliveryEmail,
        paymentMethod: cart.totalCents === 0 ? "FREE" : method,
        couponReserved: Boolean(cart.coupon), couponCode: cart.coupon?.code,
        subtotalCents: cart.subtotalCents, discountCents: cart.discountCents,
        totalCents: cart.totalCents, currency: cart.currency, billing,
        items: { create: cart.lines.map((line) => {
          const purchase = purchases.get(line.design.slug);
          const legacySource = legacySources.get(line.design.id);
          return {
            designId: line.design.id, tierId: line.tier.id, designTitle: line.design.title,
            tierName: line.tier.label, priceCents: line.lineCents, addons: line.addons,
            deploymentRequired: line.addons.some(addon => addon.name === "Hosting setup" && addon.priceCents > 0),
            ...(purchase ? { personalization: { create: {
              template: purchase.snapshot.template, content: purchase.snapshot.content,
              heroImage: purchase.snapshot.heroImage ? Uint8Array.from(purchase.snapshot.heroImage) : null,
              sourceReleaseId: purchase.snapshot.sourceSha256, formatVersion: purchase.snapshot.formatVersion,
              snapshotSha256: purchase.digest, mode: purchase.mode,
              imageRightsConfirmedAt: purchase.mode === "SAVED_DRAFT" ? new Date() : null,
              images: { create: purchase.snapshot.images.map(({ slot, image }) => ({ slot, image: Uint8Array.from(image) })) },
            } }, delivery: { create: {} } } : legacySource ? {
              delivery: { create: { legacyStorageKey: legacySource, nextAt: null } },
            } : {}),
          };
        }) },
      },
    });
    const parameters: Stripe.Checkout.SessionCreateParams = {
      mode: "payment", allowed_payment_method_types: ["card"], client_reference_id: order.id, customer_email: account.email,
      metadata: { orderId: order.id, userId },
      payment_intent_data: { metadata: { orderId: order.id } },
      expires_at: Math.floor(expiresAt.getTime() / 1000),
      line_items: cart.lines.map((line) => ({
        quantity: 1,
        price_data: {
          currency: cart.currency.toLowerCase(), unit_amount: line.lineCents,
          product_data: {
            name: `${line.design.title} (${line.tier.label})`,
            ...(line.addons.length ? { description: `Includes: ${line.addons.map((a) => a.name).join(", ")}` } : {}),
          },
        },
      })),
      ...(cart.discountCents ? { discounts: [{ coupon: couponId(order.id) }] } : {}),
      success_url: siteUrl("/checkout/success?session_id={CHECKOUT_SESSION_ID}"),
      cancel_url: siteUrl("/checkout?canceled=1"),
    };
    const payMongoParameters = {
      data: { attributes: {
        reference_number: order.id, metadata: { orderId: order.id, userId },
        line_items: [{ name: `Baybloom Studio order #${order.id.slice(-8).toUpperCase()}`, quantity: 1,
          amount: cart.totalCents, currency: cart.currency.toUpperCase() }],
        payment_method_types: ["gcash"], send_email_receipt: false, pass_on_fees: false,
        success_url: siteUrl(`/checkout/success?order=${order.id}`), cancel_url: siteUrl("/checkout?canceled=1"),
      } },
    };
    const saved = await tx.order.update({
      where: { id: order.id },
      data: { checkoutParameters: (method === "GCASH" && cart.totalCents > 0 ? payMongoParameters : parameters) as Prisma.InputJsonValue },
    });
    await tx.checkoutRequest.create({ data: { userId, key: requestKey, orderId: order.id } });
    return saved;
  }, { maxWait: 10_000, timeout: 60_000, isolationLevel: "Serializable" });
  for (let attempt = 0; ; attempt++) {
    try {
      return await transact();
    } catch (error) {
      if (attempt < 5 && retryableCheckoutConflict(error)) continue;
      throw error;
    }
  }
}

function retryableCheckoutConflict(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) return false;
  if (error.code === "P2034") return true;
  if (error.code !== "P2002" || !("meta" in error)) return false;
  const target = (error.meta as { target?: string[] } | undefined)?.target;
  return Array.isArray(target) && (target.includes("checkoutKey") || (target.includes("userId") && target.includes("key")));
}

/** Recover an orphaned Stripe response before releasing its reserved coupon slot. */
export async function recoverCheckoutSession(order: Order, gateway: Stripe) {
  if (order.paymentRef) return gateway.checkout.sessions.retrieve(order.paymentRef);
  let found: Stripe.Checkout.Session | null = null;
  await gateway.checkout.sessions.list({
    created: { gte: Math.floor(order.createdAt.getTime() / 1000) - 60 }, limit: 100,
  }).autoPagingEach((session) => {
    if (session.metadata?.orderId === order.id && session.metadata?.userId === order.userId) {
      found = session;
      return false;
    }
  });
  return found;
}
