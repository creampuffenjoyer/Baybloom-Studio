import "server-only";
import { randomUUID } from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import { db } from "@/lib/db";
import { actionEmail, sendEmail, siteUrl } from "@/lib/email";
import { orderRef } from "@/lib/orders";
import { projectDeliveryToken } from "@/lib/project-delivery-link";

export async function deliverProjectEmails(client: PrismaClient = db, send = sendEmail, batchSize = 3) {
  const result = { sent: 0, failed: 0 };
  for (let index = 0; index < batchSize; index++) {
    const lease = randomUUID();
    const job = await client.$transaction(async tx => {
      const [candidate] = await tx.$queryRaw<{ orderItemId: string }[]>`
        SELECT d."orderItemId" FROM "OrderDelivery" d
        JOIN "OrderItem" i ON i."id" = d."orderItemId"
        JOIN "Order" o ON o."id" = i."orderId"
        WHERE o."status" = 'PAID' AND o."deliveryEmail" IS NOT NULL AND o."confirmationSentAt" IS NOT NULL
          AND ((d."readyAt" IS NOT NULL AND d."artifactStorageKey" IS NOT NULL) OR d."legacyStorageKey" IS NOT NULL)
          AND (NOT i."deploymentRequired" OR d."deploymentUrl" IS NOT NULL)
          AND d."emailSentAt" IS NULL AND d."emailNextAt" <= CURRENT_TIMESTAMP AND d."emailAttempts" < 8
          AND (d."emailLeaseUntil" IS NULL OR d."emailLeaseUntil" < CURRENT_TIMESTAMP)
        ORDER BY d."emailNextAt" FOR UPDATE OF d SKIP LOCKED LIMIT 1
      `;
      if (!candidate) return null;
      const delivery = await tx.orderDelivery.findUniqueOrThrow({ where: candidate,
        include: { orderItem: { include: { order: { select: { id: true, deliveryEmail: true } } } } },
      });
      const { orderItem: item, emailRevision: revision } = delivery;
      const now = new Date();
      if (delivery.emailFirstAttemptAt && now.getTime() - delivery.emailFirstAttemptAt.getTime() >= 23 * 3600_000) {
        await tx.orderDelivery.update({ where: candidate, data: { emailNextAt: null,
          emailError: "The provider retry window ended. Check Resend before sending again." } });
        return null;
      }
      const ref = orderRef(item.order.id);
      const liveUrl = item.deploymentRequired ? delivery.deploymentUrl : null;
      const email = actionEmail({
        heading: "Your Baybloom project is ready",
        body: `Your ${item.designTitle} project from order ${ref} is ready to download.`,
        cta: "Download project ZIP",
        url: siteUrl(`/api/project-delivery/${projectDeliveryToken(item.id, revision, now.getTime())}`),
        footer: "Your download link is valid for seven days. The purchaser can request a new link from their order.",
        ...(liveUrl && { secondary: { cta: "Open your live website", url: liveUrl } }),
      });
      const payload = delivery.emailPayload ?? {
        to: item.order.deliveryEmail!, subject: `Your ${item.designTitle} project is ready · ${ref}`, ...email,
      };
      await tx.orderDelivery.update({ where: candidate, data: {
        emailPayload: payload, emailLeaseToken: lease, emailLeaseUntil: new Date(now.getTime() + 120_000),
        emailAttempts: { increment: 1 }, emailFirstAttemptAt: delivery.emailFirstAttemptAt ?? now,
      } });
      return { orderItemId: item.id, revision, attempts: delivery.emailAttempts + 1,
        payload: payload as Parameters<typeof sendEmail>[0] };
    });
    if (!job) break;
    const claim = { orderItemId: job.orderItemId, emailLeaseToken: lease };
    try {
      const authorized = await client.orderDelivery.count({ where: { ...claim, orderItem: { order: { status: "PAID" } } } });
      if (!authorized) {
        await client.orderDelivery.updateMany({ where: claim, data: { emailLeaseToken: null, emailLeaseUntil: null, emailNextAt: null } });
        continue;
      }
      await send(job.payload, `project-delivery/${job.orderItemId}/${job.revision}`);
      const { count } = await client.orderDelivery.updateMany({ where: claim,
        data: { emailSentAt: new Date(), emailNextAt: null, emailLeaseToken: null, emailLeaseUntil: null, emailError: null },
      });
      result.sent += count;
    } catch {
      await client.orderDelivery.updateMany({ where: claim, data: {
        emailNextAt: job.attempts >= 8 ? null : new Date(Date.now() + Math.min(3600_000, 60_000 * 2 ** (job.attempts - 1))),
        emailLeaseToken: null, emailLeaseUntil: null, emailError: "Project email could not be confirmed by the email provider.",
      } });
      result.failed++;
    }
  }
  return result;
}
