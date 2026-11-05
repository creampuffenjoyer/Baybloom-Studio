import "server-only";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";
import { authorizeGoogleAccount } from "@/lib/google-account";

class RateLimited extends CredentialsSignin {
  code = "rate_limited";
}

// Compared against when the email is unknown, so response time doesn't
// reveal which emails are registered.
const DUMMY_HASH = bcrypt.hashSync("baybloom-timing-guard", 12);

const googleEnabled = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Credentials sign-in requires JWT sessions; the jwt callback below still
  // re-checks the database so disabling a client takes effect immediately.
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login", error: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const ip =
          (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ??
          "local";
        if (
          !(await rateLimit(`login:ip:${ip}`, 20, 15 * 60_000)).ok ||
          !(await rateLimit(`login:email:${email}`, 8, 15 * 60_000)).ok
        ) {
          throw new RateLimited();
        }

        const user = await db.user.findUnique({ where: { email } });
        const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
        if (!user || !user.passwordHash || !ok || user.disabled) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
    ...(googleEnabled ? [Google] : []),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return true;
      if (!profile?.email || profile.email_verified !== true) return false;

      return authorizeGoogleAccount({
        subject: account.providerAccountId, email: profile.email, name: profile.name,
        image: typeof profile.picture === "string" ? profile.picture : null,
      });
    },

    async jwt({ token, user, account }) {
      if (user && account) {
        // On sign-in, resolve our own user id (Google's id differs from ours).
        const dbUser =
          account.provider === "credentials"
            ? { id: user.id!, role: user.role ?? "CLIENT" }
            : (await db.account.findUnique({
                where: { provider_providerAccountId: {
                  provider: "google", providerAccountId: account.providerAccountId,
                } },
                select: { user: { select: { id: true, role: true } } },
              }))?.user;
        if (!dbUser) return null;
        token.uid = dbUser.id;
        token.role = dbUser.role;
        token.authAt = Date.now();
        return token;
      }

      if (!token.uid) return null;
      const current = await db.user.findUnique({
        where: { id: token.uid },
        select: { role: true, disabled: true, name: true, email: true, sessionsValidAfter: true },
      });
      if (!current || current.disabled) return null;
      // A password change or reset signs out sessions that started before it.
      if (current.sessionsValidAfter && (token.authAt ?? 0) < current.sessionsValidAfter.getTime()) {
        return null;
      }
      token.email = current.email;
      token.role = current.role;
      token.name = current.name;
      return token;
    },

    session({ session, token }) {
      session.user.id = token.uid;
      session.user.role = token.role;
      return session;
    },
  },
});
