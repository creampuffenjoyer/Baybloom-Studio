"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2Icon, ShoppingBagIcon, TagIcon, Trash2Icon, XIcon } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function CartLines({ onNavigate }: { onNavigate?: () => void }) {
  const { cart, remove } = useCart();
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
            className="flex gap-4 overflow-hidden py-4"
          >
            <Link
              href={`/designs/${l.design.slug}`}
              onClick={onNavigate}
              className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-sand-deep"
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
            <div className="flex shrink-0 flex-col items-end justify-between">
              <span className="text-sm font-semibold">{formatPrice(l.lineCents, cart.currency)}</span>
              <button
                type="button"
                onClick={() => remove(l.id)}
                aria-label={`Remove ${l.design.title} from cart`}
                className="grid size-8 place-items-center rounded-full text-muted-foreground transition hover:bg-sand-deep hover:text-destructive"
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
          className="grid size-7 place-items-center rounded-full hover:bg-white"
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
        <label htmlFor="coupon" className="sr-only">
          Promo code
        </label>
        <Input
          id="coupon"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Promo code"
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "coupon-error" : undefined}
          className="h-10 bg-white uppercase"
        />
        <Button type="submit" variant="outline" disabled={pending || !code.trim()} className="h-10 bg-white">
          {pending ? <Loader2Icon className="animate-spin" /> : "Apply"}
        </Button>
      </div>
      {(error || cart.couponError) && (
        <p id="coupon-error" className="text-xs text-destructive">
          {error ?? cart.couponError}
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
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <ShoppingBagIcon className="size-10 text-seaglass" aria-hidden />
      <p className="mt-4 font-serif text-2xl text-bay">Your cart is empty</p>
      <p className="mt-2 text-sm text-muted-foreground">Pick a design and a tier to get started.</p>
      <Button asChild className="mt-6 rounded-full" onClick={onNavigate}>
        <Link href="/designs">Browse designs</Link>
      </Button>
    </div>
  );
}
