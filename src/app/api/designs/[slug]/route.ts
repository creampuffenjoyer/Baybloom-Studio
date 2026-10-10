import { getDesignBySlug, getDesignPricing } from "@/lib/catalog";

/** Design detail. Price fields are only added when the request has a session. */
export async function GET(_request: Request, { params }: RouteContext<"/api/designs/[slug]">) {
  const { slug } = await params;
  const design = await getDesignBySlug(slug);
  if (!design) return Response.json({ error: "Not found" }, { status: 404 });

  const pricing = await getDesignPricing(design.id);
  return Response.json({ ...design, ...(pricing && { pricing }) });
}
