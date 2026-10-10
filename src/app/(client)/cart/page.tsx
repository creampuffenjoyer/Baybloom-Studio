import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUser } from "@/lib/session";
import { CartView } from "@/app/(client)/cart/cart-view";

export const metadata: Metadata = { title: "Cart", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <h1 className="text-4xl font-medium sm:text-5xl">Your cart</h1>
      <div className="mt-10">
        <Suspense fallback={<div className="shimmer h-80 rounded-3xl" />}>
          <Gate />
        </Suspense>
      </div>
    </div>
  );
}

async function Gate() {
  await requireUser("/cart");
  return <CartView />;
}
