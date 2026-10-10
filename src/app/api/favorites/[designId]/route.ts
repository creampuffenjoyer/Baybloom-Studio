import { getCurrentUser } from "@/lib/session";
import { removeFavorite } from "@/lib/favorites";

export async function DELETE(
  _request: Request,
  { params }: RouteContext<"/api/favorites/[designId]">,
) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { designId } = await params;
  await removeFavorite(user.id, designId);
  return new Response(null, { status: 204 });
}
