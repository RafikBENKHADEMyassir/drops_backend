import { PrismaClient } from '@prisma/client';
import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// Initialize Firebase Admin SDK (assuming you have firebase service account key)
if (admin.apps.length === 0) {
    try {
      let serviceAccount;
      
      // Try to get from environment variable
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        try {
          serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
          console.log('Using Firebase service account from environment variable');
        } catch (parseError) {
          console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:', parseError);
        }
      }
      
      // If not found in env var, try to load from file path
      if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
        const accountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
        if (fs.existsSync(accountPath)) {
          serviceAccount = require(accountPath);
          console.log(`Using Firebase service account from path: ${accountPath}`);
        } else {
          console.error(`Firebase service account file not found at: ${accountPath}`);
        }
      }
      
      // Try relative path in project
      if (!serviceAccount) {
        const projectPath = path.resolve(__dirname, '../../firebase-service-account.json');
        if (fs.existsSync(projectPath)) {
          serviceAccount = require(projectPath);
          console.log(`Using Firebase service account from project path: ${projectPath}`);
        }
      }
      
      // If we have a valid service account, initialize Firebase
      if (serviceAccount) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin SDK initialized successfully');
      } else {
        console.warn('Firebase service account not found. Push notifications will not work.');
        // Create a mock implementation to prevent errors when service is called
        if (process.env.NODE_ENV !== 'production') {
          admin.initializeApp({
            projectId: 'mock-project'
          });
        }
      }
    } catch (error) {
      console.error('Error initializing Firebase Admin SDK:', error);
    }
  }

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

class NotificationService {
  
  /**
   * Send a notification to a specific user
   */
  async sendToUser(
    userId: string, 
    payload: NotificationPayload, 
    notificationType: string
  ): Promise<void> {
    try {
      // Find all active devices for this user
      const devices = await prisma.device.findMany({
        where: { 
          userId,
          isActive: true 
        }
      });
      
      if (devices.length === 0) {
        console.log(`No active devices found for user ${userId}`);
        return;
      }
      
      // Store notification in database
      //  await prisma.notification.create({
      //   data: {
      //     userId,
      //     title: payload.title,
      //     body: payload.body,
      //     data: payload.data || {},
      //     type: notificationType
      //   }
      // });
      if (!admin.apps.length || !admin.messaging) {
        console.warn('Firebase Admin SDK not properly initialized. Notification saved to database but push notification not sent.');
        return;
      }
      // Extract device tokens
      const tokens = devices.map(device => device.token);
      
      // Prepare FCM message
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl
        },
        data: {
          ...payload.data,
          type: notificationType
        },
        android: {
          priority: 'high',
          notification: {
            channelId: 'high_importance_channel',
            priority: 'high'
          }
        },
        apns: {
          payload: {
            aps: {
              contentAvailable: true,
              sound: 'default',
              badge: 1
            }
          }
        }
      };
      
      // Send the notification
      console.log(`Sending notification to ${message} devices...`);
      const response = await admin.messaging().sendEachForMulticast(message);
      console.log(`Notification sent to ${response.successCount} devices`);
      
      // Handle failed tokens
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
            console.log(`Failed to send notification to ${tokens[idx]}:`, resp.error);
          }
        });
        
        // Remove failed tokens if they're invalid
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const token = tokens[idx];
            const device = devices.find(d => d.token === token);
            if (device && resp.error?.code === 'messaging/invalid-registration-token') {
              prisma.device.update({
                where: { id: device.id },
                data: { isActive: false }
              }).catch(err => console.error(`Error updating device ${device.id}:`, err));
            }
          }
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }
  
  /**
   * Send notification to multiple users
   */
  async sendToUsers(
    userIds: string[],
    payload: NotificationPayload,
    notificationType: string
  ): Promise<void> {
    for (const userId of userIds) {
      await this.sendToUser(userId, payload, notificationType);
    }
  }
  
  /**
   * Send a notification related to a friend request
   */
  async sendFriendRequestNotification(
    requestId: string,
    senderId: string,
    recipientId: string
  ): Promise<void> {
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: {
        name: true,
        firstName: true,
        profile_image_url: true
      }
    });
    
    if (!sender) return;
    
    const senderName = sender.name || sender.firstName || 'Someone';
    console.log('Sender name:', sender.profile_image_url);
    await this.sendToUser(
      recipientId,
      {
        title: 'New Friend Request',
        body: `${senderName} sent you a friend request`,
        // imageUrl: sender.profile_image_url || undefined,
        data: {
          requestId,
          senderId
        }
      },
      'friendRequest'
    );
  }
  
  /**
   * Send a notification for a new message
   */
  async sendMessageNotification(
    params: {
      senderId: string,
      conversationId: string,
      recipients: string[],
      senderName: string,
      senderAvatar?: string,
      content: string,
      attachmentUrl?: string,
      messageId: string
    }
  ): Promise<void> {
    const {
      senderId,
      conversationId,
      recipients,
      senderName,
      senderAvatar,
      content,
      attachmentUrl,
      messageId
    } = params;
  
    // Don't notify the sender
    const recipientsToNotify = recipients.filter(id => id !== senderId);
  console.log('Recipients to notify:', recipientsToNotify,senderAvatar);
    // Truncate message content if too long
    let contentPreview = content;
    if (contentPreview.length > 100) {
      contentPreview = contentPreview.substring(0, 97) + '...';
    }
  
    for (const recipientId of recipientsToNotify) {
      console.log('Recipient notification:', conversationId,messageId,senderId);

      await this.sendToUser(
        recipientId,
        {
          title: senderName,
          body: attachmentUrl ? '📎 Attachment' : contentPreview,
          // imageUrl: senderAvatar,
          data: {
            conversationId,
            messageId,
            senderId
          }
        },
        'message'
      );
    }
  }

/**
 * Send a notification for a shared drop
 */
async sendDropSharedNotification(
    dropId: string,
    senderId: string,
    recipientId: string,
    dropTitle: string
  ): Promise<void> {
    // Get sender details
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: {
        name: true,
        firstName: true,
        // profile_image_url: true
      }
    });
    
    if (!sender) return;
    
    const senderName = sender.name || sender.firstName || 'Someone';
    
    await this.sendToUser(
      recipientId,
      {
        title: `${senderName} shared a Drop with you`,
        body: `${dropTitle} - Find it nearby to unlock!`,
        // imageUrl: sender.profile_image_url || undefined,
        data: {
          dropId,
          senderId,
          type: 'dropShared',
          action: 'viewDrop'
        }
      },
      'dropShared'
    );
  }
  async sendFriendRequestAcceptedNotification(
    accepterId: string,
    senderId: string
  ): Promise<void> {
    // Get accepter details
    const accepter = await prisma.user.findUnique({
      where: { id: accepterId },
      select: {
        name: true,
        firstName: true,
        profile_image_url: true
      }
    });
    
    if (!accepter) return;
    
    const accepterName = accepter.name || accepter.firstName || 'Someone';
    
    await this.sendToUser(
      senderId,
      {
        title: 'Friend Request Accepted',
        body: `${accepterName} accepted your friend request`,
        imageUrl: accepter.profile_image_url || undefined,
        data: {
          friendId: accepterId,
          type: 'friendAccepted',
          action: 'viewProfile'
        }
      },
      'friendAccepted'
    );
  }
}



export default new NotificationService();