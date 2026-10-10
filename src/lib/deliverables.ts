import "server-only";
import type { TierLevel } from "@prisma/client";
import { db } from "@/lib/db";
import { tierRank } from "@/lib/cart";

type FileRow = { id: string; name: string; sizeBytes: number | null; minTier: { level: TierLevel } | null };

/** Files a purchased tier includes: everything from the starter level up to it. */
function entitled(files: FileRow[], purchased: TierLevel) {
  return files.filter((f) => !f.minTier || tierRank(f.minTier.level) <= tierRank(purchased));
}

/** For each paid order item of a user, the files they may download. */
export async function getDownloadsForOrder(userId: string, orderId: string) {
  const order = await db.order.findFirst({
    where: { id: orderId, userId, status: "PAID" },
    select: {
      items: {
        select: {
          id: true,
          tier: { select: { level: true } },
          design: {
            select: {
              files: {
                orderBy: { name: "asc" },
                select: { id: true, name: true, sizeBytes: true, minTier: { select: { level: true } } },
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
      entitled(i.design.files, i.tier.level).map(({ id, name, sizeBytes }) => ({ id, name, sizeBytes })),
    ]),
  ) as Record<string, { id: string; name: string; sizeBytes: number | null }[]>;
}

/** Ownership + payment + tier check for a single download. */
export async function authorizeDownload(userId: string, orderItemId: string, fileId: string) {
  const item = await db.orderItem.findFirst({
    where: { id: orderItemId, order: { userId, status: "PAID" } },
    select: { designId: true, tier: { select: { level: true } } },
  });
  if (!item) return null;
  const file = await db.deliverableFile.findFirst({
    where: { id: fileId, designId: item.designId },
    select: { id: true, name: true, storageKey: true, sizeBytes: true, minTier: { select: { level: true } } },
  });
  if (!file || entitled([file], item.tier.level).length === 0) return null;
  return file;
}
