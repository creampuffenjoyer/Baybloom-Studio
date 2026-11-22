CREATE TABLE "TemplateRelease" (
  "sha256" TEXT PRIMARY KEY,
  "template" TEXT NOT NULL,
  "templateVersion" TEXT NOT NULL,
  "contentVersion" INTEGER NOT NULL,
  "archive" BYTEA NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TemplateRelease_digest" CHECK ("sha256" ~ '^[a-f0-9]{64}$')
);
CREATE TABLE "ActiveTemplateRelease" (
  "template" TEXT PRIMARY KEY,
  "releaseId" TEXT NOT NULL REFERENCES "TemplateRelease"("sha256") ON DELETE RESTRICT ON UPDATE CASCADE
);
ALTER TABLE "OrderPersonalization"
  ADD COLUMN "sourceReleaseId" TEXT REFERENCES "TemplateRelease"("sha256") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD COLUMN "formatVersion" INTEGER,
  ADD COLUMN "snapshotSha256" TEXT,
  ADD COLUMN "mode" TEXT NOT NULL DEFAULT 'SAVED_DRAFT',
  ADD COLUMN "imageRightsConfirmedAt" TIMESTAMP(3),
  ADD CONSTRAINT "OrderPersonalization_mode" CHECK ("mode" IN ('ORIGINAL', 'SAVED_DRAFT')),
  ADD CONSTRAINT "OrderPersonalization_versioned" CHECK (
    ("sourceReleaseId" IS NULL AND "formatVersion" IS NULL AND "snapshotSha256" IS NULL) OR
    ("sourceReleaseId" IS NOT NULL AND "formatVersion" IS NOT NULL AND "formatVersion" = 1 AND "snapshotSha256" IS NOT NULL AND "snapshotSha256" ~ '^[a-f0-9]{64}$')
  );
CREATE TABLE "OrderDelivery" (
  "orderItemId" TEXT PRIMARY KEY REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "artifact" BYTEA,
  "artifactSha256" TEXT,
  "readyAt" TIMESTAMP(3),
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "nextAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "leaseUntil" TIMESTAMP(3),
  "leaseToken" TEXT,
  "lastError" TEXT,
  CONSTRAINT "OrderDelivery_artifact" CHECK (
    ("artifact" IS NULL AND "artifactSha256" IS NULL AND "readyAt" IS NULL) OR
    ("artifact" IS NOT NULL AND "artifactSha256" IS NOT NULL AND "artifactSha256" ~ '^[a-f0-9]{64}$' AND "readyAt" IS NOT NULL)
  )
);
CREATE INDEX "OrderDelivery_nextAt_idx" ON "OrderDelivery"("nextAt");

-- Source releases and captured purchase data are append-only. Order deletion may
-- still cascade snapshots for explicit account/data lifecycle operations.
CREATE FUNCTION "reject_purchase_snapshot_update"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Purchase snapshots and source releases are immutable';
END;
$$;
CREATE TRIGGER "TemplateRelease_immutable" BEFORE UPDATE ON "TemplateRelease"
  FOR EACH ROW EXECUTE FUNCTION "reject_purchase_snapshot_update"();
CREATE TRIGGER "OrderPersonalization_immutable" BEFORE UPDATE ON "OrderPersonalization"
  FOR EACH ROW EXECUTE FUNCTION "reject_purchase_snapshot_update"();
CREATE TRIGGER "OrderPersonalizationImage_immutable" BEFORE UPDATE ON "OrderPersonalizationImage"
  FOR EACH ROW EXECUTE FUNCTION "reject_purchase_snapshot_update"();
