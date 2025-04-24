/*
  Warnings:

  - You are about to drop the column `isLocked` on the `Friend` table. All the data in the column will be lost.
  - You are about to drop the column `lastChecked` on the `Friend` table. All the data in the column will be lost.
  - You are about to drop the column `unlockedAt` on the `Friend` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Friend" DROP COLUMN "isLocked",
DROP COLUMN "lastChecked",
DROP COLUMN "unlockedAt";

-- AlterTable
ALTER TABLE "SharedDrop" ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastChecked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "unlockedAt" TIMESTAMP(3);
