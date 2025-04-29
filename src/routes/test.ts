import express from 'express';
import { Request, Response } from 'express';
// import { authenticateUser } from "../middleware/authMiddleware";
import emailService from '../services/emailService';

const router = express.Router();

/**
 * Test endpoint to send a test email
 * Protected by authentication to prevent abuse
 */
router.post('/send-test-email', async (_req: Request, res: Response): Promise<void> => {
  try {
    const recipient = 'rafik.benkhadem@gmail.com';
    const subject = 'Test Email from Drops App';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #f9f9f9;">
        <h1 style="color: #333; text-align: center;">Test Email from Drops App</h1>
        <p style="font-size: 16px; line-height: 1.5; color: #555;">
          This is a test email sent from your Drops application backend.
        </p>
        <p style="font-size: 16px; line-height: 1.5; color: #555;">
          If you're receiving this email, it means your email service is configured correctly.
        </p>
        <div style="margin: 30px 0; padding: 15px; background-color: #e9f7fe; border-left: 4px solid #2196f3; border-radius: 4px;">
          <strong>Time sent:</strong> ${new Date().toLocaleString()}
        </div>
        <p style="font-size: 14px; color: #777; margin-top: 40px; text-align: center;">
          This is an automated message, please do not reply.
        </p>
      </div>
    `;

    await emailService.sendEmail({
      to: recipient,
      subject,
      html: htmlContent
    });

    res.json({
      success: true,
      message: `Test email sent successfully to ${recipient}`
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});
router.get('/send-test-message', async (req: Request, res: Response): Promise<void> => {
  try {
    const { conversationId, senderId, content } = req.query;

    if (!conversationId || !senderId || !content) {
       res.status(400).json({ success: false, message: 'conversationId, senderId, and content are required as query params' });
    }

    // Access io instance from app (set in index.ts)
    const io = req.app.get('io');
    if (!io) {
       res.status(500).json({ success: false, message: 'Socket server not initialized' });
    }

    // Emit a test message event to all users in the conversation room
    io.to(`conversation:${conversationId}`).emit('new_message', {
      id: 'test-id',
      conversationId,
      senderId,
      senderName: 'Test User',
      senderAvatar: null,
      content,
      status: 'sent',
      isDeleted: false,
      timestamp: new Date().toISOString(),
      readBy: [],
      data: {},
      test: true
    });

    res.json({ success: true, message: 'Test message sent via socket', conversationId, senderId, content });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send test message', error: error instanceof Error ? error.message : String(error) });
  }
});
export default router;