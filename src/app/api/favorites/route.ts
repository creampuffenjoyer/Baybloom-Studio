import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import { addFavorite, getFavoriteIds } from "@/lib/favorites";
import { guardBrowserWrite, readJsonBody, privateResponseHeaders } from "@/lib/request-security";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json({ designIds: await getFavoriteIds(user.id) }, { headers: privateResponseHeaders });
}

export async function POST(request: Request) {
  const rejected = guardBrowserWrite(request);
  if (rejected) return rejected;
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const input = await readJsonBody(request);
  if (!input.ok) return input.response;
  const body = z
    .object({ designId: z.string().min(1).max(64) })
    .safeParse(input.value);
  if (!body.success) return Response.json({ error: "Invalid body" }, { status: 400 });

  const ok = await addFavorite(user.id, body.data.designId);
  if (!ok) return Response.json({ error: "Design not found" }, { status: 404 });
  return Response.json({ designId: body.data.designId, favorite: true }, { status: 201, headers: privateResponseHeaders });
}
