import "server-only";
import { createHash, randomBytes } from "node:crypto";
import type { TokenType } from "@prisma/client";
import { db } from "@/lib/db";

const TTL_MS: Record<TokenType, number> = {
  VERIFY_EMAIL: 24 * 60 * 60_000,
  RESET_PASSWORD: 60 * 60_000,
};

const hash = (token: string) => createHash("sha256").update(token).digest("hex");

/**
 * Issues a single-use token. Only its SHA-256 hash is stored, so a database
 * leak doesn't expose usable links. Older tokens of the same type are revoked.
 */
export async function issueToken(email: string, type: TokenType) {
  const token = randomBytes(32).toString("base64url");
  await db.$transaction([
    db.verificationToken.deleteMany({ where: { email, type } }),
    db.verificationToken.create({
      data: { email, type, tokenHash: hash(token), expiresAt: new Date(Date.now() + TTL_MS[type]) },
    }),
  ]);
  return token;
}

/** Returns the token's email and deletes it, or null if invalid/expired. */
export async function consumeToken(token: string, type: TokenType) {
  if (!token || token.length > 100) return null;
  const row = await db.verificationToken.findUnique({ where: { tokenHash: hash(token) } });
  if (!row || row.type !== type) return null;
  await db.verificationToken.delete({ where: { id: row.id } });
  return row.expiresAt > new Date() ? row.email : null;
}

/** Checks a token without consuming it (to render the reset form). */
export async function peekToken(token: string, type: TokenType) {
  if (!token || token.length > 100) return false;
  const row = await db.verificationToken.findUnique({ where: { tokenHash: hash(token) } });
  return Boolean(row && row.type === type && row.expiresAt > new Date());
}
