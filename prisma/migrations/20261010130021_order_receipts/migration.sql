-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "billing" JSONB,
ADD COLUMN     "confirmationSentAt" TIMESTAMP(3),
ADD COLUMN     "receiptUrl" TEXT;
