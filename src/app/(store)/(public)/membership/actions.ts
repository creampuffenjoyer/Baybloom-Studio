"use server";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { onlineCheckoutEnabled } from "@/lib/online-checkout";
import { membershipCheckout, membershipCheckoutReady } from "@/lib/membership-payment";
import { rateLimit } from "@/lib/rate-limit";
import { reportEvent } from "@/lib/monitoring";

export async function startMembershipCheckout() {
  const user = await requireUser("/membership");
  if (!onlineCheckoutEnabled() || !membershipCheckoutReady()) redirect("/membership?unavailable=1");
  if (!(await rateLimit("membership-checkout:" + user.id, 8, 60_000)).ok) redirect("/membership?slow=1");
  let destination: string;
  try {
    destination = await membershipCheckout(user.id, user.email);
  } catch {
    reportEvent("membership_checkout_failed");
    destination = "/membership?error=1";
  }
  redirect(destination);
}
