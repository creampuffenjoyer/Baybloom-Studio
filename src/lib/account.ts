import "server-only";
import { db } from "@/lib/db";

export async function getAccount(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      name: true,
      emailVerified: true,
      passwordHash: true,
      createdAt: true,
      phone: true,
      company: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      region: true,
      postalCode: true,
      country: true,
      accounts: { select: { provider: true } },
      _count: { select: { favorites: true, orders: true } },
    },
  });
  if (!user) return null;
  const { passwordHash, accounts, ...rest } = user;
  return {
    ...rest,
    hasPassword: Boolean(passwordHash),
    providers: accounts.map((a) => a.provider),
  };
}

export type Account = NonNullable<Awaited<ReturnType<typeof getAccount>>>;

export async function getOrders(userId: string) {
  return db.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      totalCents: true,
      discountCents: true,
      currency: true,
      couponCode: true,
      createdAt: true,
      paidAt: true,
      items: {
        select: {
          id: true,
          designTitle: true,
          tierName: true,
          priceCents: true,
          addons: true,
          design: { select: { slug: true, heroImage: true, heroAlt: true } },
        },
      },
    },
  });
}
