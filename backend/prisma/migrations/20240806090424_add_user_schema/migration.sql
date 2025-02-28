-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('MEMBER', 'ADMIN', 'SUPER_ADMIN');

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),
    "created_by" UUID,
    "updated_by" UUID,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "RoleType" NOT NULL DEFAULT 'MEMBER',
    "password" TEXT NOT NULL,
    "refresh_token" TEXT,

    CONSTRAINT "pk_user" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
