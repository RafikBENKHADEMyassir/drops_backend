import path from "path";
import express from 'express';
import { authenticateUser } from "src/middleware/authMiddleware";
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { Request, Response } from 'express';

const router = express.Router();
const prisma = new PrismaClient();
// Add the delete profile image endpoint
router.delete('/profile/image', authenticateUser, async (req: Request, res: Response): Promise<void> => {
    try {
      // Get current user
      const user = await prisma.user.findUnique({
        where: { id: req.user?.userId },
        select: {
          profile_image_url: true
        }
      });
  
      if (!user) {
        res.status(404).json({ message: 'User not found', success: false });
        return;}
  
      // Check if user has a profile image
      if (!user.profile_image_url) {
        res.status(400).json({ message: 'No profile image to delete', success: false });
        return;
      }
  
      // Path to the file on the server
      const profileImagePath = path.join(__dirname, '..', '..', 'public', user.profile_image_url);
  
      // Delete the file if it exists
      if (fs.existsSync(profileImagePath)) {
        fs.unlinkSync(profileImagePath);
      }
  
      // Update the user record to remove the profile image reference
      const updatedUser = await prisma.user.update({
        where: { id: req.user?.userId },
        data: {
          profile_image_url: null,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          name: true,
          firstName: true,
          lastName: true,
          profile_image_url: true,
          phone: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          createdAt: true,
          updatedAt: true,
        }
      });
  
      const response = {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          firstName: updatedUser.firstName || undefined,
          lastName: updatedUser.lastName || undefined,
          profileImageUrl: updatedUser.profile_image_url || undefined,
          phone: updatedUser.phone || undefined,
          isProfileComplete: Boolean(updatedUser.name && updatedUser.email),
          isEmailVerified: updatedUser.isEmailVerified,
          isPhoneVerified: updatedUser.isPhoneVerified,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        },
        success: true,
      };
  
      res.json(response);
    } catch (error) {
      console.error('Error deleting profile image:', error);
      res.status(500).json({ message: 'Server error', success: false });
    }
  });