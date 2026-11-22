import "server-only";
import type { PrismaClient, TierLevel } from "@prisma/client";
import { db } from "@/lib/db";
import { tierRank } from "@/lib/cart";
import { PURCHASE_SOURCE_FILE } from "@/lib/personalization/purchases";

type FileRow = { id: string; name: string; sizeBytes: number | null; minTier: { level: TierLevel } | null };

/** Files a purchased tier includes: everything from the starter level up to it. */
function entitled<T extends FileRow>(files: T[], purchased: TierLevel) {
  return files.filter((f) => !f.minTier || tierRank(f.minTier.level) <= tierRank(purchased));
}

/** For each paid order item of a user, the files they may download. */
export async function getDownloadsForOrder(userId: string, orderId: string, client: PrismaClient = db) {
  const order = await client.order.findFirst({
    where: { id: orderId, userId, status: "PAID" },
    select: {
      items: {
        select: {
          id: true,
          personalization: { select: { template: true, mode: true } },
          delivery: { select: { readyAt: true, attempts: true, artifactSha256: true } },
          tier: { select: { level: true } },
          design: {
            select: {
              files: {
                orderBy: { name: "asc" },
                select: { id: true, name: true, storageKey: true, sizeBytes: true, minTier: { select: { level: true } } },
              },
            },
          },
        },
      },
    },
  });
  if (!order) return {};
  return Object.fromEntries(
    order.items.map((i) => [
      i.id,
      [
        ...(i.personalization ? [{ id: PURCHASE_SOURCE_FILE,
          name: `${i.personalization.template}-${i.personalization.mode === "ORIGINAL" ? "original" : "personalized"}.zip`, sizeBytes: null,
          status: i.delivery?.readyAt ? "ready" : !i.delivery || i.delivery.attempts >= 8 ? "unavailable" : "preparing",
        }] : []),
        ...entitled(i.design.files, i.tier.level)
          .filter(file => !i.personalization || !isSourceArchive(file.storageKey))
          .map(({ id, name, sizeBytes }) => ({ id, name, sizeBytes, status: "ready" })),
      ],
    ]),
  ) as Record<string, { id: string; name: string; sizeBytes: number | null; status: string }[]>;
}

const isSourceArchive = (key: string) => /-source\.zip$/i.test(key);

/** Ownership + payment + tier check for a single download. */
export async function authorizeDownload(userId: string, orderItemId: string, fileId: string, client: PrismaClient = db) {
  const item = await client.orderItem.findFirst({
    where: { id: orderItemId, order: { userId, status: "PAID" } },
    select: { designId: true, tier: { select: { level: true } }, personalization: { select: { orderItemId: true } } },
  });
  if (!item) return null;
  const file = await client.deliverableFile.findFirst({
    where: { id: fileId, designId: item.designId },
    select: { id: true, name: true, storageKey: true, sizeBytes: true, minTier: { select: { level: true } } },
  });
  if (!file || entitled([file], item.tier.level).length === 0) return null;
  if (item.personalization && isSourceArchive(file.storageKey)) return null;
  return file;
}
