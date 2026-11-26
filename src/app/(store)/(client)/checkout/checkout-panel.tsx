"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, LockIcon } from "lucide-react";
import { CartStatus } from "@/components/cart/cart-status";
import { useCart } from "@/components/cart/cart-provider";
import { CartLines, CartTotals, CouponField, EmptyCart } from "@/components/cart/cart-contents";
import { Button } from "@/components/ui/button";
import { StudioOrderContact } from "@/components/studio-order-contact";
import { OrderContactDialog } from "@/components/order-contact-dialog";
import { gcashEligible } from "@/lib/checkout-methods";
import { DeliveryEmailField } from "./delivery-email-field";

export function CheckoutPanel({
  billing,
  onlineCheckout,
  emailVerified,
  stripeReady,
  gcashReady,
  accountEmail,
  pendingOrder,
  purchaseOptions,
}: {
  billing: React.ReactNode;
  onlineCheckout: boolean;
  emailVerified: boolean;
  stripeReady: boolean;
  gcashReady: boolean;
  accountEmail: string;
  pendingOrder: { id: string; paymentMethod: "STRIPE" | "GCASH" | "FREE"; deliveryEmail: string | null } | null;
  purchaseOptions: { template: string; savedAt: string | null; releaseReady: boolean }[];
}) {
  const { cart, loadState, busy } = useCart();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedDraftTemplates, setSavedDraftTemplates] = useState<string[]>([]);
  const [imageRightsConfirmed, setImageRightsConfirmed] = useState(false);
  const [deliveryEmail, setDeliveryEmail] = useState(accountEmail);
  const [verifiedRecipient, setVerifiedRecipient] = useState("");
  const [method, setMethod] = useState<"STRIPE" | "GCASH">(stripeReady ? "STRIPE" : "GCASH");
  const attempt = useRef<{ fingerprint: string; key: string } | null>(null);
  const submitting = useRef(false);

  function clearAttempt() {
    attempt.current = null;
    try { sessionStorage.removeItem("bb:checkout-attempt"); } catch { /* Storage unavailable. */ }
  }

  async function managePending(action: "resume" | "close") {
    if (!pendingOrder || submitting.current) return;
    submitting.current = true;
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/checkout/pending", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: pendingOrder.id, action }),
      });
      const result = await response.json();
      if (!response.ok) setError(result.error ?? "We couldn't check that payment.");
      else if (result.url) window.location.assign(result.url);
      else if (result.closed) { clearAttempt(); router.refresh(); }
    } catch {
      setError("We couldn't reach checkout. Try again.");
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  const pendingPayment = pendingOrder && <section className="space-y-3 rounded-xl border border-border bg-sand p-4">
    <h3 className="font-semibold">Pending checkout</h3>
    <p className="text-sm">Resume your {pendingOrder.paymentMethod === "GCASH" ? "GCash" : pendingOrder.paymentMethod === "STRIPE" ? "card" : "discounted"} order{pendingOrder.deliveryEmail && <> for <strong className="break-all">{pendingOrder.deliveryEmail}</strong></>}.
      {pendingOrder.paymentMethod !== "FREE" && " Close it before choosing a different payment method or delivery email."}</p>
    <div className="flex flex-wrap gap-2">
      <Button type="button" onClick={() => void managePending("resume")} disabled={pending}>Resume checkout</Button>
      {pendingOrder.paymentMethod !== "FREE" && <Button type="button" variant="outline" onClick={() => void managePending("close")} disabled={pending}>Close pending checkout</Button>}
    </div>
  </section>;
  if (!cart || loadState !== "ready") return <CartStatus />;
  if (cart.lines.length === 0) {
    return <div className="space-y-4">{pendingPayment}{error && <p role="alert">{error}</p>}<EmptyCart /></div>;
  }

  const offerGCash = onlineCheckout && gcashReady && gcashEligible(cart.totalCents, cart.currency);
  const offerCard = onlineCheckout && stripeReady && cart.totalCents >= 2000;
  const selectedMethod = method === "GCASH" && offerGCash || !offerCard && offerGCash ? "GCASH" : "STRIPE";
  const recipient = deliveryEmail.trim().toLowerCase();
  const pilotLines = cart.lines.filter(line => purchaseOptions.some(option => option.template === line.design.slug));
  const selectedDrafts = savedDraftTemplates.filter(template => pilotLines.some(line => line.design.slug === template));
  const missingRelease = pilotLines.some(line => !purchaseOptions.find(option => option.template === line.design.slug)?.releaseReady);
  const blockedReason = !onlineCheckout ? null : !emailVerified
    ? "Verify your email to continue."
    : missingRelease ? "A source package is being prepared for a template in your cart. Please return later or contact support."
    : selectedDrafts.length > 0 && !imageRightsConfirmed ? "Confirm photo permissions to continue."
    : recipient !== accountEmail.toLowerCase() && (!recipient || recipient !== verifiedRecipient) ? "Verify your delivery email to continue."
    : !offerGCash && !offerCard && cart.totalCents > 0
      ? "Online payment is unavailable for this total. You can contact the developer."
      : null;
  const canPay = blockedReason === null && !busy && !pendingOrder;

  async function pay() {
    if (!onlineCheckout || submitting.current || !cart || !canPay || loadState !== "ready") return;
    submitting.current = true;
    setPending(true);
    setError(null);
    const fingerprint = JSON.stringify({ lines: cart.lines, coupon: cart.coupon, total: cart.totalCents, savedDraftTemplates: [...selectedDrafts].sort(),
      imageRightsConfirmed, method: selectedMethod, deliveryEmail: recipient });
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
        body: JSON.stringify({ savedDraftTemplates: selectedDrafts, imageRightsConfirmed, method: selectedMethod, deliveryEmail: recipient }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.url) {
        window.location.assign(body.url);
        return;
      }
      if (body.resetAttempt) clearAttempt();
      router.refresh();
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
        <DeliveryEmailField email={pendingOrder ? pendingOrder.deliveryEmail ?? accountEmail : deliveryEmail}
          accountEmail={accountEmail} onChange={setDeliveryEmail} onVerified={setVerifiedRecipient}
          disabled={!emailVerified || pending || !!pendingOrder} locked={!!pendingOrder} />
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
        {pendingPayment}
        {cart.totalCents > 0 && !pendingOrder && (offerCard || offerGCash) && (
          <fieldset disabled={pending} className="grid gap-2">
            <legend className="mb-2 text-sm font-semibold">Payment method</legend>
            {offerCard && <label className="flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm">
              <input type="radio" name="payment-method" checked={selectedMethod === "STRIPE"} onChange={() => setMethod("STRIPE")} /> Pay by card with Stripe
            </label>}
            {offerGCash && <label className="flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm">
              <input type="radio" name="payment-method" checked={selectedMethod === "GCASH"} onChange={() => setMethod("GCASH")} /> Pay with GCash
            </label>}
          </fieldset>
        )}
        {error && (
          <p role="alert" className="rounded-lg bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
            {error}
          </p>
        )}
        {!onlineCheckout ? <OrderContactDialog subject="Baybloom studio order" details={cart.lines.map(line =>
          [`${line.design.title} (${line.tier.label})`, ...line.addons.map(addon => `Add-on: ${addon.name}`)].join("\n"),
        ).join("\n\n")}>
          <Button type="button" className="h-12 w-full rounded-full bg-hibiscus-strong text-base text-white hover:bg-hibiscus-strong/90">
            <LockIcon /> {cart.totalCents === 0 ? "Complete order" : "Pay securely"}
          </Button>
        </OrderContactDialog> : !pendingOrder && <Button
          onClick={pay}
          disabled={!canPay || pending}
          className="h-12 w-full rounded-full bg-hibiscus-strong text-base text-white hover:bg-hibiscus-strong/90"
        >
          {pending ? <Loader2Icon className="animate-spin" /> : <LockIcon />}
          {cart.totalCents === 0 ? "Complete order" : selectedMethod === "GCASH" ? "Continue to GCash" : "Pay securely"}
        </Button>}
        {blockedReason ? (
          <p className="text-center text-sm text-muted-foreground">{blockedReason}</p>
        ) : (
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            We’ll email your project links when they’re ready.
          </p>
        )}
        <StudioOrderContact />
      </aside>
    </div>
  );
}
