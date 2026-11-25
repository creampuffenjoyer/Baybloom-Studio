import { findProjectDelivery } from "@/lib/project-delivery-link";
import { signedDownloadUrl } from "@/lib/storage";

const headers = { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex, nofollow" };

export async function GET(request: Request, { params }: RouteContext<"/api/project-delivery/[token]">) {
  try {
    const { token } = await params;
    const delivery = await findProjectDelivery(token);
    if (!delivery) return new Response("This download link is expired or unavailable. Ask the purchaser to request a fresh link from their Baybloom order.", { status: 404, headers });
    const location = await signedDownloadUrl(delivery.key, delivery.name);
    return new Response(null, { status: 302, headers: { ...headers, Location: new URL(location, request.url).href } });
  } catch {
    return new Response("This download is temporarily unavailable. Try again later.", { status: 503, headers });
  }
}
