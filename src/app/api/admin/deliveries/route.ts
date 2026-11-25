import { Prisma } from "@prisma/client";
import { isIP } from "node:net";
import { z } from "zod";
import { db } from "@/lib/db";
import { getDeliveryAdmin } from "@/lib/delivery-admin";
import { guardBrowserWrite, privateResponseHeaders, readJsonBody } from "@/lib/request-security";

const input = z.strictObject({ orderItemId: z.string().max(128).min(1), url: z.string().trim().max(2048) });

function publicWebsiteUrl(raw: string) {
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase().replace(/\.$/, "");
    if (url.protocol === "https:" && !url.username && !url.password && host.includes(".") &&
        !host.endsWith(".localhost") && !host.endsWith(".local") && !isIP(host)) return url.href;
  } catch {}
  return null;
}

export async function POST(request: Request) {
  const rejected = guardBrowserWrite(request);
  if (rejected) return rejected;
  const respond = (body: object, status = 200) => Response.json(body, { status, headers: privateResponseHeaders });
  if (!await getDeliveryAdmin()) return respond({ error: "A verified admin with MFA is required." }, 403);
  const body = await readJsonBody(request);
  if (!body.ok) return body.response;
  const parsed = input.safeParse(body.value);
  const url = parsed.success ? publicWebsiteUrl(parsed.data.url) : null;
  if (!parsed.success || !url) return respond({ error: "Enter the public HTTPS address of the deployed site." }, 400);
  const { count } = await db.orderDelivery.updateMany({
    where: { orderItemId: parsed.data.orderItemId, emailRevision: 0, emailPayload: { equals: Prisma.DbNull },
      orderItem: { deploymentRequired: true, order: { status: "PAID", deliveryEmail: { not: null } } } },
    data: { deploymentUrl: url },
  });
  return count ? respond({ ok: true }) : respond({ error: "This paid deployment is unavailable or its delivery email has already been prepared." }, 409);
}
