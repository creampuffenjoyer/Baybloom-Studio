import "server-only";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function getDeliveryAdmin() {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN") return null;
  return db.user.findFirst({
    where: { id: user.id, role: "ADMIN", disabled: false, emailVerified: { not: null }, mfa: { enabledAt: { not: null } } },
    select: { id: true },
  });
}
