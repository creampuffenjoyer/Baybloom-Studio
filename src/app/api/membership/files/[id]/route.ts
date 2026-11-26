import { getCurrentUser } from "@/lib/session";
import { hasPremium } from "@/lib/membership";
import { includesFile } from "@/lib/membership-plans";
import { studioDesigns } from "@/lib/catalog";
import { db } from "@/lib/db";
import { signedDownloadUrl } from "@/lib/storage";
import { privateResponseHeaders as headers } from "@/lib/request-security";

export async function GET(_request: Request, {params}: {params: Promise<{id: string}>}) {
  const user = await getCurrentUser();
  if (!user) return new Response("Sign in to download.", {status: 401, headers});
  const {id} = await params;
  const file = await db.deliverableFile.findFirst({
    where: {id, design: studioDesigns},
    select: {storageKey: true, name: true, minTier: {select: {level: true}}, design: {select: {slug: true}}},
  });
  if (!file) return new Response("File unavailable.", {status: 404, headers});
  if (!includesFile(await hasPremium(user.id), file.design.slug, file)) {
    return new Response("Premium membership is required.", {status: 403, headers});
  }
  return new Response(null, {status: 303, headers: {...headers, Location: await signedDownloadUrl(file.storageKey, file.name)}});
}
