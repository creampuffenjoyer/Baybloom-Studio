import { isSameOriginRequest } from "@/lib/personalization/request";

export const privateResponseHeaders = { "Cache-Control": "private, no-store", Vary: "Cookie" };

function failure(status: number, error: string) {
  return Response.json({ error, message: error }, { status, headers: privateResponseHeaders });
}

/** Cookie-authenticated writes must come from this origin, including same-site siblings. */
export function guardBrowserWrite(request: Request, json = true): Response | null {
  if (!isSameOriginRequest(request)) return failure(403, "Invalid request origin.");
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (json && contentType !== "application/json") return failure(415, "Unsupported content type.");
  return null;
}

/** Enforce the byte limit while streaming; Content-Length is not authoritative. */
export async function readRawBody(request: Request, limit = 4096): Promise<
  { ok: true; value: Buffer } | { ok: false; response: Response }
> {
  const declared = request.headers.get("content-length");
  if (declared && /^\d+$/.test(declared) && Number(declared) > limit) {
    return { ok: false, response: failure(413, "Request body is too large.") };
  }
  if (!request.body) return { ok: false, response: failure(400, "Invalid request body.") };
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        return { ok: false, response: failure(413, "Request body is too large.") };
      }
      chunks.push(value);
    }
    return { ok: true, value: Buffer.concat(chunks) };
  } catch {
    return { ok: false, response: failure(400, "Invalid request body.") };
  } finally { reader.releaseLock(); }
}

export async function readJsonBody(request: Request, limit = 4096): Promise<
  { ok: true; value: unknown } | { ok: false; response: Response }
> {
  const body = await readRawBody(request, limit);
  if (!body.ok) return body;
  try {
    return { ok: true, value: JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(body.value)) };
  } catch { return { ok: false, response: failure(400, "Invalid JSON body.") }; }
}
