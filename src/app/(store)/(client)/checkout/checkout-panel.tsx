"use client";

import { useRef, useState } from "react";
import { Loader2Icon, LockIcon } from "lucide-react";
import { CartStatus } from "@/components/cart/cart-status";
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
  const { cart, loadState, busy } = useCart();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const attempt = useRef<{ fingerprint: string; key: string } | null>(null);
  const submitting = useRef(false);

  if (!cart || loadState !== "ready") return <CartStatus />;
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
  const canPay = blockedReason === null && !busy;

  async function pay() {
    if (submitting.current || !cart || busy || loadState !== "ready") return;
    submitting.current = true;
    setPending(true);
    setError(null);
    const fingerprint = JSON.stringify({ lines: cart.lines, coupon: cart.coupon, total: cart.totalCents });
    try {
      if (!attempt.current) {
        try {
          const saved = JSON.parse(sessionStorage.getItem("bb:checkout-attempt") ?? "null");
          if (saved && typeof saved.key === "string" && typeof saved.fingerprint === "string") attempt.current = saved;
        } catch { /* Session storage may be unavailable. The server also deduplicates cart snapshots. */ }
      }
      if (attempt.current?.fingerprint !== fingerprint) {
        attempt.current = { fingerprint, key: crypto.randomUUID() };
      }
      try { sessionStorage.setItem("bb:checkout-attempt", JSON.stringify(attempt.current)); } catch { /* Use the in-memory key. */ }
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": attempt.current.key },
        body: "{}",
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.url) {
        window.location.assign(body.url);
        return;
      }
      if (body.resetAttempt) {
        attempt.current = null;
        try { sessionStorage.removeItem("bb:checkout-attempt"); } catch { /* Storage unavailable. */ }
      }
      setError(body.error ?? "Something went wrong. Please try again.");
    } catch {
      setError("We couldn't reach checkout. Please retry; your previous attempt will be reused.");
    } finally {
      submitting.current = false;
      setPending(false);
    }
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
