import { authorizeDownload } from "@/lib/deliverables";
import { getCurrentUser } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { signedDownloadUrl } from "@/lib/storage";
import { getPurchasedDownload, PURCHASE_SOURCE_FILE } from "@/lib/personalization/purchases";

const privateHeaders = { "Cache-Control": "private, no-store", Vary: "Cookie" };

/**
 * GET /api/downloads/[orderItemId]?file=<fileId>
 * Purchased sources require purchaser/payment checks; additional files also
 * check tier. Both use private 5-minute signed URLs; ?format=json returns { url }.
 */
export async function GET(request: Request, { params }: RouteContext<"/api/downloads/[orderItemId]">) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please log in." }, { status: 401, headers: privateHeaders });
  if (!(await rateLimit(`download:${user.id}`, 60, 60 * 60_000)).ok) {
    return Response.json({ error: "Too many downloads. Please try again later." }, { status: 429, headers: privateHeaders });
  }

  const { orderItemId } = await params;
  const url = new URL(request.url);
  if (url.searchParams.get("file") === PURCHASE_SOURCE_FILE) {
    try {
      const download = await getPurchasedDownload(user.id, orderItemId);
      if (!download) return Response.json({ error: "Not found." }, { status: 404, headers: privateHeaders });
      if (download.status !== "ready") return Response.json({
        error: download.status === "preparing" ? "Your package is being prepared. Please return to your order shortly." : "Your package needs support. Your purchase is saved; contact us with your order number.",
      }, { status: 503, headers: { ...privateHeaders, "Retry-After": "60" } });
      const signed = await signedDownloadUrl(download.storageKey, download.name);
      if (url.searchParams.get("format") === "json") return Response.json({ url: signed }, { headers: privateHeaders });
      return new Response(null, { status: 302, headers: { ...privateHeaders, Location: new URL(signed, url.origin).href } });
    } catch {
      console.error("[purchase-download] artifact unavailable", orderItemId);
      return Response.json({ error: "Your package could not be downloaded. Please try again or contact support." }, { status: 503, headers: privateHeaders });
    }
  }
  const file = await authorizeDownload(user.id, orderItemId, url.searchParams.get("file") ?? "");
  if (!file) return Response.json({ error: "Not found." }, { status: 404, headers: privateHeaders });

  const signed = await signedDownloadUrl(file.storageKey, file.name);
  if (url.searchParams.get("format") === "json") return Response.json({ url: signed }, { headers: privateHeaders });
  return new Response(null, { status: 302, headers: { ...privateHeaders, Location: new URL(signed, url.origin).href } });
}
