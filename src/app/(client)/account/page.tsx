import type { Metadata } from "next";
import { Suspense } from "react";
import { getAccount } from "@/lib/account";
import { requireUser } from "@/lib/session";
import { ProfileForm } from "@/app/(client)/account/profile-form";
import { VerifyBanner } from "@/app/(client)/account/verify-banner";
import { FormSkeleton } from "@/app/(client)/account/skeletons";

export const metadata: Metadata = { title: "Profile & billing" };

export default function AccountPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <Profile />
    </Suspense>
  );
}

async function Profile() {
  const user = await requireUser("/account");
  const account = await getAccount(user.id);
  if (!account) return null;

  return (
    <div className="space-y-8">
      {!account.emailVerified && <VerifyBanner email={account.email} />}
      <ProfileForm account={account} />
      <p className="text-xs text-muted-foreground">
        Member since{" "}
        {account.createdAt.toLocaleDateString("en-PH", { year: "numeric", month: "long" })} ·{" "}
        {account._count.favorites} {account._count.favorites === 1 ? "favorite" : "favorites"} ·{" "}
        {account._count.orders} {account._count.orders === 1 ? "order" : "orders"}
      </p>
    </div>
  );
}
