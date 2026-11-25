import { handlePayMongoEvent, parsePayMongoWebhook, payMongoWebhookConfigured } from "@/lib/paymongo";
import { readRawBody } from "@/lib/request-security";

export async function POST(request: Request) {
  if (!payMongoWebhookConfigured()) return Response.json({ error: "Webhooks are unavailable." }, { status: 503 });
  const raw = await readRawBody(request, 1024 * 1024);
  if (!raw.ok) return raw.response;
  let event;
  try {
    event = parsePayMongoWebhook(raw.value, request.headers.get("paymongo-signature") ?? "",
      process.env.PAYMONGO_WEBHOOK_SECRET!, process.env.PAYMONGO_SECRET_KEY!.startsWith("sk_live_"));
  } catch {
    return Response.json({ error: "Invalid PayMongo event." }, { status: 400 });
  }
  try {
    await handlePayMongoEvent(event);
    return Response.json({ received: true });
  } catch {
    console.error("[paymongo-webhook] reconciliation failed", event.type);
    return Response.json({ error: "Reconciliation failed." }, { status: 500 });
  }
}
