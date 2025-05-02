import { Request, Response } from 'express';
import ChatService from '../services/chatService';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/chat');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif',
      'video/mp4', 'video/quicktime',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
      return; // Add return statement
    } else {
      // Reject the file
      cb(null, false);
      // Create an error
      return new Error('Unsupported file type');
    }
  }
});

const chatService = new ChatService();

export default class ChatController {
  // Get all conversations for the current user
  async getConversations(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({
            success: false,
            message: 'Unauthorized'
            });
        }
      const conversations = await chatService.getConversations(userId!);
      
      res.status(200).json({
        success: true,
        conversations
      });
    } catch (error) {
      console.error('Error in getConversations:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch conversations'
      });
    }
  }

  // Get a specific conversation by ID
  async getConversationById(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({
            success: false,
            message: 'Unauthorized'
            });
        }
      const { id } = req.params;
      
      const conversation = await chatService.getConversationById(id, userId!);
      
      res.status(200).json({
        success: true,
        conversation
      });
    } catch (error) {
      console.error('Error in getConversationById:', error);
      res.status(error instanceof Error && error.message.includes('not a member') ? 403 : 500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch conversation'
      });
    }
  }

  // Get messages for a conversation
  async getMessages(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({
            success: false,
            message: 'Unauthorized'
            });
        }
      const { id } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      const beforeId = req.query.beforeId as string;
      
      const messages = await chatService.getMessages(id, userId!, limit, beforeId);
      
      res.status(200).json({
        success: true,
        messages
      });
    } catch (error) {
      console.error('Error in getMessages:', error);
      res.status(error instanceof Error && error.message.includes('not a member') ? 403 : 500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch messages'
      });
    }
  }

  // Send a new message
  async sendMessage(req: Request, res: Response) {upload.single('attachment')(req, res, async (err) => {
    if (err) {
      console.error('Error uploading file:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error'
      });
    }
    
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({  // Added return here
          success: false,
          message: 'Unauthorized'
        });
      }
      
      const { id } = req.params;
      const { content } = req.body;
      
      let attachment;
      if (req.file) {
        const fileName = req.file.filename;
        const filePath = `/uploads/chat/${fileName}`;
        attachment = {
          url: filePath,
          type: req.file.mimetype
        };
      }
      
      const message = await chatService.sendMessage(id, userId, content, attachment);
      const io = req.app.get('io');
      if (io) {
        io.to(`conversation:${id}`).emit('new_message', message);
      }
      return res.status(201).json({  // Added return here for consistency
        success: true,
        message
      });
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return res.status(error instanceof Error && error.message.includes('not a member') ? 403 : 500).json({  // Added return here
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send message'
      });
    }
  });
  }

  // Create a new conversation
  async createConversation(req: Request, res: Response) {
    // Use multer to handle file uploads for group images
    upload.single('groupImage')(req, res, async (err) => {
      if (err) {
        console.error('Error uploading file:', err);
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload error'
        });
      }
      
      try {
        const userId = req.user?.userId;
        if (!userId) {
          return res.status(401).json({  // Added return here
            success: false,
            message: 'Unauthorized'
          });
        }
        const { participantIds, name } = req.body;
        
        // Parse participant IDs if they come as a string
        const parsedParticipantIds = Array.isArray(participantIds) 
          ? participantIds 
          : participantIds.split(',').map((id: string) => id.trim());
        
        // Create the conversation
        const conversation = await chatService.createConversation(
          userId,
          parsedParticipantIds,
          name
        );
        
        // If there's a group image uploaded, update the conversation (this would require additional logic)
        // For simplicity, we're not handling group images in this example
        
        return res.status(201).json({  // Added return here
          success: true,
          conversation
        });
      } catch (error) {
        console.error('Error in createConversation:', error);
        return res.status(500).json({  // Added return here
          success: false,
          message: error instanceof Error ? error.message : 'Failed to create conversation'
        });
      }
    });
  }

  // Mark messages as read
  async markAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      const { messageIds } = req.body;
      
      await chatService.markMessagesAsRead(id, userId!, messageIds);
      
      res.status(200).json({
        success: true
      });
    } catch (error) {
      console.error('Error in markAsRead:', error);
      res.status(error instanceof Error && error.message.includes('not a member') ? 403 : 500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to mark messages as read'
      });
    }
  }

  // Leave a conversation
  async leaveConversation(req: Request, res: Response) {
    try {
      const userId = req.user?.userId; // Changed from req.user.id
      const { id } = req.params;
      
      await chatService.leaveConversation(id, userId!);
      
      res.status(200).json({
        success: true
      });
    } catch (error) {
      console.error('Error in leaveConversation:', error);
      res.status(error instanceof Error && error.message.includes('not a member') ? 403 : 500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to leave conversation'
      });
    }
  }

  // Delete a message
  async deleteMessage(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({
            success: false,
            message: 'Unauthorized'
            });
        }
      const { id } = req.params;
      const forEveryone = req.query.forEveryone === 'true';
      
      await chatService.deleteMessage(id, userId!, forEveryone);
      
      res.status(200).json({
        success: true
      });
    } catch (error) {
      console.error('Error in deleteMessage:', error);
      res.status(error instanceof Error && (error.message.includes('not a member') || error.message.includes('only delete your own')) ? 403 : 500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete message'
      });
    }
  }
}