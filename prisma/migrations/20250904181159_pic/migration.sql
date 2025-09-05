-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('NORMAL', 'ADMIN');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "kindeId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'NORMAL',
    "picture" TEXT,
    "isOnBoarded" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_kindeId_key" ON "public"."User"("kindeId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");
