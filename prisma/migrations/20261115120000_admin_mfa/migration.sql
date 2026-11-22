CREATE TABLE "MfaCredential" (
  "userId" TEXT NOT NULL,
  "secret" TEXT,
  "enabledAt" TIMESTAMP(3),
  "pendingSecret" TEXT,
  "pendingExpiresAt" TIMESTAMP(3),
  "recoveryHashes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "lastStep" INTEGER NOT NULL DEFAULT -1,
  "version" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "MfaCredential_pkey" PRIMARY KEY ("userId"),
  CONSTRAINT "MfaCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
