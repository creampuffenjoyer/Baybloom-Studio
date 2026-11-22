import "server-only";
import type { PrismaClient } from "@prisma/client";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

/** A verified provider email must never silently adopt another login credential. */
export async function authorizeGoogleAccount(
  identity: { subject: string; email: string; name?: string | null; image?: string | null },
  client: PrismaClient = db,
  allowCreation: () => Promise<boolean> = async () => (await rateLimit("register:global", 100, 60 * 60_000, client)).ok,
) {
  const email = identity.email.trim().toLowerCase();
  const linked = await client.account.findUnique({
    where: { provider_providerAccountId: { provider: "google", providerAccountId: identity.subject } },
    include: { user: true },
  });
  if (linked) return !linked.user.disabled && linked.user.email === email;
  if (await client.user.findUnique({ where: { email }, select: { id: true } })) return false;
  if (!(await allowCreation())) return false;
  try {
    await client.user.create({
      data: {
        email, name: identity.name, image: identity.image, emailVerified: new Date(),
        accounts: { create: { provider: "google", providerAccountId: identity.subject } },
      },
    });
    return true;
  } catch (error) {
    // Only accept a concurrent creation of this exact provider identity.
    if (!(error && typeof error === "object" && "code" in error && error.code === "P2002")) throw error;
    const winner = await client.account.findUnique({
      where: { provider_providerAccountId: { provider: "google", providerAccountId: identity.subject } },
      include: { user: true },
    });
    return Boolean(winner && !winner.user.disabled && winner.user.email === email);
  }
}
