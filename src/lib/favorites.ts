import "server-only";
import { db } from "@/lib/db";

export async function addFavorite(userId: string, designId: string) {
  const design = await db.design.findFirst({
    where: { id: designId, status: "PUBLISHED" },
    select: { id: true },
  });
  if (!design) return false;
  await db.favorite.upsert({
    where: { userId_designId: { userId, designId } },
    create: { userId, designId },
    update: {},
  });
  return true;
}

export async function removeFavorite(userId: string, designId: string) {
  await db.favorite.deleteMany({ where: { userId, designId } });
}

export async function getFavoriteIds(userId: string, designIds?: string[]) {
  const rows = await db.favorite.findMany({
    where: { userId, ...(designIds && { designId: { in: designIds } }) },
    select: { designId: true },
  });
  return rows.map((r) => r.designId);
}

/** The user's favorite design ids, most recently saved first. */
export async function getFavoriteDesignIds(userId: string) {
  const rows = await db.favorite.findMany({
    where: { userId, design: { status: "PUBLISHED" } },
    orderBy: { createdAt: "desc" },
    select: { designId: true },
  });
  return rows.map((r) => r.designId);
}
