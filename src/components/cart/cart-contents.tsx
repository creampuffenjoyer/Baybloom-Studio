"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2Icon, ShoppingBagIcon, TagIcon, Trash2Icon, XIcon } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/layout/empty-state";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function CartLines({ onNavigate }: { onNavigate?: () => void }) {
  const { cart, remove, busy } = useCart();
  if (!cart) return null;

  return (
    <ul className="divide-y divide-border/70">
      <AnimatePresence initial={false}>
        {cart.lines.map((l) => (
          <motion.li
            key={l.id}
            layout
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24, height: 0, paddingTop: 0, paddingBottom: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-[64px_minmax(0,1fr)] gap-x-3 gap-y-2 overflow-hidden py-5 sm:grid-cols-[80px_minmax(0,1fr)_auto] sm:gap-x-4"
          >
            <Link
              href={`/designs/${l.design.slug}`}
              onClick={onNavigate}
              className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-sand-deep sm:w-20"
              aria-label={`View ${l.design.title}`}
            >
              <Image src={l.design.heroImage} alt="" fill sizes="80px" className="object-cover object-top" />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={`/designs/${l.design.slug}`}
                onClick={onNavigate}
                className="font-medium text-bay hover:underline"
              >
                {l.design.title}
              </Link>
              <p className="text-sm text-muted-foreground">
                {l.tier.label} · {formatPrice(l.tier.priceCents)}
              </p>
              {l.addons.length > 0 && (
                <ul className="mt-1 text-xs text-muted-foreground">
                  {l.addons.map((a) => (
                    <li key={a.id}>
                      + {a.name} ({formatPrice(a.priceCents)})
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="col-start-2 flex items-center justify-between gap-2 sm:col-start-auto sm:flex-col sm:items-end">
              <span className="text-sm font-semibold tabular-nums">{formatPrice(l.lineCents, cart.currency)}</span>
              <button
                type="button"
                onClick={() => remove(l.id)}
                disabled={busy}
                aria-label={`Remove ${l.design.title} from cart`}
                className="grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-sand-deep hover:text-destructive disabled:opacity-50"
              >
                <Trash2Icon className="size-4" />
              </button>
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

export function CouponField() {
  const { cart, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const couponId = useId();
  const fieldError = error ?? cart?.couponError;
  if (!cart || cart.lines.length === 0) return null;

  if (cart.coupon) {
    return (
      <div className="flex items-center justify-between rounded-xl bg-secondary px-3 py-2 text-sm">
        <span className="flex items-center gap-2 text-bay-deep">
          <TagIcon className="size-4" /> <b>{cart.coupon.code}</b> · {cart.coupon.label}
        </span>
        <button
          type="button"
          onClick={removeCoupon}
          aria-label="Remove promo code"
          className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-white"
        >
          <XIcon className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        const err = await applyCoupon(code);
        setPending(false);
        setError(err);
        if (!err) setCode("");
      }}
      className="space-y-1.5"
    >
      <div className="flex gap-2">
        <label htmlFor={couponId} className="sr-only">
          Promo code
        </label>
        <Input
          id={couponId}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Promo code"
          autoComplete="off"
          aria-invalid={fieldError ? true : undefined}
          aria-describedby={fieldError ? `${couponId}-error` : undefined}
          className="h-11 bg-white uppercase"
        />
        <Button type="submit" variant="outline" disabled={pending || !code.trim()} className="h-11 bg-white">
          {pending ? <Loader2Icon className="animate-spin" /> : "Apply"}
        </Button>
      </div>
      {fieldError && (
        <p id={`${couponId}-error`} role="alert" className="text-sm text-destructive">
          {fieldError}
        </p>
      )}
    </form>
  );
}

export function CartTotals({ className }: { className?: string }) {
  const { cart } = useCart();
  if (!cart || cart.lines.length === 0) return null;
  return (
    <dl className={cn("space-y-1.5 text-sm", className)}>
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd>{formatPrice(cart.subtotalCents, cart.currency)}</dd>
      </div>
      {cart.discountCents > 0 && (
        <div className="flex justify-between text-hibiscus-strong">
          <dt>Discount</dt>
          <dd>−{formatPrice(cart.discountCents, cart.currency)}</dd>
        </div>
      )}
      <div className="flex items-baseline justify-between border-t border-border pt-2">
        <dt className="font-medium">Total</dt>
        <dd className="font-serif text-2xl text-bay">
          <motion.span key={cart.totalCents} initial={{ opacity: 0.4, y: -4 }} animate={{ opacity: 1, y: 0 }}>
            {formatPrice(cart.totalCents, cart.currency)}
          </motion.span>
        </dd>
      </div>
    </dl>
  );
}

export function EmptyCart({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <EmptyState icon={ShoppingBagIcon} title="Your cart is empty" action={<Button asChild className="h-12 rounded-lg px-6" onClick={onNavigate}><Link href="/designs">Explore templates</Link></Button>}>
      <p>Find a design that fits your business and choose a tier to get started.</p>
    </EmptyState>
  );
}
