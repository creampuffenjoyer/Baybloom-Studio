import { withPhotoQuota } from "@/lib/personalization/photo-quota";
import { withVerifiedStorageWrite } from "@/lib/personalization/verified-writes";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { isSameOriginRequest } from "@/lib/personalization/request";
import { MAX_IMAGE_BYTES, normalizeHeroImage } from "@/lib/personalization/image";
import { isHarborPhotoPlacement } from "@/templates/harbor-house/photo-placements";

const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
type Context = { params: Promise<{ placement: string }> };

export async function GET(_request: Request, { params }: Context) {
  const user = await getCurrentUser();
  if (!user) return new Response(null, { status: 401, headers });
  const { placement } = await params;
  if (!isHarborPhotoPlacement(placement)) return new Response(null, { status: 404, headers });
  const asset = await db.personalizationDraftImage.findFirst({ where: { slot: `placement:${placement}`, draft: { userId: user.id, template: "harbor-house" } }, select: { image: true } });
  return asset ? new Response(new Uint8Array(asset.image), { headers: { ...headers, "Content-Type": "image/webp" } }) : new Response(null, { status: 404, headers });
}

async function write(request: Request, { params }: Context, remove: boolean) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Sign in to save your photos." }, { status: 401, headers });
  const { placement } = await params;
  if (!isHarborPhotoPlacement(placement)) return Response.json({ error: "Photo location not found." }, { status: 404, headers });
  if (!isSameOriginRequest(request)) return Response.json({ error: "Invalid request origin." }, { status: 403, headers });
  if (!(await rateLimit(`personalization-harbor-placement:${user.id}`, 90, 60_000)).ok) return Response.json({ error: "Please wait before saving more photos." }, { status: 429, headers });
  let image: Uint8Array<ArrayBuffer> | undefined;
  if (!remove) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(request.headers.get("content-type")?.toLowerCase() ?? "")) return Response.json({ error: "Choose a JPEG, PNG, or WebP photo." }, { status: 415, headers });
    if (!request.body) return Response.json({ error: "Choose a photo." }, { status: 400, headers });
    const reader = request.body.getReader(); const chunks: Uint8Array[] = []; let length = 0;
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      length += value.byteLength;
      if (length > MAX_IMAGE_BYTES) { await reader.cancel(); return Response.json({ error: "Choose a photo up to 5 MB." }, { status: 413, headers }); }
      chunks.push(value);
    }
    try { image = Uint8Array.from(await normalizeHeroImage(Buffer.concat(chunks))); }
    catch { return Response.json({ error: "Choose a valid JPEG, PNG, or WebP photo up to 5 MB." }, { status: 400, headers }); }
  }
  const result = await withPhotoQuota(user.id, async tx => {
    const drafts = await tx.$queryRaw<{ id: string; heroBytes: number | null }[]>`SELECT "id", octet_length("heroImage") AS "heroBytes" FROM "PersonalizationDraft" WHERE "userId" = ${user.id} AND "template" = 'harbor-house' FOR UPDATE`;
    const draft = drafts[0];
    if (!draft) return { status: "missing" as const };
    const slot = `placement:${placement}`;
    if (remove) { await tx.personalizationDraftImage.deleteMany({ where: { draftId: draft.id, slot } }); return { status: "removed" as const }; }
    const totals = await tx.$queryRaw<{ total: bigint }[]>`SELECT COALESCE(SUM(octet_length("image")), 0)::bigint AS "total" FROM "PersonalizationDraftImage" WHERE "draftId" = ${draft.id} AND "slot" <> ${slot}`;
    if (Number(totals[0].total) + (draft.heroBytes ?? 0) + image!.length > 100 * 1024 * 1024) return { status: "full" as const };
    const saved = await tx.personalizationDraftImage.upsert({ where: { draftId_slot: { draftId: draft.id, slot } }, create: { draftId: draft.id, slot, image: image! }, update: { image: image! }, select: { updatedAt: true } });
    return { status: "saved" as const, updatedAt: saved.updatedAt };
  });
  if (result.status === "missing") return Response.json({ error: "Save your draft before saving photos." }, { status: 409, headers });
  if (result.status === "full") return Response.json({ error: "Your saved photos exceed the 100 MB limit. Restore an unused photo and try again." }, { status: 413, headers });
  return Response.json(result.status === "saved" ? { updatedAt: result.updatedAt } : { removed: true }, { headers });
}
export const PUT = withVerifiedStorageWrite((request: Request, context: Context) => write(request, context, false));
export const DELETE = (request: Request, context: Context) => write(request, context, true);
