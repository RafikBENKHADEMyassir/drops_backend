-- CreateTable
CREATE TABLE "SharedDrop" (
    "id" TEXT NOT NULL,
    "dropId" TEXT NOT NULL,
    "friendId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SharedDrop_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SharedDrop_dropId_friendId_key" ON "SharedDrop"("dropId", "friendId");

-- AddForeignKey
ALTER TABLE "SharedDrop" ADD CONSTRAINT "SharedDrop_dropId_fkey" FOREIGN KEY ("dropId") REFERENCES "Drop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedDrop" ADD CONSTRAINT "SharedDrop_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
