import { getCurrentUser } from "@/lib/session";
import { AuthButtons, UserMenu } from "@/components/layout/account-menu-client";

/** Reads the session, so it streams in behind the header's <Suspense>. */
export async function AccountMenu() {
  const user = await getCurrentUser();
  if (!user) return <AuthButtons />;
  return <UserMenu name={user.name} email={user.email} />;
}
