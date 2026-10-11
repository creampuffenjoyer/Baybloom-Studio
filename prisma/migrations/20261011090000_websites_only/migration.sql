-- Baybloom now sells website templates only. Remove architecture and interior
-- products (and anything that references them) before dropping the type columns.

-- Order items keep a Restrict FK to Design, so clear those first, then any
-- orders left without items.
DELETE FROM "OrderItem" WHERE "designId" IN (SELECT "id" FROM "Design" WHERE "type" <> 'WEBSITE');
DELETE FROM "Order" o WHERE NOT EXISTS (SELECT 1 FROM "OrderItem" i WHERE i."orderId" = o."id");

-- Images, tiers, features, add-ons, favorites, cart items and files cascade.
DELETE FROM "Design" WHERE "type" <> 'WEBSITE';

-- Drawing/render feature tags and add-ons that only applied to built products.
DELETE FROM "Feature" WHERE NOT ('WEBSITE' = ANY ("appliesTo"));
DELETE FROM "Addon" WHERE cardinality("productTypes") > 0 AND NOT ('WEBSITE' = ANY ("productTypes"));

-- AlterEnum
BEGIN;
CREATE TYPE "ImageKind_new" AS ENUM ('PHOTO', 'MOCKUP', 'SCREENSHOT');
ALTER TABLE "public"."DesignImage" ALTER COLUMN "kind" DROP DEFAULT;
ALTER TABLE "DesignImage" ALTER COLUMN "kind" TYPE "ImageKind_new" USING ("kind"::text::"ImageKind_new");
ALTER TYPE "ImageKind" RENAME TO "ImageKind_old";
ALTER TYPE "ImageKind_new" RENAME TO "ImageKind";
DROP TYPE "public"."ImageKind_old";
ALTER TABLE "DesignImage" ALTER COLUMN "kind" SET DEFAULT 'PHOTO';
COMMIT;

-- DropIndex
DROP INDEX "Design_status_type_idx";

-- AlterTable
ALTER TABLE "Addon" DROP COLUMN "productTypes";

-- AlterTable
ALTER TABLE "Design" DROP COLUMN "type";

-- AlterTable
ALTER TABLE "Feature" DROP COLUMN "appliesTo";

-- DropEnum
DROP TYPE "ProductType";

-- CreateIndex
CREATE INDEX "Design_status_idx" ON "Design"("status");

