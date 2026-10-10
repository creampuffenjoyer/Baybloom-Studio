import { removeFromCart } from "@/lib/cart";
import { getCartForRequest } from "@/lib/cart-request";
import { getCurrentUser } from "@/lib/session";

export async function DELETE(_request: Request, { params }: RouteContext<"/api/cart/[itemId]">) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please log in." }, { status: 401 });
  const { itemId } = await params;
  await removeFromCart(user.id, itemId);
  return Response.json(await getCartForRequest(user.id));
}
