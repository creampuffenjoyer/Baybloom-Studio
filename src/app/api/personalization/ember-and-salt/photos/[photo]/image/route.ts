import { withPhotoQuota } from "@/lib/personalization/photo-quota";
import { withVerifiedStorageWrite } from "@/lib/personalization/verified-writes";
import { db } from "@/lib/db";
import { isEmberPhotoKey } from "@/lib/personalization/ember-photos";
import { MAX_IMAGE_BYTES, normalizeHeroImage } from "@/lib/personalization/image";
import { isSameOriginRequest } from "@/lib/personalization/request";
import { rateLimit } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/session";

const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
type Context = { params: Promise<{ photo: string }> };

export async function GET(_request: Request, context: Context) {
  const user = await getCurrentUser();
  if (!user) return new Response(null, { status: 401, headers });
  const { photo } = await context.params;
  if (!isEmberPhotoKey(photo)) return new Response(null, { status: 404, headers });
  const image = await db.personalizationDraftImage.findFirst({ where: { slot: `photo:${photo}`, draft: { userId: user.id, template: "ember-and-salt" } }, select: { image: true } });
  return image ? new Response(new Uint8Array(image.image), { headers: { ...headers, "Content-Type": "image/webp" } }) : new Response(null, { status: 404, headers });
}

async function putPhoto(request: Request, context: Context) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Sign in to save a website photo." }, { status: 401, headers });
  const { photo } = await context.params;
  if (!isEmberPhotoKey(photo)) return Response.json({ error: "Photo not found." }, { status: 404, headers });
  if (!isSameOriginRequest(request) || !["image/jpeg", "image/png", "image/webp"].includes(request.headers.get("content-type")?.toLowerCase() ?? "")) return Response.json({ error: "Invalid request." }, { status: 403, headers });
  if (!(await rateLimit(`personalization-ember-photo:${user.id}`, 20, 60_000)).ok) return Response.json({ error: "Please wait before saving another photo." }, { status: 429, headers });
  const draft = await db.personalizationDraft.findUnique({ where: { userId_template: { userId: user.id, template: "ember-and-salt" } }, select: { id: true } });
  if (!draft) return Response.json({ error: "Save your draft before saving a website photo." }, { status: 409, headers });
  if (!request.body) return Response.json({ error: "Choose a photo." }, { status: 400, headers });
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > MAX_IMAGE_BYTES) { await reader.cancel(); return Response.json({ error: "Photo is too large." }, { status: 413, headers }); }
    chunks.push(value);
  }
  let normalized: Uint8Array<ArrayBuffer>;
  try { normalized = Uint8Array.from(await normalizeHeroImage(Buffer.concat(chunks))); }
  catch { return Response.json({ error: "Choose a valid JPEG, PNG, or WebP photo up to 5 MB." }, { status: 400, headers }); }
  const saved = await withPhotoQuota(user.id, async (tx) => {
    const locked = await tx.$queryRaw<{ id: string }[]>`SELECT "id" FROM "PersonalizationDraft" WHERE "id" = ${draft.id} AND "userId" = ${user.id} FOR UPDATE`;
    if (!locked.length) return null;
    return tx.personalizationDraftImage.upsert({ where: { draftId_slot: { draftId: draft.id, slot: `photo:${photo}` } }, create: { draftId: draft.id, slot: `photo:${photo}`, image: normalized }, update: { image: normalized }, select: { updatedAt: true } });
  });
  if (!saved) return Response.json({ error: "Save your draft before saving a website photo." }, { status: 409, headers });
  return Response.json({ updatedAt: saved.updatedAt }, { headers });
}

export async function DELETE(request: Request, context: Context) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Sign in to update a website photo." }, { status: 401, headers });
  const { photo } = await context.params;
  if (!isEmberPhotoKey(photo)) return Response.json({ error: "Photo not found." }, { status: 404, headers });
  if (!isSameOriginRequest(request)) return Response.json({ error: "Invalid request." }, { status: 403, headers });
  if (!(await rateLimit(`personalization-ember-photo:${user.id}`, 20, 60_000)).ok) return Response.json({ error: "Please wait before saving another photo." }, { status: 429, headers });
  const draft = await db.personalizationDraft.findUnique({ where: { userId_template: { userId: user.id, template: "ember-and-salt" } }, select: { id: true } });
  if (!draft) return Response.json({ error: "Save your draft before saving a website photo." }, { status: 409, headers });
  await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "PersonalizationDraft" WHERE "id" = ${draft.id} AND "userId" = ${user.id} FOR UPDATE`;
    await tx.personalizationDraftImage.deleteMany({ where: { draftId: draft.id, slot: `photo:${photo}` } });
  });
  return Response.json({ removed: true }, { headers });
}

export const PUT = withVerifiedStorageWrite("ember-and-salt", putPhoto);
