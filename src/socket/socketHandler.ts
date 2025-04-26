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

    // Rest of the socket event handlers...

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
        const sender = await prisma.user.findUnique({
          where: { id: socket.data.userId },
          select: { name: true },
        });
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
  });


  return io;
};