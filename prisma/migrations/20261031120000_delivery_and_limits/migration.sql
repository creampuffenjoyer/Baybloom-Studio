ALTER TABLE "Order"
  ADD COLUMN "confirmationNextAt" TIMESTAMP(3),
  ADD COLUMN "confirmationAttempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "confirmationLeaseUntil" TIMESTAMP(3),
  ADD COLUMN "confirmationLeaseToken" TEXT,
  ADD COLUMN "confirmationPayload" JSONB;
CREATE INDEX "Order_status_confirmationNextAt_idx" ON "Order"("status", "confirmationNextAt");
UPDATE "Order" SET "confirmationNextAt" = CURRENT_TIMESTAMP
WHERE "status" = 'PAID' AND "confirmationSentAt" IS NULL;
CREATE TABLE "RateLimitBucket" (
  "key" TEXT NOT NULL PRIMARY KEY,
  "count" INTEGER NOT NULL,
  "resetAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "RateLimitBucket_resetAt_idx" ON "RateLimitBucket"("resetAt");
