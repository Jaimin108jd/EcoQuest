/*
  Warnings:

  - You are about to drop the column `qrCode` on the `Event` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."User_email_key";

-- AlterTable
ALTER TABLE "public"."Event" DROP COLUMN "qrCode";
