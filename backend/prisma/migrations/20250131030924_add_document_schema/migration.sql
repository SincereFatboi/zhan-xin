-- CreateTable
CREATE TABLE "document" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),
    "created_by" UUID,
    "updated_by" UUID,
    "document_key" TEXT NOT NULL,
    "song_key" TEXT,

    CONSTRAINT "pk_document" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "document_document_key_key" ON "document"("document_key");
