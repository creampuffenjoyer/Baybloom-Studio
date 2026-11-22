import "server-only";
import { randomUUID } from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import { db } from "@/lib/db";
import { reportEvent } from "@/lib/monitoring";
import { captureReleaseSnapshot, packageTemplateSnapshot } from "./export";
import { isPurchaseTemplate, sha256, snapshotDigest } from "./purchases";
import { cacheSourceRelease, readCachedSourceRelease, storePurchaseArtifact } from "@/lib/storage";

/** Claim with SKIP LOCKED, build outside the transaction, and fence stale workers. */
export async function deliverPurchases(client: PrismaClient = db, packageSnapshot = packageTemplateSnapshot, batchSize = 2, persistArtifact = storePurchaseArtifact) {
  const result = { ready: 0, failed: 0 };
  for (let index = 0; index < batchSize; index++) {
    const token = randomUUID();
    const job = await client.$transaction(async tx => {
      const [candidate] = await tx.$queryRaw<{ orderItemId: string }[]>`
        SELECT d."orderItemId" FROM "OrderDelivery" d
        JOIN "OrderItem" i ON i."id" = d."orderItemId"
        JOIN "Order" o ON o."id" = i."orderId"
        WHERE o."status" = 'PAID' AND d."readyAt" IS NULL
          AND d."nextAt" <= CURRENT_TIMESTAMP AND d."attempts" < 8
          AND (d."leaseUntil" IS NULL OR d."leaseUntil" < CURRENT_TIMESTAMP)
        ORDER BY d."nextAt" FOR UPDATE OF d SKIP LOCKED LIMIT 1
      `;
      if (!candidate) return null;
      return tx.orderDelivery.update({ where: candidate, data: {
        attempts: { increment: 1 }, leaseToken: token, leaseUntil: new Date(Date.now() + 180_000),
      } });
    });
    if (!job) break;
    try {
      const item = await client.orderItem.findUniqueOrThrow({ where: { id: job.orderItemId },
        include: { personalization: { include: {
          sourceRelease: { select: { template: true, templateVersion: true, contentVersion: true } }, images: true,
        } } } });
      const saved = item.personalization;
      if (!saved?.sourceRelease || saved.formatVersion !== 1) throw new Error("Missing pinned source");
      const release = saved.sourceRelease;
      if (!isPurchaseTemplate(saved.template) || release.contentVersion !== 1 || !saved.sourceReleaseId) throw new Error("Unsupported purchase snapshot");
      const snapshot = captureReleaseSnapshot({ template: saved.template, templateVersion: release.templateVersion,
        contentVersion: release.contentVersion, sourceSha256: saved.sourceReleaseId }, saved.content, {
        heroImage: saved.heroImage, images: saved.images.map(({ slot, image }) => ({ slot, image })),
      });
      if (snapshot.template !== saved.template || snapshot.templateVersion !== release.templateVersion ||
          snapshot.contentVersion !== release.contentVersion || release.template !== saved.template ||
          snapshotDigest(snapshot) !== saved.snapshotSha256) throw new Error("Snapshot integrity mismatch");
      let archive = await readCachedSourceRelease(saved.sourceReleaseId);
      if (!archive) {
        const source = await client.templateRelease.findUniqueOrThrow({ where: { sha256: saved.sourceReleaseId }, select: { archive: true } });
        if (sha256(source.archive) !== saved.sourceReleaseId) throw new Error("Retained source integrity mismatch");
        await cacheSourceRelease(saved.sourceReleaseId, source.archive);
        archive = Buffer.from(source.archive);
      }
      const artifact = await packageSnapshot(archive, snapshot);
      const stored = await persistArtifact(artifact);
      const { count } = await client.orderDelivery.updateMany({
        where: { orderItemId: job.orderItemId, leaseToken: token, orderItem: { order: { status: "PAID" } } },
        data: { artifactStorageKey: stored.key, artifactSha256: stored.sha256, readyAt: new Date(), nextAt: null, leaseToken: null, leaseUntil: null, lastError: null },
      });
      result.ready += count;
    } catch {
      await client.orderDelivery.updateMany({ where: { orderItemId: job.orderItemId, leaseToken: token }, data: {
        nextAt: job.attempts >= 8 ? null : new Date(Date.now() + Math.min(3600_000, 60_000 * 2 ** (job.attempts - 1))),
        leaseToken: null, leaseUntil: null, lastError: "Package generation failed. Review the pinned release and snapshot before retrying.",
      } });
      result.failed++;
      reportEvent(job.attempts >= 8 ? "purchase_delivery_exhausted" : "purchase_delivery_retry", { orderItemId: job.orderItemId, attempts: job.attempts });
    }
  }
  return result;
}
