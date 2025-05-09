-- CreateTable
CREATE TABLE "deleted_conversations" (
    "userId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deleted_conversations_pkey" PRIMARY KEY ("userId","conversationId")
);

-- AddForeignKey
ALTER TABLE "deleted_conversations" ADD CONSTRAINT "deleted_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deleted_conversations" ADD CONSTRAINT "deleted_conversations_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
