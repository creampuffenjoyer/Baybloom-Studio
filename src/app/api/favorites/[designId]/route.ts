import { getCurrentUser } from "@/lib/session";
import { removeFavorite } from "@/lib/favorites";
import { guardBrowserWrite, privateResponseHeaders } from "@/lib/request-security";

export async function DELETE(
  request: Request,
  { params }: RouteContext<"/api/favorites/[designId]">,
) {
  const rejected = guardBrowserWrite(request, false);
  if (rejected) return rejected;
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { designId } = await params;
  await removeFavorite(user.id, designId);
  return new Response(null, { status: 204, headers: privateResponseHeaders });
}
