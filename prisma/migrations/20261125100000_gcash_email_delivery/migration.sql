CREATE TYPE "CheckoutPaymentMethod" AS ENUM ('STRIPE', 'GCASH', 'FREE');

ALTER TABLE "Order" ADD COLUMN "paymentMethod" "CheckoutPaymentMethod" NOT NULL DEFAULT 'STRIPE',
  ADD COLUMN "providerPaymentId" TEXT, ADD COLUMN "deliveryEmail" TEXT;
UPDATE "Order" SET "paymentMethod" = 'FREE' WHERE "totalCents" = 0;
CREATE UNIQUE INDEX "Order_providerPaymentId_key" ON "Order"("providerPaymentId");

CREATE TABLE "CheckoutDeliveryVerification" (
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    CONSTRAINT "CheckoutDeliveryVerification_pkey" PRIMARY KEY ("userId"),
    CONSTRAINT "CheckoutDeliveryVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER TABLE "OrderItem" ADD COLUMN "deploymentRequired" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "OrderDelivery" ADD COLUMN "deploymentUrl" TEXT, ADD COLUMN "legacyStorageKey" TEXT,
  ADD COLUMN "emailRevision" INTEGER NOT NULL DEFAULT 0, ADD COLUMN "emailSentAt" TIMESTAMP(3),
  ADD COLUMN "emailNextAt" TIMESTAMP(3), ADD COLUMN "emailAttempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "emailFirstAttemptAt" TIMESTAMP(3), ADD COLUMN "emailLeaseUntil" TIMESTAMP(3),
  ADD COLUMN "emailLeaseToken" TEXT, ADD COLUMN "emailPayload" JSONB, ADD COLUMN "emailError" TEXT;
ALTER TABLE "OrderDelivery" ALTER COLUMN "emailNextAt" SET DEFAULT CURRENT_TIMESTAMP;
CREATE INDEX "OrderDelivery_emailNextAt_idx" ON "OrderDelivery"("emailNextAt");
