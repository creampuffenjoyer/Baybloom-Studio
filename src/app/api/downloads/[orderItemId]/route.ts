import { authorizeDownload } from "@/lib/deliverables";
import { getCurrentUser } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { signedDownloadUrl } from "@/lib/storage";

/**
 * GET /api/downloads/[orderItemId]?file=<fileId>
 * Checks ownership, payment and tier, then redirects to a 5-minute signed URL.
 * Add ?format=json to receive { url } instead of a redirect.
 */
export async function GET(request: Request, { params }: RouteContext<"/api/downloads/[orderItemId]">) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please log in." }, { status: 401 });
  if (!rateLimit(`download:${user.id}`, 60, 60 * 60_000).ok) {
    return Response.json({ error: "Too many downloads. Please try again later." }, { status: 429 });
  }

  const { orderItemId } = await params;
  const url = new URL(request.url);
  const file = await authorizeDownload(user.id, orderItemId, url.searchParams.get("file") ?? "");
  if (!file) return Response.json({ error: "Not found." }, { status: 404 });

  const signed = await signedDownloadUrl(file.storageKey, file.name);
  if (url.searchParams.get("format") === "json") return Response.json({ url: signed });
  return Response.redirect(new URL(signed, url.origin), 302);
}
