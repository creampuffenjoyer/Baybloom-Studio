import "server-only";
import { timingSafeEqual } from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import { db } from "@/lib/db";
import { deliverySignature } from "@/lib/delivery-credentials";

const linkTtlSeconds = 7 * 24 * 3600;

export function projectDeliveryToken(itemId: string, revision: number, now = Date.now()) {
  const value = `${itemId}.${revision}.${Math.floor(now / 1000) + linkTtlSeconds}`;
  return `${value}.${deliverySignature("download-project", value)}`;
}

export function parseProjectDeliveryToken(token: string, now = Date.now()) {
  const match = /^([a-z0-9_-]{1,128})\.(\d{1,9})\.(\d{10})\.([0-9a-f]{64})$/i.exec(token);
  if (!match || Number(match[3]) <= now / 1000) return null;
  const [, orderItemId, revision, expires, signature] = match;
  const expected = deliverySignature("download-project", `${orderItemId}.${revision}.${expires}`);
  if (!timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature, "hex"))) return null;
  return { orderItemId, emailRevision: Number(revision) };
}

export async function findProjectDelivery(token: string, client: PrismaClient = db) {
  const claims = parseProjectDeliveryToken(token);
  if (!claims) return null;
  const job = await client.orderDelivery.findFirst({
    where: { ...claims, OR: [{ readyAt: { not: null }, artifactStorageKey: { not: null } }, { legacyStorageKey: { not: null } }],
      orderItem: { order: { status: "PAID", deliveryEmail: { not: null } } } },
    select: { artifactStorageKey: true, legacyStorageKey: true, orderItem: { select: { designTitle: true } } },
  });
  if (!job) return null;
  const key = job.artifactStorageKey ?? job.legacyStorageKey;
  if (!key) return null;
  const label = job.orderItem.designTitle.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "baybloom";
  return { key, name: `${label}-project.zip` };
}
