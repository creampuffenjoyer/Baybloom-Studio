import "server-only";
import { randomUUID } from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import { db } from "@/lib/db";
import { actionEmail, sendEmail, siteUrl } from "@/lib/email";
import { formatPrice } from "@/lib/format";
import { orderRef } from "@/lib/orders";
import { reportEvent } from "@/lib/monitoring";

/** Order columns form an outbox: enqueue is atomic with payment fulfillment.
 * Leases recover crashed workers. Provider delivery is at-least-once.
 */
export async function deliverConfirmations(client: PrismaClient = db, send = sendEmail, batchSize = 10) {
  const result = { sent: 0, failed: 0 };
  for (let index = 0; index < batchSize; index++) {
    const token = randomUUID();
    const job = await client.$transaction(async (tx) => {
      const [candidate] = await tx.$queryRaw<{ id: string }[]>`
        SELECT "id" FROM "Order" WHERE "status" = 'PAID'
          AND "confirmationSentAt" IS NULL AND "confirmationNextAt" <= CURRENT_TIMESTAMP
          AND "confirmationAttempts" < 8
          AND ("confirmationLeaseUntil" IS NULL OR "confirmationLeaseUntil" < CURRENT_TIMESTAMP)
        ORDER BY "confirmationNextAt" FOR UPDATE SKIP LOCKED LIMIT 1
      `;
      if (!candidate) return null;
      const order = await tx.order.findUniqueOrThrow({ where: { id: candidate.id },
        include: { user: { select: { email: true, name: true } }, items: true } });
      const ref = orderRef(order.id);
      const items = order.items.map((item) => `${item.designTitle} (${item.tierName})`).join(", ");
      const confirmation = order.totalCents === 0
        ? `Your order for ${items} is confirmed.`
        : `Your payment of ${formatPrice(order.totalCents, order.currency)} for ${items} was received.`;
      const delivery = order.deliveryEmail
        ? "We’ll email each project when it’s ready. If you purchased Hosting setup, the project email will include its live website link."
        : "Open your order to download your files or check package preparation.";
      const payload = order.confirmationPayload ?? {
        to: order.deliveryEmail ?? order.user.email, subject: `Your Baybloom Studio order ${ref}`,
        ...actionEmail({ heading: `Thank you${order.user.name ? `, ${order.user.name.split(" ")[0]}` : ""}!`,
          body: `${confirmation} ${delivery}`,
          cta: "View receipt & downloads", url: siteUrl(`/account/orders/${order.id}`),
          footer: `Order ${ref}. Download links in your account are refreshed each time you open them.` }),
      };
      await tx.order.update({ where: { id: order.id }, data: {
        confirmationPayload: payload, confirmationLeaseToken: token,
        confirmationLeaseUntil: new Date(Date.now() + 120_000),
        confirmationAttempts: { increment: 1 },
      } });
      return { id: order.id, attempts: order.confirmationAttempts + 1, payload };
    });
    if (!job) break;
    try {
      await send(job.payload as Parameters<typeof sendEmail>[0], `order-confirmation/${job.id}`);
      await client.order.updateMany({ where: { id: job.id, confirmationLeaseToken: token }, data: {
        confirmationSentAt: new Date(), confirmationNextAt: null,
        confirmationLeaseUntil: null, confirmationLeaseToken: null,
      } });
      result.sent++;
    } catch {
      await client.order.updateMany({ where: { id: job.id, confirmationLeaseToken: token }, data: {
        confirmationNextAt: job.attempts >= 8 ? null : new Date(Date.now() + Math.min(3600_000, 60_000 * 2 ** (job.attempts - 1))),
        confirmationLeaseUntil: null, confirmationLeaseToken: null,
      } });
      result.failed++;
      reportEvent(job.attempts >= 8 ? "confirmation_exhausted" : "confirmation_retry", { orderId: job.id, attempts: job.attempts });
    }
  }
  return result;
}
