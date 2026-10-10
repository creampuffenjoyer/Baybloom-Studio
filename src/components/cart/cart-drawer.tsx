"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { ShoppingBagIcon } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { CartLines, CartTotals, CouponField, EmptyCart } from "@/components/cart/cart-contents";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

/** Slide-in cart (spec §7.1). Opens after "Add to cart" and from the header. */
export function CartDrawer() {
  const { cart, open, setOpen } = useCart();
  const close = () => setOpen(false);
  const empty = !cart || cart.lines.length === 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 bg-sand sm:max-w-md">
        <SheetHeader className="border-b border-border/70">
          <SheetTitle className="font-serif text-2xl text-bay">Your cart</SheetTitle>
          <SheetDescription>
            {empty ? "Nothing here yet." : `${cart.lines.length} ${cart.lines.length === 1 ? "design" : "designs"}`}
          </SheetDescription>
        </SheetHeader>
        {empty ? (
          <EmptyCart onNavigate={close} />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4">
              <CartLines onNavigate={close} />
            </div>
            <div className="space-y-4 border-t border-border/70 bg-white/60 p-4">
              <CouponField />
              <CartTotals />
              <div className="grid gap-2">
                <Button
                  asChild
                  className="h-12 rounded-full bg-hibiscus-strong text-base text-white hover:bg-hibiscus-strong/90"
                >
                  <Link href="/checkout" onClick={close}>
                    Checkout
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="rounded-full text-bay">
                  <Link href="/cart" onClick={close}>
                    View full cart
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

/** Header bag icon with an animated count badge. */
export function CartButton() {
  const { cart, setOpen } = useCart();
  const pathname = usePathname();
  const count = cart?.lines.length ?? 0;
  if (pathname.startsWith("/checkout")) return null;

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
      className="relative grid size-9 place-items-center rounded-full text-bay transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <ShoppingBagIcon className="size-5" />
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0.4 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
          className="absolute -top-0.5 -right-0.5 grid size-[18px] place-items-center rounded-full bg-hibiscus-strong text-[10px] font-bold text-white"
        >
          {count}
        </motion.span>
      )}
    </button>
  );
}
