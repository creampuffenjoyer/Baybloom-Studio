import "server-only";
import { createHmac } from "node:crypto";
import { z } from "zod";

export const deliveryEmailSchema = z.string().trim().toLowerCase().pipe(z.email().max(254));

export function deliverySignature(purpose: "verify-address" | "download-project", value: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("Delivery requires AUTH_SECRET");
  return createHmac("sha256", secret).update(purpose).update("\0").update(value).digest("hex");
}
