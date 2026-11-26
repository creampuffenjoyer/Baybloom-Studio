import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { studioDesigns } from "@/lib/catalog";
import { regularTemplate } from "@/lib/membership-plans";
import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";

export const hasPremium = cache(async (userId: string) => Boolean(await db.membershipPayment.findFirst({
  where: { userId, status: "PAID" }, select: { id: true },
})));

export async function canEdit(userId: string, slug: string) {
  const design = await db.design.findFirst({where: { ...studioDesigns, slug }, select: { id: true }});
  if (design && (regularTemplate(slug) || await hasPremium(userId))) return true;
  return Boolean(await db.orderItem.findFirst({
    where: { design: { slug }, order: { userId, status: "PAID" } }, select: { id: true },
  }));
}

export async function requireEditor(slug: string) {
  const user = await requireUser(`/personalize/${slug}`);
  if (!await canEdit(user.id, slug)) redirect("/membership#premium");
}
