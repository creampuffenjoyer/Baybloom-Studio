import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export type CurrentUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: "CLIENT" | "ADMIN";
};

/**
 * Data Access Layer entry point: the one place pages and route handlers read
 * the session. Reads request cookies, so callers must sit behind <Suspense>.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  // Auth.js uses crypto before it reads cookies; mark this as request-time first.
  await connection();
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    role: session.user.role,
  };
});

/**
 * For client-only pages: returns the user or redirects to login, coming back
 * to `callbackUrl` afterwards. Call it inside the page's <Suspense> boundary.
 */
export async function requireUser(callbackUrl: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  return user;
}
