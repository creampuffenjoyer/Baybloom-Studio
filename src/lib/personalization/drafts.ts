import "server-only";
import type { PrismaClient } from "@prisma/client";
import { db } from "@/lib/db";
import type { HarborDraft, PersonalizationDraft } from "./harbor-draft";
import { withPhotoQuota } from "./photo-quota";

const template = "harbor-house";

/** All reads and writes are scoped to the authenticated account. */
export function getHarborDraft(userId: string, client: PrismaClient = db) {
  return getDraft(userId, template, client);
}

export function getDraft(userId: string, selectedTemplate: PersonalizationDraft["template"], client: PrismaClient = db) {
  return client.personalizationDraft.findUnique({ where: { userId_template: { userId, template: selectedTemplate } }, select: { content: true, heroImage: true, updatedAt: true } });
}

/** Undefined preserves the existing image; null deliberately removes it. */
export function saveHarborDraft(userId: string, content: HarborDraft, image: Uint8Array<ArrayBuffer> | null | undefined, client: PrismaClient = db) {
  return saveDraft(userId, content, image, client);
}

export function saveDraft(userId: string, content: PersonalizationDraft, image: Uint8Array<ArrayBuffer> | null | undefined, client: PrismaClient = db) {
  const template = content.template;
  return withPhotoQuota(userId, tx => tx.personalizationDraft.upsert({
    where: { userId_template: { userId, template } },
    create: { userId, template, content, heroImage: image },
    update: { content, ...(image === undefined ? {} : { heroImage: image }) },
    select: { updatedAt: true },
  }), client);
}
