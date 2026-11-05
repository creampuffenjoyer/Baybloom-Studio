ALTER TABLE "Order"
  ADD COLUMN "checkoutKey" TEXT,
  ADD COLUMN "checkoutExpiresAt" TIMESTAMP(3),
  ADD COLUMN "checkoutParameters" JSONB,
  ADD COLUMN "couponReserved" BOOLEAN NOT NULL DEFAULT false;

-- Existing unpaid checkouts may still complete. Hold their capacity until an
-- authoritative Stripe expiration/failure is received or manually reconciled.
UPDATE "Order" SET "couponReserved" = true
WHERE "status" = 'PENDING' AND "couponCode" IS NOT NULL;

CREATE UNIQUE INDEX "Order_checkoutKey_key" ON "Order"("checkoutKey");
CREATE INDEX "Order_couponCode_couponReserved_idx" ON "Order"("couponCode", "couponReserved");
CREATE INDEX "Order_status_checkoutExpiresAt_idx" ON "Order"("status", "checkoutExpiresAt");

CREATE TABLE "CheckoutRequest" (
  "userId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  CONSTRAINT "CheckoutRequest_pkey" PRIMARY KEY ("userId", "key"),
  CONSTRAINT "CheckoutRequest_orderId_fkey" FOREIGN KEY ("orderId")
    REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "CheckoutRequest_orderId_idx" ON "CheckoutRequest"("orderId");
