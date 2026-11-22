import "server-only";
import type { Prisma, PrismaClient } from "@prisma/client";
import { db } from "@/lib/db";
import { decryptMfaSecret, encryptMfaSecret, matchTotp, newMfaSecret, newRecoveryCodes, recoveryHash } from "./mfa-crypto";

export class MfaError extends Error {}
async function lock(tx: Prisma.TransactionClient, userId: string, authAt?: number, passwordHash?: string) {
  await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${userId} FOR UPDATE`;
  const user = await tx.user.findUnique({ where: { id: userId }, select: { role: true, disabled: true, emailVerified: true, sessionsValidAfter: true, passwordHash: true } });
  if (!user || user.disabled || user.role !== "ADMIN" || !user.emailVerified) throw new MfaError("A verified administrative account is required.");
  if ((authAt !== undefined && user.sessionsValidAfter && authAt < user.sessionsValidAfter.getTime()) || (passwordHash !== undefined && user.passwordHash !== passwordHash)) throw new MfaError("Your sign-in expired. Sign in again before changing verification.");
}
async function consume(tx: Prisma.TransactionClient, userId: string, code: string) {
  const factor = await tx.mfaCredential.findUnique({ where: { userId } });
  if (!factor?.enabledAt || !factor.secret) throw new MfaError("Authenticator enrollment is required.");
  const step = matchTotp(decryptMfaSecret(factor.secret, userId), code, factor.lastStep);
  if (step !== null) {
    await tx.mfaCredential.update({ where: { userId }, data: { lastStep: step } });
    return factor.version;
  }
  if (/^[A-Fa-f0-9\s-]{32,40}$/.test(code)) {
    const hash = recoveryHash(userId, code);
    if (factor.recoveryHashes.includes(hash)) {
      await tx.mfaCredential.update({ where: { userId }, data: { recoveryHashes: factor.recoveryHashes.filter(item => item !== hash) } });
      return factor.version;
    }
  }
  throw new MfaError("Invalid or already used code. Use a new authenticator code or an unused recovery code.");
}
export function consumeMfaCode(userId: string, code: string, client: PrismaClient = db, authAt?: number) {
  return client.$transaction(async tx => { await lock(tx, userId, authAt); return consume(tx, userId, code.trim()); }, { timeout: 15_000 });
}
export function beginMfaEnrollment(userId: string, code: string, client: PrismaClient = db, authAt?: number, passwordHash?: string) {
  return client.$transaction(async tx => {
    await lock(tx, userId, authAt, passwordHash);
    const factor = await tx.mfaCredential.findUnique({ where: { userId } });
    if (factor?.enabledAt) await consume(tx, userId, code.trim());
    const secret = newMfaSecret();
    const pendingSecret = encryptMfaSecret(secret, userId);
    const pendingExpiresAt = new Date(Date.now() + 10 * 60_000);
    await tx.mfaCredential.upsert({ where: { userId }, create: { userId, pendingSecret, pendingExpiresAt }, update: { pendingSecret, pendingExpiresAt } });
    return { secret, expiresAt: pendingExpiresAt };
  }, { timeout: 15_000 });
}
export function confirmMfaEnrollment(userId: string, code: string, client: PrismaClient = db, authAt?: number) {
  return client.$transaction(async tx => {
    await lock(tx, userId, authAt);
    const factor = await tx.mfaCredential.findUnique({ where: { userId } });
    if (!factor?.pendingSecret || !factor.pendingExpiresAt || factor.pendingExpiresAt <= new Date()) throw new MfaError("This setup expired. Start again.");
    const step = matchTotp(decryptMfaSecret(factor.pendingSecret, userId), code.trim());
    if (step === null) throw new MfaError("Enter the current six-digit code from your new authenticator.");
    const recovery = newRecoveryCodes(userId);
    await tx.mfaCredential.update({ where: { userId }, data: { secret: factor.pendingSecret, enabledAt: new Date(), pendingSecret: null, pendingExpiresAt: null, recoveryHashes: recovery.hashes, lastStep: step, version: { increment: 1 } } });
    await tx.user.update({ where: { id: userId }, data: { sessionsValidAfter: new Date() } });
    return recovery.codes;
  }, { timeout: 15_000 });
}
