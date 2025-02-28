-- CreateTable
CREATE TABLE "room" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),
    "created_by" UUID,
    "updated_by" UUID,
    "room_name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "clients" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "documents" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "pk_room" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "room_room_name_key" ON "room"("room_name");
