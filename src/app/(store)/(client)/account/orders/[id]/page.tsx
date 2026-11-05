import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeftIcon, DownloadIcon, ExternalLinkIcon, FileIcon } from "lucide-react";
import { db } from "@/lib/db";
import { getDownloadsForOrder } from "@/lib/deliverables";
import { formatPrice } from "@/lib/format";
import { orderRef } from "@/lib/orders";
import { requireUser } from "@/lib/session";
import { ListSkeleton } from "@/app/(store)/(client)/account/skeletons";
import { PrintButton } from "@/app/(store)/(client)/account/orders/[id]/print-button";

export const metadata: Metadata = { title: "Order receipt" };

type Billing = {
  name?: string | null;
  email?: string;
  phone?: string | null;
  company?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  region?: string | null;
  postalCode?: string | null;
  country?: string;
};

const countryName = new Intl.DisplayNames(["en"], { type: "region" });

function fileSize(bytes: number | null) {
  if (!bytes) return "";
  return bytes > 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1000))} KB`;
}

export default function OrderPage(props: PageProps<"/account/orders/[id]">) {
  return (
    <Suspense fallback={<ListSkeleton rows={2} />}>
      <Order params={props.params} />
    </Suspense>
  );
}

async function Order({ params }: Pick<PageProps<"/account/orders/[id]">, "params">) {
  const { id } = await params;
  const user = await requireUser(`/account/orders/${id}`);
  const order = await db.order.findFirst({
    where: { id, userId: user.id },
    select: {
      id: true,
      status: true,
      subtotalCents: true,
      discountCents: true,
      totalCents: true,
      currency: true,
      couponCode: true,
      createdAt: true,
      paidAt: true,
      receiptUrl: true,
      billing: true,
      items: {
        select: { id: true, designTitle: true, tierName: true, priceCents: true, addons: true, design: { select: { slug: true } } },
      },
    },
  });
  if (!order) notFound();

  const downloads = await getDownloadsForOrder(user.id, order.id);
  const billing = (order.billing ?? {}) as Billing;
  const address = [
    billing.addressLine1,
    billing.addressLine2,
    [billing.city, billing.region, billing.postalCode].filter(Boolean).join(", "),
    billing.country && countryName.of(billing.country),
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/account/orders" className="inline-flex items-center gap-1.5 text-sm font-medium text-bay hover:underline">
          <ArrowLeftIcon className="size-4" /> All orders
        </Link>
        <div className="flex gap-2">
          {order.receiptUrl && (
            <a
              href={order.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-white px-4 text-sm font-medium hover:border-bay/40"
            >
              Stripe receipt <ExternalLinkIcon className="size-3.5" />
            </a>
          )}
          <PrintButton />
        </div>
      </div>

      <article className="rounded-3xl bg-white p-6 ring-1 ring-border/70 sm:p-10 print:p-0 print:ring-0">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-border/70 pb-6">
          <div>
            <p className="font-serif text-xl font-semibold text-bay">Baybloom Studio</p>
            <p className="mt-1 text-sm text-muted-foreground">Receipt</p>
          </div>
          <dl className="text-right text-sm">
            <dt className="sr-only">Order</dt>
            <dd className="font-medium">Order {orderRef(order.id)}</dd>
            <dt className="sr-only">Date</dt>
            <dd className="text-muted-foreground">
              {(order.paidAt ?? order.createdAt).toLocaleDateString("en-PH", { dateStyle: "long" })}
            </dd>
            <dt className="sr-only">Status</dt>
            <dd className="mt-1 inline-block rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-bay-deep">
              {order.status === "PAID" ? "Paid" : order.status.charAt(0) + order.status.slice(1).toLowerCase()}
            </dd>
          </dl>
        </header>

        <section className="grid gap-4 border-b border-border/70 py-6 text-sm sm:grid-cols-2">
          <div>
            <h2 className="font-sans text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">Billed to</h2>
            <p className="mt-2 font-medium">{billing.name}</p>
            {billing.company && <p>{billing.company}</p>}
            {address.map((line) => (
              <p key={line as string} className="text-ink/80">{line}</p>
            ))}
          </div>
          <div className="sm:text-right">
            <h2 className="font-sans text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">Contact</h2>
            <p className="mt-2">{billing.email}</p>
            {billing.phone && <p>{billing.phone}</p>}
          </div>
        </section>

        <ul className="divide-y divide-border/70">
          {order.items.map((item) => {
            const addons = (item.addons as { name: string; priceCents: number }[] | null) ?? [];
            const files = downloads[item.id] ?? [];
            return (
              <li key={item.id} className="py-5">
                <div className="flex justify-between gap-4">
                  <div>
                    <Link href={`/designs/${item.design.slug}`} className="font-medium text-bay hover:underline">
                      {item.designTitle}
                    </Link>
                    <p className="text-sm text-muted-foreground">{item.tierName} tier</p>
                    {addons.map((a) => (
                      <p key={a.name} className="text-sm text-muted-foreground">
                        + {a.name} ({formatPrice(a.priceCents, order.currency)})
                      </p>
                    ))}
                  </div>
                  <p className="font-medium">{formatPrice(item.priceCents, order.currency)}</p>
                </div>
                {files.length > 0 && (
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2 print:hidden">
                    {files.map((f) => (
                      <li key={f.id}>
                        <a
                          href={`/api/downloads/${item.id}?file=${f.id}`}
                          className="group flex items-center gap-3 rounded-xl border border-border bg-sand/60 px-3 py-2.5 text-sm transition hover:border-bay/40 hover:bg-white"
                        >
                          <FileIcon className="size-4 shrink-0 text-bay" aria-hidden />
                          <span className="min-w-0 flex-1 truncate">{f.name}</span>
                          <span className="text-xs text-muted-foreground">{fileSize(f.sizeBytes)}</span>
                          <DownloadIcon className="size-4 text-muted-foreground transition group-hover:text-bay" aria-hidden />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        <dl className="ml-auto max-w-xs space-y-1.5 border-t border-border/70 pt-5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatPrice(order.subtotalCents, order.currency)}</dd>
          </div>
          {order.discountCents > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Discount{order.couponCode && ` (${order.couponCode})`}</dt>
              <dd>−{formatPrice(order.discountCents, order.currency)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatPrice(order.totalCents, order.currency)}</dd>
          </div>
        </dl>

        {order.status === "PAID" && (
          <p className="mt-8 text-xs text-muted-foreground print:hidden">
            Download links are generated on demand and expire after 5 minutes. Come back here any time to download again.
          </p>
        )}
      </article>
    </div>
  );
}
