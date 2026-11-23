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
import { consumeMfaCode, MfaError } from "@/lib/mfa";
import { railwayPublicOrigin } from "@/lib/site-origin";

class RateLimited extends CredentialsSignin {
  code = "rate_limited";
}

// Compared against when the email is unknown, so response time doesn't
// reveal which emails are registered.
const DUMMY_HASH = bcrypt.hashSync("baybloom-timing-guard", 12);

const googleEnabled = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);

// Auth.js uses AUTH_URL for both route handlers and server actions. Pin the
// Railway default to the service's public HTTPS domain.
const railwayOrigin = railwayPublicOrigin();
if (railwayOrigin && !process.env.AUTH_URL && !process.env.NEXTAUTH_URL) {
  process.env.AUTH_URL = railwayOrigin;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Credentials sign-in requires JWT sessions; the jwt callback below still
  // re-checks the database so disabling a client takes effect immediately.
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login", error: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const authStartedAt = Date.now();
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
        let mfaVersion: number | undefined;
        if (user.role === "ADMIN") {
          const factor = await db.mfaCredential.findUnique({ where: { userId: user.id } });
          if (factor?.enabledAt) {
            try { mfaVersion = await consumeMfaCode(user.id, parsed.data.code ?? "", db, authStartedAt); }
            catch (error) { if (error instanceof MfaError) return null; throw error; }
          }
        }
        return { id: user.id, email: user.email, name: user.name, role: user.role, mfaVersion, authStartedAt };
      },
    }),
    ...(googleEnabled ? [Google] : []),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return true;
      if (!profile?.email || profile.email_verified !== true) return false;
      // Administrative sessions use password + our enrolled factor. Provider
      // claims alone cannot establish that this application's MFA was completed.
      const administrative = await db.user.findUnique({ where: { email: profile.email.trim().toLowerCase() }, select: { role: true } });
      if (administrative?.role === "ADMIN") return false;

      return authorizeGoogleAccount({
        subject: account.providerAccountId, email: profile.email, name: profile.name,
        image: typeof profile.picture === "string" ? profile.picture : null,
      }, db, async () => {
        const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
        const email = profile.email!.trim().toLowerCase();
        return (await rateLimit(`register:${ip}`, 5, 60 * 60_000)).ok &&
          (await rateLimit(`register:email:${email}`, 3, 60 * 60_000)).ok &&
          (await rateLimit("register:global", 100, 60 * 60_000)).ok;
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
        token.authAt = account.provider === "credentials" ? user.authStartedAt : Date.now();
        token.mfaVersion = account.provider === "credentials" ? user.mfaVersion : undefined;
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
      token.mfaPending = false;
      if (current.role === "ADMIN") {
        const factor = await db.mfaCredential.findUnique({ where: { userId: token.uid } });
        if (factor?.enabledAt) {
          if (!token.mfaVersion || token.mfaVersion !== factor.version) return null;
        } else {
          token.role = "CLIENT";
          token.mfaPending = true;
        }
      } else { delete token.mfaVersion; }
      return token;
    },

    session({ session, token }) {
      session.user.id = token.uid;
      session.user.role = token.role;
      session.user.mfaPending = token.mfaPending;
      session.user.authAt = token.authAt;
      return session;
    },
  },
});
