import { getFromPrices, searchDesigns } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/session";
import { parseCatalogQuery } from "@/lib/validators";

/**
 * GET /api/designs?type=&category=&style=&tier=&features=&q=&sort=&page=
 * Visitors get catalog data only; signed-in clients also get "from" prices.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw: Record<string, string[]> = {};
  for (const [k, v] of url.searchParams) (raw[k] ??= []).push(v);

  const query = parseCatalogQuery(raw);
  const user = await getCurrentUser();
  const result = await searchDesigns(query, Boolean(user));
  const prices = user ? await getFromPrices(result.items.map((d) => d.id)) : null;

  return Response.json({
    ...result,
    items: result.items.map((d) => ({
      ...d,
      ...(prices && { fromPrice: prices[d.id] ?? null }),
    })),
  });
}
