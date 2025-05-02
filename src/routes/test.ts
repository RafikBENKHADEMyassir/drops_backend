import express from 'express';
import { Request, Response } from 'express';
// import { authenticateUser } from "../middleware/authMiddleware";
// import emailService from '../services/emailService';
import notificationService from '../services/notificationService';

const router = express.Router();

/**
 * Test endpoint to send a test email
 * Protected by authentication to prevent abuse
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

router.get('/send-test-message', async (req: Request, res: Response): Promise<void> => {
  try {
    // Hardcoded test data
    const senderId = '3a8dc6e9-ed89-4c7c-a029-cc2d0edc4353';
    // const receiverId = '59e572f2-2dbb-4e74-8a1e-0af47986ab7d';
    const conversationId = '71cee3d1-25ae-4854-9013-c7902b5b0df5';
    const content = 'test';

    // 1. Create new message in DB
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
        status: 'sent'
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            name: true,
            profile_image_url: true,
          }
        }
      }
    });

    // 2. Prepare recipients (all participants except sender)
    const participants = await prisma.participant.findMany({
      where: { conversationId },
      select: { userId: true }
    });
    const recipients = participants.map(p => p.userId).filter(id => id !== "senderId");

    // 3. Emit new_message event via socket
    const io = req.app.get('io');
    if (io) {
      io.to(`conversation:${conversationId}`).emit('new_message', {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        senderName: message.sender.name || `${message.sender.firstName || ''} ${message.sender.lastName || ''}`.trim(),
        senderAvatar: message.sender.profile_image_url,
        content: message.content,
        status: message.status,
        isDeleted: message.isDeleted,
        timestamp: message.createdAt,
        readBy: [],
        data: message.data ? (typeof message.data === 'object' ? message.data : JSON.parse(message.data as any)) : null,
        test: true
      });
    }

    // 4. Send push notification
    await notificationService.sendMessageNotification({
      senderId,
      conversationId,
      recipients,
      senderName: message.sender.name || `${message.sender.firstName || ''} ${message.sender.lastName || ''}`.trim(),
      senderAvatar: message.sender.profile_image_url || undefined,
      content,
      // attachmentUrl: undefined,
      messageId: message.id
    });

    res.json({
      success: true,
      message: 'Test message created, notification sent, and socket event emitted',
      conversationId,
      senderId,
      recipients,
      messageId: message.id
    });
  } catch (error) {
    console.error('Error in send-test-email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test message',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});
export default router;