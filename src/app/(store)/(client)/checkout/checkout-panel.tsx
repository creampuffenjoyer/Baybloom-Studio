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
  purchaseOptions,
}: {
  billing: React.ReactNode;
  emailVerified: boolean;
  stripeReady: boolean;
  purchaseOptions: { template: string; savedAt: string | null; releaseReady: boolean }[];
}) {
  const { cart, loadState, busy } = useCart();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedDraftTemplates, setSavedDraftTemplates] = useState<string[]>([]);
  const [imageRightsConfirmed, setImageRightsConfirmed] = useState(false);
  const attempt = useRef<{ fingerprint: string; key: string } | null>(null);
  const submitting = useRef(false);

  if (!cart || loadState !== "ready") return <CartStatus />;
  if (cart.lines.length === 0) {
    return <EmptyCart />;
  }

  // Fully discounted orders complete without Stripe.
  const pilotLines = cart.lines.filter(line => purchaseOptions.some(option => option.template === line.design.slug));
  const selectedDrafts = savedDraftTemplates.filter(template => pilotLines.some(line => line.design.slug === template));
  const missingRelease = pilotLines.some(line => !purchaseOptions.find(option => option.template === line.design.slug)?.releaseReady);
  const blockedReason = !emailVerified
    ? "Verify your email to continue."
    : missingRelease ? "A source package is being prepared for a template in your cart. Please return later or contact support."
    : selectedDrafts.length > 0 && !imageRightsConfirmed ? "Confirm photo permissions to continue."
    : !stripeReady && cart.totalCents > 0
      ? "Online payments aren't set up yet."
      : null;
  const canPay = blockedReason === null && !busy;

  async function pay() {
    if (submitting.current || !cart || busy || loadState !== "ready") return;
    submitting.current = true;
    setPending(true);
    setError(null);
    const fingerprint = JSON.stringify({ lines: cart.lines, coupon: cart.coupon, total: cart.totalCents, savedDraftTemplates: selectedDrafts.sort(), imageRightsConfirmed });
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
        body: JSON.stringify({ savedDraftTemplates: selectedDrafts, imageRightsConfirmed }),
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
        {pilotLines.length > 0 && (
          <section aria-label="Website content" className="space-y-5 rounded-3xl bg-white p-6 ring-1 ring-border/70">
            <h2 className="text-2xl font-medium">Choose your website content</h2>
            <p className="text-sm text-muted-foreground">Your choice is saved when checkout starts. Later draft changes won&apos;t change this purchase. Save your latest editor changes before continuing.</p>
            {pilotLines.map(line => {
              const option = purchaseOptions.find(item => item.template === line.design.slug)!;
              return (
                <fieldset key={line.id} disabled={pending} className="space-y-2 text-sm">
                  <legend className="mb-2 font-medium">{line.design.title}</legend>
                  <label className="flex items-center gap-2">
                    <input type="radio" name={`content-${line.id}`} checked={!savedDraftTemplates.includes(line.design.slug)} onChange={() => setSavedDraftTemplates(items => items.filter(template => template !== line.design.slug))} />
                    Original template content
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name={`content-${line.id}`} disabled={!option.savedAt || !option.releaseReady} checked={savedDraftTemplates.includes(line.design.slug)} onChange={() => setSavedDraftTemplates(items => [...items.filter(template => template !== line.design.slug), line.design.slug])} />
                    My saved content and photos
                  </label>
                  <p className="text-xs text-muted-foreground">{option.savedAt ? `Draft saved ${option.savedAt.slice(0, 16).replace("T", " ")} UTC.` : "Save a draft in the editor to use your own content."}</p>
                  <a href={`/personalize/${line.design.slug}`} className="inline-block text-bay underline">Review saved draft</a>
                </fieldset>
              );
            })}
            {selectedDrafts.length > 0 && <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" checked={imageRightsConfirmed} disabled={pending} onChange={event => setImageRightsConfirmed(event.target.checked)} className="mt-1" />
              I have permission to use the photos in my saved drafts and include them in my purchased website.
            </label>}
          </section>
        )}
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
            {cart.totalCents > 0 ? "You’ll be taken to Stripe to pay by card. " : ""}Your order will show downloads and package preparation after payment is confirmed.
          </p>
        )}
      </aside>
    </div>
  );
}
