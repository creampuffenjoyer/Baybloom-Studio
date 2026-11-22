import { removeFromCart } from "@/lib/cart";
import { getCartForRequest } from "@/lib/cart-request";
import { getCurrentUser } from "@/lib/session";
import { guardBrowserWrite, privateResponseHeaders } from "@/lib/request-security";

export async function DELETE(request: Request, { params }: RouteContext<"/api/cart/[itemId]">) {
  const rejected = guardBrowserWrite(request, false);
  if (rejected) return rejected;
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please log in." }, { status: 401 });
  const { itemId } = await params;
  await removeFromCart(user.id, itemId);
  return Response.json(await getCartForRequest(user.id), { headers: privateResponseHeaders });
}
