import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticateUser } from "../middleware/authMiddleware";
import { Request, Response } from 'express';
import notificationService from '../services/notificationService';

const router = express.Router();
const prisma = new PrismaClient();

// Register a device token
router.post('/token', 
  authenticateUser,
  [
    body('token').notEmpty().withMessage('Device token is required'),
    body('device_type').isIn(['ios', 'android']).withMessage('Valid device type is required')
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
        return;
      }
      
      const { token, device_type } = req.body;
      const userId = req.user!.userId;
      
      // Update or create device token
      await prisma.device.upsert({
        where: {
          token: token,
        },
        update: {
          userId,
          deviceType: device_type,
          isActive: true,
          updatedAt: new Date()
        },
        create: {
          token,
          userId,
          deviceType: device_type,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      res.json({ 
        success: true,
        message: 'Device registered successfully' 
      });
    } catch (error) {
      console.error('Error registering device:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to register device'
      });
    }
  }
);

// Unregister a device token
router.post('/unregister-device',
  authenticateUser,
  [
    body('token').notEmpty().withMessage('Device token is required')
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
        return;
      }
      
      const { token } = req.body;
      const userId = req.user!.userId;
      
      // Find and deactivate the device
      const device = await prisma.device.findFirst({
        where: {
          token,
          userId
        }
      });
      
      if (device) {
        await prisma.device.update({
          where: { id: device.id },
          data: { isActive: false }
        });
      }
      
      res.json({
        success: true,
        message: 'Device unregistered successfully'
      });
    } catch (error) {
      console.error('Error unregistering device:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to unregister device'
      });
    }
  }
);

// Get all notifications for the current user
router.get('/',
    authenticateUser,
  async (req, res): Promise<void> => {
    try {
      const userId = req.user!.userId;
      
      // Get pagination params
      // Get pagination params
      const page = parseInt(req.query.page as string || '1');
      const pageSize = parseInt(req.query.limit as string || '20');
      const skip = (page - 1) * pageSize;
      
      // Get total count for pagination
      const totalCount = await prisma.notification.count({
        where: { userId }
      });
      
      // Get notifications
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip
      });
      
      // Calculate unread count
      const unreadCount = await prisma.notification.count({
        where: {
          userId,
          isRead: false
        }
      });
      
      res.json({
        success: true,
        data: notifications,
        pagination: {
          total: totalCount,
          page,
          pageSize,
          pages: Math.ceil(totalCount / pageSize)
        },
        unreadCount
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications'
      });
    }
  }
);

// Mark notification as read
router.post('/:id/read',
  authenticateUser,
  [
    param('id').isUUID().withMessage('Valid notification ID is required')
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
        return;
      }
      
      const { id } = req.params;
      const userId = req.user!.userId;
      
      // Find the notification
      const notification = await prisma.notification.findFirst({
        where: {
          id,
          userId
        }
      });
      
      if (!notification) {
         res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }
      
      // Mark as read
      await prisma.notification.update({
        where: { id },
        data: { isRead: true }
      });
      
      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read'
      });
    }
  }
);

// Mark all notifications as read
router.post('/read-all',
  async (req, res): Promise<void> => {
    try {
      const userId = req.user!.userId;
      
      // Update all unread notifications
      // Update all unread notifications
      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false
        },
        data: {
          isRead: true
        }
      });
      
      res.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark all notifications as read'
      });
    }
  }
);
// Delete a notification
router.delete('/:id',
    authenticateUser,
    [
      param('id').isUUID().withMessage('Valid notification ID is required')
    ],
    async (req: Request, res: Response): Promise<void> => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400).json({ 
            success: false, 
            errors: errors.array() 
          });
          return;
        }
        const { id } = req.params;
        const userId = req.user!.userId;
        
        // Find and ensure ownership
        const notification = await prisma.notification.findFirst({
          where: {
            id,
            userId
          }
        });
        
        if (!notification) {
          res.status(404).json({
            success: false,
            message: 'Notification not found'
          });
          return; // Added missing return statement
        }
        
        // Delete the notification
        await prisma.notification.delete({
          where: { id }
        });
        
        res.json({
          success: true,
          message: 'Notification deleted successfully'
        });
      } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to delete notification'
        });
      }
    }
  );
  
  // Delete all read notifications
  router.delete('/clear-read', // Added missing router.delete
    authenticateUser, // Added missing middleware
    async (req: Request, res: Response): Promise<void> => {
      try {
        const userId = req.user!.userId;
              
        // Delete all read notifications
        const result = await prisma.notification.deleteMany({
          where: {
            userId,
            isRead: true
          }
        });
        
        res.json({
          success: true,
          message: `${result.count} read notifications deleted successfully`
        });
      } catch (error) {
        console.error('Error clearing read notifications:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to clear read notifications'
        });
      }
    }
  );
  
  // Get unread notifications count
  router.get('/unread-count', // Added missing router.get
    authenticateUser, // Added missing middleware
    async (req: Request, res: Response): Promise<void> => {
      try {
        const userId = req.user!.userId;
        
        // Count unread notifications
        const count = await prisma.notification.count({
          where: {
            userId,
            isRead: false
          }
        });
        
        res.json({
          success: true,
          count
        });
      } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to get unread notifications count'
        });
      }
    }
  );
// create test route test push notification, get test userid
router.get('/test-push-notification', 
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const userId = "59e572f2-2dbb-4e74-8a1e-0af47986ab7d";
      // const userId = 'test-user-id'; // Replace with actual test user ID
      const notificationPayload = {
        title: 'Test Notification',
        body: 'This is a test notification'
      };
      
      // Call the notification service to send the notification
      await notificationService.sendToUser(userId, notificationPayload, 'test');
      
      res.json({
        success: true,
        message: 'Test push notification sent successfully'
      });
    } catch (error) {
      console.error('Error sending test push notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send test push notification'
      });
    }
  }
);
export default router;