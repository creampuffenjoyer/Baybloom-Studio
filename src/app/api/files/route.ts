import { readFile } from "node:fs/promises";
import path from "node:path";
import { verifyLocalLink } from "@/lib/storage";

const TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".txt": "text/plain; charset=utf-8",
};

/** Serves local private files for signed, unexpired links (development storage). */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const file = verifyLocalLink(
    url.searchParams.get("key") ?? "",
    url.searchParams.get("exp") ?? "",
    url.searchParams.get("sig") ?? "",
  );
  if (!file) return new Response("This download link has expired.", { status: 403 });

  const data = await readFile(file).catch(() => null);
  if (!data) return new Response("File not found.", { status: 404 });

  const name = (url.searchParams.get("name") ?? path.basename(file)).replace(/[^\w.\- ]/g, "");
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
