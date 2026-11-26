import "server-only";
import { db } from "@/lib/db";
import { canEdit } from "@/lib/membership";
import { getCurrentUser } from "@/lib/session";
import { withPhotoQuotaErrors } from "./photo-quota";

/** Gate every draft/image PUT before parsing or decoding; reads and removal remain available. */
export function withVerifiedStorageWrite<A extends unknown[]>(template: string, handler: (...args: A) => Promise<Response>) {
  const write = withPhotoQuotaErrors(handler);
  return async (...args: A): Promise<Response> => {
    const user = await getCurrentUser();
    const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
    if (!user) return Response.json({ error: "Sign in to save your draft or photos." }, { status: 401, headers });
    const account = await db.user.findUnique({ where: { id: user.id }, select: { emailVerified: true, disabled: true } });
    if (!account?.emailVerified || account.disabled) return Response.json({ error: "Verify your email before saving drafts or photos. Open My account to resend the verification link.", code: "EMAIL_VERIFICATION_REQUIRED" }, { status: 403, headers });
    if (!await canEdit(user.id, template)) return Response.json({ error: "Premium membership is required for this editor." }, {status: 403, headers});
    return write(...args);
  };
}
