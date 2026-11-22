CREATE TABLE "OrderPersonalization" (
    "orderItemId" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "heroImage" BYTEA,
    CONSTRAINT "OrderPersonalization_pkey" PRIMARY KEY ("orderItemId")
);

CREATE TABLE "OrderPersonalizationImage" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "slot" TEXT NOT NULL,
    "image" BYTEA NOT NULL,
    CONSTRAINT "OrderPersonalizationImage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OrderPersonalizationImage_orderItemId_slot_key" ON "OrderPersonalizationImage"("orderItemId", "slot");
ALTER TABLE "OrderPersonalization" ADD CONSTRAINT "OrderPersonalization_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderPersonalizationImage" ADD CONSTRAINT "OrderPersonalizationImage_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderPersonalization"("orderItemId") ON DELETE CASCADE ON UPDATE CASCADE;
