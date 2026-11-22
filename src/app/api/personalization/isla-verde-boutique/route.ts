import { withVerifiedStorageWrite } from "@/lib/personalization/verified-writes";
import { PHOTO_REGISTRY } from "@/templates/isla-verde-boutique/photo-placements";
﻿import { getDraft, saveDraft } from "@/lib/personalization/drafts";
import { parseIslaDraft } from "@/lib/personalization/harbor-draft";
import { getCurrentUser } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { isSameOriginJsonRequest } from "@/lib/personalization/request";
import { normalizeHeroImage, MAX_IMAGE_BYTES } from "@/lib/personalization/image";
import { z } from "zod";
import { db } from "@/lib/db";
import { ISLA_PHOTO_KEYS } from "@/lib/personalization/isla-photos";

const headers = { "Cache-Control": "private, no-store" };

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Sign in to access your saved draft." }, { status: 401, headers });
  const draft = await getDraft(user.id, "isla-verde-boutique");
  if (!draft) return Response.json({ draft: null }, { headers });
  const parsed = parseIslaDraft(draft.content);
  if (!parsed.success) return Response.json({ error: "This draft cannot be opened. Please contact support." }, { status: 500, headers });
  const photos = await db.personalizationDraftImage.findMany({ where: { draft: { userId: user.id, template: "isla-verde-boutique" }, slot: { in: ISLA_PHOTO_KEYS.map((key) => `photo:${key}`) } }, select: { slot: true, updatedAt: true } });
  const placementPhotos = await db.personalizationDraftImage.findMany({ where: { draft: { userId: user.id, template: "isla-verde-boutique" }, slot: { in: PHOTO_REGISTRY.placements.map(item => `placement:${item.id}`) } }, select: { slot: true, updatedAt: true } });
  return Response.json({ placementPhotos: placementPhotos.map(item => ({ ...item, slot: item.slot.slice(10) })), draft: parsed.data, hasPhoto: !!draft.heroImage, updatedAt: draft.updatedAt, photos: photos.map((item) => ({ ...item, slot: item.slot.slice("photo:".length) })) }, { headers });
}

async function putPhoto(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Sign in to save your draft." }, { status: 401, headers });
  if (!isSameOriginJsonRequest(request)) {
    return Response.json({ error: "Invalid request." }, { status: 403, headers });
  }
  if (!(await rateLimit(`personalization:${user.id}`, 60, 60_000)).ok) return Response.json({ error: "Please wait before saving again." }, { status: 429, headers });
  // Bound request bodies even when Content-Length is missing or misleading.
  if (!request.body) return Response.json({ error: "Invalid draft." }, { status: 400, headers });
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4 + 65_536) { await reader.cancel(); return Response.json({ error: "Draft is too large." }, { status: 413, headers }); }
    chunks.push(value);
  }
  let input: unknown;
  try { input = JSON.parse(new TextDecoder().decode(Buffer.concat(chunks))); } catch { return Response.json({ error: "Invalid draft." }, { status: 400, headers }); }
  const envelope = z.strictObject({ draft: z.unknown(), photo: z.discriminatedUnion("action", [z.strictObject({ action: z.literal("keep") }), z.strictObject({ action: z.literal("remove") }), z.strictObject({ action: z.literal("replace"), base64: z.string().max(Math.ceil(MAX_IMAGE_BYTES / 3) * 4).regex(/^[A-Za-z0-9+/]*={0,2}$/).refine((value) => value.length % 4 === 0) })]) }).safeParse(input);
  if (!envelope.success) return Response.json({ error: "Invalid draft or image." }, { status: 400, headers });
  const parsed = parseIslaDraft(envelope.data.draft);
  if (!parsed.success) return Response.json({ error: "Check your draft fields and try again." }, { status: 400, headers });
  let image: Uint8Array<ArrayBuffer> | null | undefined;
  if (envelope.data.photo.action === "remove") image = null;
  if (envelope.data.photo.action === "replace") {
    try { image = Uint8Array.from(await normalizeHeroImage(Buffer.from(envelope.data.photo.base64, "base64"))); }
    catch { return Response.json({ error: "Choose a valid JPEG, PNG, or WebP image up to 5 MB." }, { status: 400, headers }); }
  }
  const saved = await saveDraft(user.id, parsed.data, image);
  return Response.json({ updatedAt: saved.updatedAt }, { headers });
}

export const PUT = withVerifiedStorageWrite(putPhoto);
