/*
  Warnings:

  - You are about to drop the column `userId` on the `AuthorizedEmail` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AuthorizedEmail" DROP CONSTRAINT "AuthorizedEmail_userId_fkey";

-- DropIndex
DROP INDEX "AuthorizedEmail_userId_email_key";

-- AlterTable
ALTER TABLE "AuthorizedEmail" DROP COLUMN "userId";
