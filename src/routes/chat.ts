import express from 'express';
import ChatController from '../controllers/chatController';
import { authenticateUser } from '../middleware/authMiddleware';

const router = express.Router();
const chatController = new ChatController();

// Apply authentication middleware to all chat routes
router.use(authenticateUser);

// Get all conversations
router.get('/conversations', chatController.getConversations.bind(chatController));

// Create a new conversation
router.post('/conversations', chatController.createConversation.bind(chatController));

// Get a specific conversation
router.get('/conversations/:id', chatController.getConversationById.bind(chatController));

// Get messages for a conversation
router.get('/conversations/:id/messages', chatController.getMessages.bind(chatController));

// Send a message
router.post('/conversations/:id/messages', chatController.sendMessage.bind(chatController));

// Mark messages as read
router.post('/conversations/:id/read', chatController.markAsRead.bind(chatController));

// Leave a conversation
router.post('/conversations/:id/leave', chatController.leaveConversation.bind(chatController));

// Delete a message
router.delete('/messages/:id', chatController.deleteMessage.bind(chatController));

export default router;