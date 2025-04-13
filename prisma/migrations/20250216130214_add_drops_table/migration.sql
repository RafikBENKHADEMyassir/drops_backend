/*
  Warnings:

  - Added the required column `location` to the `Drop` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Drop` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Drop" ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;
