"use client";

import { useState } from "react";
import { Loader2Icon, LockIcon } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { CartLines, CartTotals, CouponField, EmptyCart } from "@/components/cart/cart-contents";
import { Button } from "@/components/ui/button";

export function CheckoutPanel({
  billing,
  emailVerified,
  stripeReady,
}: {
  billing: React.ReactNode;
  emailVerified: boolean;
  stripeReady: boolean;
}) {
  const { cart } = useCart();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!cart) return <div className="shimmer h-96 rounded-3xl" aria-hidden />;
  if (cart.lines.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-white/60">
        <EmptyCart />
      </div>
    );
  }

  // Fully discounted orders complete without Stripe.
  const blockedReason = !emailVerified
    ? "Verify your email to continue."
    : !stripeReady && cart.totalCents > 0
      ? "Online payments aren't set up yet."
      : null;
  const canPay = blockedReason === null;

  async function pay() {
    setPending(true);
    setError(null);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok && body.url) {
      window.location.assign(body.url);
      return;
    }
    setError(body.error ?? "Something went wrong. Please try again.");
    setPending(false);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
      <div className="space-y-6">
        {billing}
        <section aria-label="Order items" className="rounded-3xl bg-white px-6 pt-2 ring-1 ring-border/70">
          <CartLines />
        </section>
      </div>
      <aside className="space-y-5 self-start rounded-3xl bg-white p-6 shadow-[0_24px_60px_-30px_rgb(15_76_92/0.35)] ring-1 ring-border/70 lg:sticky lg:top-24">
        <h2 className="text-2xl font-medium">Order summary</h2>
        <CouponField />
        <CartTotals />
        {error && (
          <p role="alert" className="rounded-lg bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
            {error}
          </p>
        )}
        <Button
          onClick={pay}
          disabled={!canPay || pending}
          className="h-12 w-full rounded-full bg-hibiscus-strong text-base text-white hover:bg-hibiscus-strong/90"
        >
          {pending ? <Loader2Icon className="animate-spin" /> : <LockIcon />}
          {cart.totalCents === 0 ? "Complete order" : "Pay securely"}
        </Button>
        {blockedReason ? (
          <p className="text-center text-sm text-muted-foreground">{blockedReason}</p>
        ) : (
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            You&apos;ll be taken to Stripe to pay by card. Your files unlock as soon as the payment
            is confirmed.
          </p>
        )}
      </aside>
    </div>
  );
}
