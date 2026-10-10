import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { orderRef } from "@/lib/orders";
import { requireUser } from "@/lib/session";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { syncCheckoutSession } from "@/lib/stripe-orders";
import { Button } from "@/components/ui/button";
import { PendingRefresher, SuccessCheck, SuccessEffects } from "@/app/(client)/checkout/success/success-client";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default function SuccessPage(props: PageProps<"/checkout/success">) {
  return (
    <div className="container-page max-w-2xl py-16 sm:py-24">
      <Suspense fallback={<div className="shimmer mx-auto h-96 rounded-3xl" />}>
        <Result searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function Result({ searchParams }: Pick<PageProps<"/checkout/success">, "searchParams">) {
  const { session_id, order: orderParam } = await searchParams;
  const user = await requireUser("/account/orders");

  let orderId = typeof orderParam === "string" ? orderParam : null;
  if (typeof session_id === "string" && session_id.startsWith("cs_") && stripeConfigured()) {
    const session = await stripe().checkout.sessions.retrieve(session_id);
    // Only reconcile sessions that belong to this user. The state comes from
    // Stripe's API, never from the URL, so this is as safe as the webhook.
    if (session.metadata?.userId === user.id) orderId = await syncCheckoutSession(session);
  }

  const order = orderId
    ? await db.order.findFirst({
        where: { id: orderId, userId: user.id },
        select: {
          id: true,
          status: true,
          totalCents: true,
          currency: true,
          items: { select: { id: true, designTitle: true, tierName: true } },
        },
      })
    : null;

  if (!order) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-medium">We couldn&apos;t find that order</h1>
        <Button asChild className="mt-6 rounded-full">
          <Link href="/account/orders">View my orders</Link>
        </Button>
      </div>
    );
  }

  if (order.status !== "PAID") {
    return (
      <div className="rounded-3xl bg-white p-8 text-center ring-1 ring-border/70">
        <PendingRefresher active={order.status === "PENDING"} />
        <h1 className="text-3xl font-medium">
          {order.status === "PENDING" ? "Confirming your payment…" : "Payment didn't go through"}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {order.status === "PENDING"
            ? "This usually takes a few seconds. We'll email you as soon as it's confirmed."
            : "You haven't been charged. You can try again from your cart."}
        </p>
        <Button asChild variant="outline" className="mt-6 rounded-full bg-white">
          <Link href={order.status === "PENDING" ? "/account/orders" : "/checkout"}>
            {order.status === "PENDING" ? "View my orders" : "Back to checkout"}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-8 text-center ring-1 ring-border/70 sm:p-12">
      <SuccessEffects />
      <SuccessCheck />
      <h1 className="mt-6 text-4xl font-medium">Thank you!</h1>
      <p className="mt-3 text-muted-foreground">
        Order {orderRef(order.id)} is confirmed. A receipt is on its way to your inbox.
      </p>
      <ul className="mx-auto mt-8 max-w-sm divide-y divide-border/70 text-left text-sm">
        {order.items.map((i) => (
          <li key={i.id} className="flex justify-between py-3">
            <span className="font-medium text-bay">{i.designTitle}</span>
            <span className="text-muted-foreground">{i.tierName}</span>
          </li>
        ))}
        <li className="flex justify-between py-3 font-medium">
          <span>Total paid</span>
          <span>{formatPrice(order.totalCents, order.currency)}</span>
        </li>
      </ul>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild className="rounded-full bg-hibiscus-strong px-6 text-white hover:bg-hibiscus-strong/90">
          <Link href={`/account/orders/${order.id}`}>Download your files</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full bg-white">
          <Link href="/designs">Keep browsing</Link>
        </Button>
      </div>
    </div>
  );
}
