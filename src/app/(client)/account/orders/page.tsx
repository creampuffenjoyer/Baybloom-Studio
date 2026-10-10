import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import type { OrderStatus } from "@prisma/client";
import { ReceiptTextIcon } from "lucide-react";
import { getOrders } from "@/lib/account";
import { formatPrice } from "@/lib/format";
import { requireUser } from "@/lib/session";
import { ListSkeleton } from "@/app/(client)/account/skeletons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Orders & downloads" };

const STATUS: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: "Awaiting payment", className: "bg-[#fff4e5] text-[#8a4f06]" },
  PAID: { label: "Paid", className: "bg-secondary text-bay-deep" },
  FAILED: { label: "Payment failed", className: "bg-destructive/10 text-destructive" },
  REFUNDED: { label: "Refunded", className: "bg-sand-deep text-ink/70" },
};

export default function OrdersPage() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <Orders />
    </Suspense>
  );
}

async function Orders() {
  const user = await requireUser("/account/orders");
  const orders = await getOrders(user.id);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-white/60 px-6 py-16 text-center">
        <ReceiptTextIcon className="size-10 text-seaglass" aria-hidden />
        <h2 className="mt-4 text-2xl font-medium">No orders yet</h2>
        <p className="mt-2 max-w-sm text-muted-foreground">
          When you buy a design, your receipt and download links will appear here.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link href="/designs">Browse designs</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {orders.map((order) => {
        const status = STATUS[order.status];
        return (
          <li key={order.id} className="rounded-3xl bg-white p-5 ring-1 ring-border/70 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
              <div>
                <p className="text-sm font-medium text-ink">
                  Order #{order.id.slice(-8).toUpperCase()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {order.createdAt.toLocaleDateString("en-PH", { dateStyle: "medium" })}
                </p>
              </div>
              <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", status.className)}>
                {status.label}
              </span>
            </div>
            <ul className="divide-y divide-border/60">
              {order.items.map((item) => {
                const addons = (item.addons as { name: string }[] | null) ?? [];
                return (
                  <li key={item.id} className="flex items-center gap-4 py-4">
                    <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-sand-deep">
                      <Image src={item.design.heroImage} alt="" fill sizes="80px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link href={`/designs/${item.design.slug}`} className="font-medium text-bay hover:underline">
                        {item.designTitle}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {item.tierName}
                        {addons.length > 0 && ` + ${addons.map((a) => a.name).join(", ")}`}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-medium">{formatPrice(item.priceCents, order.currency)}</p>
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
              <p className="text-xs text-muted-foreground">
                {order.status === "PAID"
                  ? "Download links are sent by email and will appear here."
                  : order.couponCode
                    ? `Coupon ${order.couponCode} applied`
                    : " "}
              </p>
              <p className="text-sm">
                Total <span className="ml-2 font-serif text-xl text-bay">{formatPrice(order.totalCents, order.currency)}</span>
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
