import { z } from "zod";
import { addToCart, CartError } from "@/lib/cart";
import { getCartForRequest } from "@/lib/cart-request";
import { getCurrentUser } from "@/lib/session";
import { guardBrowserWrite, readJsonBody, privateResponseHeaders } from "@/lib/request-security";

const unauthorized = () => Response.json({ error: "Please log in." }, { status: 401 });

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  return Response.json(await getCartForRequest(user.id), { headers: privateResponseHeaders });
}

const addSchema = z.object({
  designId: z.string().min(1).max(64),
  tierId: z.string().min(1).max(64),
  addonIds: z.array(z.string().min(1).max(64)).max(20).default([]),
});

/** POST /api/cart: add a design (or change its tier/add-ons). Returns the cart. */
export async function POST(request: Request) {
  const rejected = guardBrowserWrite(request);
  if (rejected) return rejected;
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await readJsonBody(request);
  if (!body.ok) return body.response;
  const parsed = addSchema.safeParse(body.value);
  if (!parsed.success) return Response.json({ error: "Invalid request." }, { status: 400 });

  try {
    await addToCart(user.id, parsed.data);
  } catch (e) {
    if (e instanceof CartError) return Response.json({ error: e.message }, { status: 400 });
    throw e;
  }
  return Response.json(await getCartForRequest(user.id), { status: 201, headers: privateResponseHeaders });
}
