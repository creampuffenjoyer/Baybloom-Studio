ALTER TABLE "OrderDelivery" ADD COLUMN "artifactStorageKey" TEXT;
ALTER TABLE "OrderDelivery" DROP CONSTRAINT "OrderDelivery_artifact";
ALTER TABLE "OrderDelivery" ADD CONSTRAINT "OrderDelivery_artifact" CHECK (
  ("artifact" IS NULL AND "artifactStorageKey" IS NULL AND "artifactSha256" IS NULL AND "readyAt" IS NULL) OR
  (("artifact" IS NOT NULL OR "artifactStorageKey" IS NOT NULL) AND "artifactSha256" IS NOT NULL
    AND "artifactSha256" ~ '^[a-f0-9]{64}$' AND "readyAt" IS NOT NULL)
);
