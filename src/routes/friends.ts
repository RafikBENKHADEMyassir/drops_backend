
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { authenticateUser } from "../middleware/authMiddleware";
import notificationService from '../services/notificationService';

const router = express.Router();
const prisma = new PrismaClient();


 // ✅ Get Friends
// ✅ Get Friends (excluding blocked users)
router.get('/', authenticateUser, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
  
      // Fetch friends excluding blocked users
      const friends = await prisma.friend.findMany({
        where: {
          userId,
          friendId: {
            notIn: [
              // Exclude users blocked by the current user
              ...(await prisma.blockedUser.findMany({
                where: { userId },
                select: { blockedId: true },
              })).map((blocked) => blocked.blockedId),
  
              // Exclude users who have blocked the current user
              ...(await prisma.blockedUser.findMany({
                where: { blockedId: userId },
                select: { userId: true },
              })).map((blocker) => blocker.userId),
            ],
          },
        },
      });
  
      // Fetch details for each friend
      const friendsWithDetails = await Promise.all(
        friends.map(async (friend) => {
          const friendDetails = await prisma.user.findUnique({
            where: { id: friend.friendId },
            select: { name: true, profile_image_url: true },
          });
          return {
            ...friend,
            profile_image_url: friendDetails?.profile_image_url,
            name: friendDetails?.name,
          };
        })
      );
  
      res.json(friendsWithDetails);
    } catch (error) {
      console.error('Error fetching friends:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // ✅ Get Friend Requests
  router.get('/requests', authenticateUser, async (req: Request, res: Response) => {
    try {
      const friendRequests = await prisma.friendRequest.findMany({
        where: { recipientId: req.user?.userId },
      });
      console.log('Friend Requests:', friendRequests.length,req.user?.userId);
      // for each friend request, add the sender_profile_image_url and sender_name 
        const friendRequestsWithSenderDetails = await Promise.all(
            friendRequests.map(async (request) => {
            const sender = await prisma.user.findUnique({
                where: { id: request.senderId },
                select: {  name: true, profile_image_url: true },
            });
            return { ...request, sender_profile_image_url: sender?.profile_image_url, sender_name: sender?.name };
            })
        );
      res.json(friendRequestsWithSenderDetails);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // ✅ Get Blocked Users
  router.get('/blocked', authenticateUser, async (req: Request, res: Response) => {
    try {
      const blockedUsers = await prisma.blockedUser.findMany({
        where: { userId: req.user?.userId },
        include: {
          blocked: {
            select: {
              id: true,
              name: true,
              profile_image_url: true,
            },
          },
        },
      });
  
      // Format the response to flatten the blocked user details
      const blockedUsersWithDetails = blockedUsers.map((blockedUser) => ({
        id: blockedUser.blocked?.id,
        name: blockedUser.blocked?.name,
        profile_image_url: blockedUser.blocked?.profile_image_url,
        createdAt: blockedUser.createdAt,
      }));
  
      res.json(blockedUsersWithDetails);
    } catch (error) {
      console.error("Error fetching blocked users:", error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // ✅ Search Users
  router.get('/search', authenticateUser, async (req: Request, res: Response)=> {
    const { q } = req.query;
    const authUserId = req.user?.userId;
    if (!q || typeof q !== 'string') {
       res.status(400).json({ message: 'Query parameter is required' });
    }
  
    try {
      // Find all users blocked by or who blocked the requester
      const blockedRelations = await prisma.blockedUser.findMany({
        where: {
          OR: [
            { userId: authUserId },
            { blockedId: authUserId },
          ],
        },
      });
  
      const blockedUserIds = new Set<string>();
      for (const relation of blockedRelations) {
        if (relation.userId === authUserId) {
          blockedUserIds.add(relation.blockedId);
        } else {
          blockedUserIds.add(relation.userId);
        }
      }
  
      const users = await prisma.user.findMany({
        where: {
          AND: [
            { id: { not: authUserId } }, // Exclude requester
            { id: { notIn: Array.from(blockedUserIds) } }, // Exclude blocked users
            {
              OR: [
                { name: { contains: q as string, mode: 'insensitive' } },
                { email: { contains: q as string, mode: 'insensitive' } },
              ],
            },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          profile_image_url: true,
          friends: {
            where: { friendId: authUserId },
          },
          friendOf: {
            where: { userId: authUserId },
          },
          sentRequests: {
            where: { recipientId: authUserId },
          },
          receivedRequests: {
            where: { senderId: authUserId },
          },
        },
      });
  
      const result = users.map(user => {
        const isFriend = user.friends.length > 0 || user.friendOf.length > 0;
        const hasPendingRequest = user.sentRequests.length > 0 || user.receivedRequests.length > 0;
  
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          profileImageUrl: user.profile_image_url,
          isFriend,
          hasPendingRequest,
        };
      });
  
      res.status(200).json(result);
    } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // ✅ Send Friend Invite
  router.post('/invite', authenticateUser, async (req: Request, res: Response): Promise<void> => {
    const { recipientId } = req.body;
  
    if (!recipientId) {
      console.error('Recipient ID is required',req.body);
      res.status(400).json({ message: 'Recipient ID is required' });
      return;
    }
  
    try {
      // Check if the recipient exists
      const recipient = await prisma.user.findUnique({
        where: { id: recipientId },
      });
  
      if (!recipient) {
        res.status(404).json({ message: 'Recipient not found' });
        return;
      }
  
      // Check if a friend request already exists
      const existingRequest = await prisma.friendRequest.findFirst({
        where: {
          senderId: req.user?.userId,
          recipientId,
        },
      });
  
      if (existingRequest) {
        res.status(400).json({ message: 'Friend request already sent' });
        return;
      }
  
      // Create the friend request
      const friendRequest = await prisma.friendRequest.create({
        data: {
          senderId: req.user?.userId!,
          recipientId,
          status: 'pending',
        },
      });
      // const sender = await prisma.user.findUnique({
      //   where: { id: req.user?.userId! },
      //   select: {
      //     name: true,
      //     firstName: true,
      //     profile_image_url: true
      //   }
      // });

      setTimeout(async () => {
        try {
          await notificationService.sendFriendRequestNotification(
            friendRequest.id,
            req.user?.userId!,
            recipientId
          );
        } catch (notifError) {
          console.error('Error sending friend request notification:', notifError);
        }
      }, 0);

      res.status(201).json({ message: 'Friend request sent', friendRequest });
    } catch (error) {
      console.error('Error sending friend invite:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // ✅ Block a User
router.post('/block', authenticateUser, async (req: Request, res: Response): Promise<void> => {
    const { blockedId } = req.body;
    if (!blockedId) {
      res.status(400).json({ message: 'Blocked user ID is required' });
      return;
    }
  
    try {
      // Check if the user is already blocked
      const existingBlock = await prisma.blockedUser.findFirst({
        where: {
          userId: req.user?.userId,
          blockedId,
        },
      });
  
      if (existingBlock) {
        res.status(400).json({ message: 'User is already blocked' });
        return;
      }
  
      // Block the user
      const blockedUser = await prisma.blockedUser.create({
        data: {
          userId: req.user?.userId!,
          blockedId,
        },
      });
  
      res.status(201).json({ message: 'User blocked successfully', blockedUser });
    } catch (error) {
      console.error('Error blocking user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // ✅ Unblock a User
  router.post('/unblock', authenticateUser, async (req: Request, res: Response): Promise<void> => {
    const { blockedId } = req.body;
  
    if (!blockedId) {
      res.status(400).json({ message: 'Blocked user ID is required' });
      return;
    }
  
    try {
      // Unblock the user
      const unblockResult = await prisma.blockedUser.deleteMany({
        where: {
          userId: req.user?.userId,
          blockedId,
        },
      });
  
      if (unblockResult.count === 0) {
        res.status(404).json({ message: 'User is not blocked' });
        return;
      }
  
      res.status(200).json({ message: 'User unblocked successfully' });
    } catch (error) {
      console.error('Error unblocking user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // ✅ Unfriend a User
  router.post('/unfriend', authenticateUser, async (req: Request, res: Response): Promise<void> => {
    const { friendId } = req.body;
  
    if (!friendId) {
      res.status(400).json({ message: 'Friend ID is required' });
      return;
    }
  
    try {
      // Remove the friendship
      const unfriendResult = await prisma.friend.deleteMany({
        where: {
          OR: [
            { userId: req.user?.userId, friendId },
            { userId: friendId, friendId: req.user?.userId },
          ],
        },
      });
  
      if (unfriendResult.count === 0) {
        res.status(404).json({ message: 'Friendship not found' });
        return;
      }
  
      res.status(200).json({ message: 'Unfriended successfully' });
    } catch (error) {
      console.error('Error unfriending user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // ✅ Accept Friend Request
  router.post('/requests/accept', authenticateUser, async (req: Request, res: Response): Promise<void> => {
    const { requestId } = req.body;
  
    if (!requestId) {
      res.status(400).json({ message: 'Request ID is required' });
      return;
    }
  
    try {
      // Find the friend request
      const friendRequest = await prisma.friendRequest.findUnique({
        where: { id: requestId },
      });
  
      if (!friendRequest || friendRequest.recipientId !== req.user?.userId) {
        res.status(404).json({ message: 'Friend request not found' });
        return;
      }
      const [recipient, sender] = await Promise.all([
        prisma.user.findUnique({
          where: { id: req.user?.userId },
          select: { name: true, firstName: true, profile_image_url: true }
        }),
        prisma.user.findUnique({
          where: { id: friendRequest.senderId },
          select: { id: true, name: true, profile_image_url: true }
        })
      ]);
      if (!sender) {
        res.status(404).json({ message: 'Sender not found' });
        return;
      }
      // Create a friendship
      await prisma.friend.createMany({
        data: [
          { userId: friendRequest.senderId, friendId: friendRequest.recipientId },
          { userId: friendRequest.recipientId, friendId: friendRequest.senderId },
        ],
      });
  
      // Delete the friend request
      await prisma.friendRequest.delete({
        where: { id: requestId },
      });
  
      // Send notification to friend request sender
      const recipientName = recipient?.name || recipient?.firstName || 'Someone';
  
      setTimeout(async () => {
        try {
          await notificationService.sendToUser(
            friendRequest.senderId,
            {
              title: 'Friend Request Accepted',
              body: `${recipientName} accepted your friend request`,
              data: {
                // friendId: req.user?.userId,
                action: 'viewProfile'
              }
            },
            'friendRequestAccepted'
          );
        } catch (notifError) {
          console.error('Error sending friend request acceptance notification:', notifError);
        }
      }, 0);
  
      res.status(200).json({ message: 'Friend request accepted' });
    } catch (error) {
      console.error('Error accepting friend request:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // ✅ Delete Friend Request
  router.post('/requests/delete', authenticateUser, async (req: Request, res: Response): Promise<void> => {
    const { requestId } = req.body;
  
    if (!requestId) {
      res.status(400).json({ message: 'Request ID is required' });
      return;
    }
  
    try {
      // Delete the friend request
      const deleteResult = await prisma.friendRequest.deleteMany({
        where: {
          id: requestId,
          OR: [
            { senderId: req.user?.userId },
            { recipientId: req.user?.userId },
          ],
        },
      });
  
      if (deleteResult.count === 0) {
        res.status(404).json({ message: 'Friend request not found' });
        return;
      }
  
      res.status(200).json({ message: 'Friend request deleted' });
    } catch (error) {
      console.error('Error deleting friend request:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  export default router;