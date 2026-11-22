import "server-only";
import { createHash } from "node:crypto";
import type { Prisma, PrismaClient } from "@prisma/client";
import { db } from "@/lib/db";
import definitions from "./export-templates.json";
import { captureTemplateSnapshot, captureReleaseSnapshot, type TemplateSnapshot, type ExportTemplate } from "./export";
import { emptyDraft } from "./harbor-draft";
import { cacheSourceRelease } from "@/lib/storage";

export const PURCHASE_SOURCE_FILE = "purchased-source";
export const purchaseTemplates = Object.keys(definitions) as ExportTemplate[];
export const isPurchaseTemplate = (template: string): template is ExportTemplate => purchaseTemplates.includes(template as ExportTemplate);
export const sha256 = (bytes: Uint8Array | string) => createHash("sha256").update(bytes).digest("hex");
const compareKeys = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;

// PostgreSQL JSONB may reorder object keys. Hash semantic data canonically.
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value).sort(([a], [b]) => compareKeys(a, b));
    return "{" + entries.map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(",") + "}";
  }
  return JSON.stringify(value);
}

export function snapshotDigest(snapshot: TemplateSnapshot) {
  return sha256(canonical({ ...snapshot,
    heroImage: snapshot.heroImage ? sha256(snapshot.heroImage) : null,
    images: snapshot.images.map(({ slot, image }) => ({ slot, sha256: sha256(image) })).sort((a, b) => compareKeys(a.slot, b.slot)),
  }));
}

/** Explicit release registration accepts trusted operator-supplied archives only. */
export async function registerTemplateRelease(template: ExportTemplate, archive: Uint8Array, client: PrismaClient = db) {
  const snapshot = captureTemplateSnapshot(archive, emptyDraft(template), { heroImage: null, images: [] });
  if (snapshot.template !== template) throw new Error("Release template mismatch");
  // Commit the large immutable insert before activation. A crash between these
  // statements leaves a safe inactive release; retrying finishes activation.
  await client.templateRelease.createMany({ data: [{ sha256: snapshot.sourceSha256, template,
    templateVersion: snapshot.templateVersion, contentVersion: snapshot.contentVersion, archive: Uint8Array.from(archive) }], skipDuplicates: true });
  await cacheSourceRelease(snapshot.sourceSha256, archive);
  await client.activeTemplateRelease.upsert({ where: { template }, create: { template, releaseId: snapshot.sourceSha256 }, update: { releaseId: snapshot.sourceSha256 } });
  return snapshot.sourceSha256;
}

/** Called inside checkout, with the buyer's user row locked. Never accepts a draft id. */
export async function capturePurchase(tx: Prisma.TransactionClient, userId: string, template: ExportTemplate, useSavedDraft: boolean) {
  const active = await tx.activeTemplateRelease.findUnique({ where: { template }, select: {
    releaseId: true, release: { select: { template: true, templateVersion: true, contentVersion: true } },
  } });
  if (!active || active.release.template !== template) throw new Error("A verified source release is not available for this template.");
  const draft = useSavedDraft ? await tx.personalizationDraft.findUnique({
    where: { userId_template: { userId, template } }, include: { images: { orderBy: { slot: "asc" } } },
  }) : null;
  if (useSavedDraft && !draft) throw new Error("Your saved draft is no longer available. Save it again before checkout.");
  if (active.release.contentVersion !== 1) throw new Error("Unsupported content version");
  const snapshot = captureReleaseSnapshot({ template, templateVersion: active.release.templateVersion,
    contentVersion: active.release.contentVersion, sourceSha256: active.releaseId },
    draft?.content ?? emptyDraft(template), draft ?? { heroImage: null, images: [] });
  return { snapshot, digest: snapshotDigest(snapshot), mode: useSavedDraft ? "SAVED_DRAFT" : "ORIGINAL" };
}

/** Every request rechecks payment and purchaser identity; no membership dependency. */
export async function getPurchasedDownload(userId: string, orderItemId: string, client: PrismaClient = db) {
  const item = await client.orderItem.findFirst({
    where: { id: orderItemId, order: { userId, status: "PAID" } },
    select: { personalization: { select: { template: true, sourceReleaseId: true } },
      delivery: { select: { artifactStorageKey: true, artifactSha256: true, readyAt: true, attempts: true } } },
  });
  if (!item?.personalization) return null;
  if (!item.personalization.sourceReleaseId || !item.delivery) return { status: "unavailable" as const };
  const job = item.delivery;
  if (!job.artifactStorageKey) return { status: job.attempts >= 8 || job.readyAt ? "unavailable" as const : "preparing" as const };
  if (job.artifactStorageKey !== `purchases/artifacts/${job.artifactSha256}.zip`) throw new Error("Purchase artifact integrity mismatch");
  return { status: "ready" as const, storageKey: job.artifactStorageKey, sha256: job.artifactSha256!, name: `${item.personalization.template}-purchased.zip` };
}
