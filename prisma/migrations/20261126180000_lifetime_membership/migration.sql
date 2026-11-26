BEGIN;
CREATE TABLE "MembershipPayment" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "activeKey" TEXT UNIQUE,
    "sessionId" TEXT UNIQUE,
    "parameters" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3)
);
CREATE INDEX "MembershipPayment_userId_status_idx" ON "MembershipPayment"("userId", "status");
COMMIT;
