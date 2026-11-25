import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getDeliveryAdmin } from "@/lib/delivery-admin";
import { orderRef } from "@/lib/orders";
import { DeliveryUrlForm } from "./delivery-url-form";

export const metadata = { title: "Project deliveries", robots: { index: false } };

export default function AdminDeliveries({ searchParams }: PageProps<"/admin/deliveries">) {
  return <main className="container-page space-y-6 py-10">
    <h1 className="text-3xl font-medium">Project deliveries</h1>
    <Suspense fallback={<p>Loading deliveries…</p>}><Deliveries searchParams={searchParams} /></Suspense>
  </main>;
}

async function Deliveries({ searchParams }: Pick<PageProps<"/admin/deliveries">, "searchParams">) {
  if (!await getDeliveryAdmin()) notFound();
  const { page } = await searchParams;
  const parsed = typeof page === "string" && /^\d{1,5}$/.test(page) ? Number(page) : 1;
  const current = Math.max(1, parsed);
  const size = 25;
  const jobs = await db.orderDelivery.findMany({
    where: { orderItem: { order: { status: "PAID", deliveryEmail: { not: null } } } },
    orderBy: [{ orderItem: { order: { createdAt: "desc" } } }, { orderItemId: "asc" }],
    skip: (current - 1) * size, take: size + 1,
    select: { orderItemId: true, deploymentUrl: true, readyAt: true, legacyStorageKey: true, emailRevision: true, emailPayload: true, emailSentAt: true, emailError: true,
      lastError: true, orderItem: { select: { designTitle: true, deploymentRequired: true,
        order: { select: { id: true, deliveryEmail: true, confirmationSentAt: true, confirmationAttempts: true } },
      } },
    },
  });

  return <>
    {!jobs.length && <p>No deliveries on this page.</p>}
    <ul className="grid gap-4 md:grid-cols-2">
      {jobs.slice(0, size).map(job => {
        const { order, deploymentRequired, designTitle } = job.orderItem;
        const editableUrl = job.emailRevision === 0 && !job.emailPayload;
        const status = job.emailSentAt ? "Emailed" : job.emailError || (!order.confirmationSentAt && order.confirmationAttempts >= 8)
          ? "Email needs attention" : deploymentRequired && !job.deploymentUrl ? "Waiting for live URL"
          : !job.readyAt && !job.legacyStorageKey ? "Preparing ZIP" : "Email queued";
        return <li key={job.orderItemId} className="rounded-2xl border border-border bg-white p-5">
          <h2 className="text-lg font-semibold">{designTitle}</h2>
          <p className="mt-1 break-words text-sm text-muted-foreground">{orderRef(order.id)} · {order.deliveryEmail}</p>
          <p className="mt-2 text-sm font-semibold">{status}</p>
          {job.lastError && <p className="mt-2 text-sm text-destructive">{job.lastError}</p>}
          {job.emailError && <p className="mt-2 text-sm text-destructive">{job.emailError}</p>}
          {deploymentRequired && editableUrl && <DeliveryUrlForm orderItemId={job.orderItemId} initialUrl={job.deploymentUrl} />}
          {deploymentRequired && !editableUrl && job.deploymentUrl && <a className="mt-2 inline-block text-sm text-bay underline" href={job.deploymentUrl} target="_blank" rel="noopener noreferrer">Open deployed site</a>}
        </li>;
      })}
    </ul>
    <nav aria-label="Delivery pages" className="flex gap-4 text-sm text-bay">
      {current > 1 && <Link className="underline" href={`?page=${current - 1}`}>Previous</Link>}
      {jobs.length > size && <Link className="underline" href={`?page=${current + 1}`}>Next</Link>}
    </nav>
  </>;
}
