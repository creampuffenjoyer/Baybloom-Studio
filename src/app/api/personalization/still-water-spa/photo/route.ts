import { getDraft } from "@/lib/personalization/drafts";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
  const user = await getCurrentUser();
  if (!user) return new Response(null, { status: 401, headers });
  const draft = await getDraft(user.id, "still-water-spa");
  if (!draft?.heroImage) return new Response(null, { status: 404, headers });
  return new Response(new Uint8Array(draft.heroImage), { headers: { ...headers, "Content-Type": "image/webp" } });
}
