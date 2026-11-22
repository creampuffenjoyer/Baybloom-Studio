"use client";

import Link from "next/link";
import { LockIcon } from "lucide-react";
import { CartStatus } from "@/components/cart/cart-status";
import { useCart } from "@/components/cart/cart-provider";
import { CartLines, CartTotals, CouponField, EmptyCart } from "@/components/cart/cart-contents";
import { Button } from "@/components/ui/button";

export function CartView() {
  const { cart, loadState } = useCart();
  if (!cart || loadState !== "ready") return <CartStatus />;
  if (cart.lines.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section aria-label="Items" className="min-w-0 rounded-2xl bg-white px-4 ring-1 ring-border sm:px-6">
        <CartLines />
      </section>
      <aside className="min-w-0 space-y-5 self-start rounded-2xl bg-white p-6 ring-1 ring-border lg:sticky lg:top-24">
        <h2 className="text-2xl font-medium">Summary</h2>
        <CouponField />
        <CartTotals />
        <Button
          asChild
          className="h-12 w-full rounded-lg bg-hibiscus-strong text-base text-white hover:bg-hibiscus-strong/90"
        >
          <Link href="/checkout">Continue to checkout</Link>
        </Button>
        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <LockIcon className="size-3" /> Payments are processed securely by Stripe.
        </p>
      </aside>
    </div>
  );
}
