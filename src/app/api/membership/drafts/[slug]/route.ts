import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { canEdit } from "@/lib/membership";
import { readEditorSource } from "@/lib/storage";
import { rateLimit } from "@/lib/rate-limit";
import { isPurchaseTemplate } from "@/lib/personalization/purchases";
import { captureTemplateSnapshot, packageTemplateSnapshot } from "@/lib/personalization/export";
import { guardBrowserWrite, privateResponseHeaders as headers } from "@/lib/request-security";
import { reportEvent } from "@/lib/monitoring";

export async function POST(request: Request, {params}: {params: Promise<{slug: string}>}) {
  const denied = guardBrowserWrite(request, false);
  if (denied) return denied;
  const user = await getCurrentUser();
  if (!user) return new Response("Sign in to download.", {status: 401, headers});
  const {slug} = await params;
  if (!isPurchaseTemplate(slug)) return new Response("Editor unavailable.", {status: 404, headers});
  if (!await canEdit(user.id, slug)) return new Response("Premium membership is required.", {status: 403, headers});
  if (!(await rateLimit("member-export:" + user.id, 4, 60_000)).ok) return new Response("Wait a minute before downloading again.", {status: 429, headers});
  const draft = await db.personalizationDraft.findUnique({
    where: {userId_template: {userId: user.id, template: slug}},
    select: {content: true, heroImage: true, images: {select: {slot: true, image: true}}},
  });
  if (!draft) return new Response("Save your changes in the editor before downloading.", {status: 409, headers});
  try {
    const source = await readEditorSource(slug);
    const snapshot = captureTemplateSnapshot(source, draft.content, draft);
    if (snapshot.template !== slug) throw new Error("Template mismatch");
    const bytes = packageTemplateSnapshot(source, snapshot);
    return new Response(Uint8Array.from(bytes), {headers: {...headers, "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${slug}-personalized.zip"`}});
  } catch {
    reportEvent("member_export_failed", {slug});
    return new Response("Your website could not be packaged. Your saved draft is still available.", {status: 503, headers});
  }
}
