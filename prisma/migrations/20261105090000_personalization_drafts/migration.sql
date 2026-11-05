CREATE TABLE "PersonalizationDraft" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PersonalizationDraft_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PersonalizationDraft_userId_template_key" ON "PersonalizationDraft"("userId", "template");
ALTER TABLE "PersonalizationDraft" ADD CONSTRAINT "PersonalizationDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
