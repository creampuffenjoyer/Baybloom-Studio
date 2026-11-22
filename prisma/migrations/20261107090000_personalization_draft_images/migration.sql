CREATE TABLE "PersonalizationDraftImage" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "slot" TEXT NOT NULL,
    "image" BYTEA NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PersonalizationDraftImage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PersonalizationDraftImage_draftId_slot_key" ON "PersonalizationDraftImage"("draftId", "slot");
ALTER TABLE "PersonalizationDraftImage" ADD CONSTRAINT "PersonalizationDraftImage_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "PersonalizationDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;
