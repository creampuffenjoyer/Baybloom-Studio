import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: { id: string; role: Role; mfaPending?: boolean; authAt?: number } & DefaultSession["user"];
  }
  interface User {
    role?: Role;
    mfaVersion?: number;
    authStartedAt?: number;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    uid: string;
    role: Role;
    /** Epoch ms of the sign-in that created this session. */
    authAt?: number;
    mfaVersion?: number;
    mfaPending?: boolean;
  }
}
