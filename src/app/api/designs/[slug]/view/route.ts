import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request, { params }: RouteContext<"/api/designs/[slug]/view">) {
  const { slug } = await params;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`view:${ip}:${slug}`, 3, 60 * 60_000).ok) {
    return new Response(null, { status: 204 });
  }
  await db.design.updateMany({
    where: { slug, status: "PUBLISHED" },
    data: { viewCount: { increment: 1 } },
  });
  return new Response(null, { status: 204 });
}
