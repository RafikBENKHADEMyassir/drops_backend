import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import notificationService from '../services/notificationService';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; // Using same secret as in auth middleware

interface UserSocket {
  userId: string;
  socketId: string;
}

export const setupSocketIO = (server: HTTPServer) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*', // In production, replace with your frontend URL
      methods: ['GET', 'POST'],
    },
  });

  // Keep track of connected users
  const connectedUsers: UserSocket[] = [];

  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }

      // Using same JWT verification as in your auth middleware
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (!decoded || !decoded.userId) {
        return next(new Error('Authentication error: Invalid token'));
      }

      // Attach user info to socket
      socket.data.userId = decoded.userId;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  // Rest of the socket implementation remains the same
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.data.userId}`);
    
    // Add user to connected users array
    connectedUsers.push({
      userId: socket.data.userId,
      socketId: socket.id
    });
    
    // Join user to their own room for private messages
    socket.join(`user:${socket.data.userId}`);
    
    // Join conversation
    socket.on('join_conversation', async (data) => {
      try {
        const { conversationId } = data;
        
        // Verify the user is a participant in this conversation
        const participant = await prisma.participant.findUnique({
          where: {
            userId_conversationId: {
              userId: socket.data.userId,
              conversationId: conversationId
            }
          }
        });
        
        if (!participant) {
          socket.emit('error', { message: 'You are not a member of this conversation' });
          return;
        }
        
        socket.join(`conversation:${conversationId}`);
        console.log(`User ${socket.data.userId} joined conversation ${conversationId}`);
      } catch (error) {
        console.error('Error joining conversation:', error);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });


    // Disconnect event
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.userId}`);
      
      // Remove user from connected users array
      const index = connectedUsers.findIndex((user) => user.socketId === socket.id);
      if (index !== -1) {
        connectedUsers.splice(index, 1);
      }
    });

    socket.on('share_drop', async (data) => {
      try {
        const { receiverId, dropId, dropTitle } = data;
    
        // Check if a conversation exists between the sender and receiver
        let conversation = await prisma.conversation.findFirst({
          where: {
            AND: [
              { participants: { some: { userId: socket.data.userId } } },
              { participants: { some: { userId: receiverId } } },
            ],
          },
        });
    
        // If no conversation exists, create one
        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              participants: {
                create: [
                  { userId: socket.data.userId },
                  { userId: receiverId },
                ],
              },
            },
          });
        }
    
        // Add a message about the shared drop
        const message = await prisma.message.create({
          data: {
            conversationId: conversation.id,
            senderId: socket.data.userId,
            content: `I shared a Drop with you: "${dropTitle}"`,
            data: { dropId, dropTitle, type: 'dropShared', isLocked: true },
            status: 'sent',
          },
        });
    
        // Notify the receiver in real-time
        io.to(`user:${receiverId}`).emit('new_message', message);
    
        // Send a push notification to the receiver
        // const sender = await prisma.user.findUnique({
        //   where: { id: socket.data.userId },
        //   select: { name: true },
        // });
        await notificationService.sendDropSharedNotification(
          dropId,
          socket.data.userId,
          receiverId,
          dropTitle
        );
      } catch (error) {
        console.error('Error sharing drop:', error);
        socket.emit('error', { message: 'Failed to share drop' });
      }
    });
  
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, attachment, userId } = data;
    
        // 1. Validate participant
        const participant = await prisma.participant.findUnique({
          where: {
            userId_conversationId: {
              userId,
              conversationId
            }
          }
        });
        if (!participant) {
          socket.emit('error', { message: 'You are not a member of this conversation' });
          return;
        }
    
        // 2. Save message to DB
        const message = await prisma.message.create({
          data: {
            conversationId,
            senderId: userId,
            content,
            attachmentUrl: attachment?.url,
            attachmentType: attachment?.type,
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
    
        // 3. Get all participant userIds for notification (except sender)
        const participants = await prisma.participant.findMany({
          where: { conversationId },
          select: { userId: true }
        });
        const recipientIds = participants.map(p => p.userId);
    
        // 4. Emit to all users in the conversation room
        io.to(`conversation:${conversationId}`).emit('new_message', {
          id: message.id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          senderName: message.sender.name || `${message.sender.firstName || ''} ${message.sender.lastName || ''}`.trim(),
          senderAvatar: message.sender.profile_image_url,
          content: message.content,
          attachmentUrl: message.attachmentUrl,
          attachmentType: message.attachmentType,
          status: message.status,
          isDeleted: message.isDeleted,
          timestamp: message.createdAt,
          readBy: [],
          data: message.data ? (typeof message.data === 'object' ? message.data : JSON.parse(message.data as any)) : null,
        });
    
        // 5. Send push notification (no DB fetch, all data passed)
        await notificationService.sendMessageNotification({
          senderId: userId,
          conversationId,
          recipients: recipientIds,
          senderName: message.sender.name || `${message.sender.firstName || ''} ${message.sender.lastName || ''}`.trim(),
          senderAvatar: message.sender.profile_image_url || undefined,
          content,
          attachmentUrl: attachment?.url,
          messageId: message.id
        });
    
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
  
  });


  return io;
};