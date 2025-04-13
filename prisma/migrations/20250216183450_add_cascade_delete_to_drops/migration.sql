-- DropForeignKey
ALTER TABLE "Drop" DROP CONSTRAINT "Drop_userId_fkey";

-- AddForeignKey
ALTER TABLE "Drop" ADD CONSTRAINT "Drop_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
