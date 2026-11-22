import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUser } from "@/lib/session";
import { CartView } from "@/app/(store)/(client)/cart/cart-view";
import { PageHeading } from "@/components/layout/page-heading";

export const metadata: Metadata = { title: "Cart", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <PageHeading eyebrow="Your selection" title="Your cart">
        <p>Review your designs and chosen tiers before moving on to checkout.</p>
      </PageHeading>
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
