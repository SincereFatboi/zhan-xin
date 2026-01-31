-- CreateEnum
CREATE TYPE "public"."RoleType" AS ENUM ('MEMBER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "public"."StatusType" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "public"."user" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),
    "created_by" UUID,
    "updated_by" UUID,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "role" "public"."RoleType" NOT NULL DEFAULT 'MEMBER',
    "status" "public"."StatusType" NOT NULL DEFAULT 'PENDING',
    "password" TEXT NOT NULL,
    "refresh_tokens" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "pk_user" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."score" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),
    "created_by" UUID,
    "updated_by" UUID,
    "score_name" TEXT NOT NULL,
    "full_name" TEXT,

    CONSTRAINT "pk_score" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."room" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),
    "created_by" UUID,
    "updated_by" UUID,
    "room_name" TEXT NOT NULL,
    "scores" JSON NOT NULL,

    CONSTRAINT "pk_room" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "public"."user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "score_score_name_key" ON "public"."score"("score_name");

-- CreateIndex
CREATE UNIQUE INDEX "room_room_name_key" ON "public"."room"("room_name");
