import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import { addFavorite, getFavoriteIds } from "@/lib/favorites";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json({ designIds: await getFavoriteIds(user.id) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = z
    .object({ designId: z.string().min(1).max(64) })
    .safeParse(await request.json().catch(() => null));
  if (!body.success) return Response.json({ error: "Invalid body" }, { status: 400 });

  const ok = await addFavorite(user.id, body.data.designId);
  if (!ok) return Response.json({ error: "Design not found" }, { status: 404 });
  return Response.json({ designId: body.data.designId, favorite: true }, { status: 201 });
}
