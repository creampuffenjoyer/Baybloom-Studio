"use server";

import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import { addFavorite, removeFavorite } from "@/lib/favorites";

const input = z.object({ designId: z.string().min(1).max(64), favorite: z.boolean() });

export async function setFavoriteAction(
  designId: string,
  favorite: boolean,
): Promise<{ ok: boolean; favorite: boolean; reason?: "signed-out" | "invalid" }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, favorite: false, reason: "signed-out" };

  const parsed = input.safeParse({ designId, favorite });
  if (!parsed.success) return { ok: false, favorite: !favorite, reason: "invalid" };

  if (parsed.data.favorite) {
    const ok = await addFavorite(user.id, parsed.data.designId);
    return ok ? { ok, favorite: true } : { ok, favorite: false, reason: "invalid" };
  }
  await removeFavorite(user.id, parsed.data.designId);
  return { ok: true, favorite: false };
}
