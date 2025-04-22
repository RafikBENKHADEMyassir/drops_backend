import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
// import {  CardDesign, Address } from '../types/postal-drop.types';

const prisma = new PrismaClient();

// Define interfaces for request bodies
// interface CreateDraftRequest extends Request {
//   body: {
//     cardType: string;
//   }
//   user: {
//     userId: string;
//   }
// }

// interface UpdateDesignRequest extends Request {
//   params: {
//     id: string;
//   }
//   body: {
//     side: 'front' | 'back';
//     design: CardDesign;
//   }
//   user: {
//     userId: string;
//   }
// }

// interface UpdateAddressRequest extends Request {
//   params: {
//     id: string;
//   }
//   body: {
//     type: 'recipient' | 'sender';
//     address: Address;
//   }
//   user: {
//     userId: string;
//   }
// }

// interface UpdateMessageRequest extends Request {
//   params: {
//     id: string;
//   }
//   body: {
//     personalMessage: string;
//   }
//   user: {
//     userId: string;
//   }
// }

/**
 * Postal Drop Controller
 */
class PostalDropController {
  /**
   * Create a new postal drop draft
   */
  async createDraft(req: Request, res: Response) {
    try {
      // const { cardType } = req.body;
      const userId = req.user!.userId;
      
      // Create a new postal drop with draft status
      const postalDrop = await prisma.postalDrop.create({
        data: {
          userId,
          status: 'draft',
          cardType:'square',//cardType,
          frontDesign: {},
          backDesign: {},
          recipientAddress: {},
          senderAddress: {},
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      res.status(201).json(
        postalDrop
      );
    } catch (error: any) {
      console.error('Error creating postal drop draft:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create postal drop draft',
        error: error.message
      });
    }
  }
  
  /**
   * Get a postal drop by ID
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;
      
      const postalDrop = await prisma.postalDrop.findUnique({
        where: { id },
        include: {
          qrCode: true,
          order: true
        }
      });
      
      if (!postalDrop) {
        return res.status(404).json(
           'Postal drop not found'
        );
      }
      
      // Verify ownership
      if (postalDrop.userId !== userId) {
        return res.status(403).json(
          'Unauthorized access to this postal drop'
        );
      }
      
      return res.status(200).json(
        postalDrop
      );
    } catch (error: any) {
      console.error('Error retrieving postal drop:', error);
      return res.status(500).json(
         'Failed to retrieve postal drop',
      );
    }
  }
  
  /**
   * Update a postal drop design
   */
  async updateDesign(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { side, design } = req.body;
      const userId = req.user!.userId;
      
      // Verify ownership
      const postalDrop = await prisma.postalDrop.findUnique({
        where: { id }
      });
      
      if (!postalDrop) {
        return res.status(404).json({
          success: false,
          message: 'Postal drop not found'
        });
      }
      
      if (postalDrop.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access to this postal drop'
        });
      }
      
      // Update the appropriate side design
      let updateData: any = {};
      if (side === 'front') {
        updateData.frontDesign = design;
      } else if (side === 'back') {
        updateData.backDesign = design;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid side specified'
        });
      }
      
      // Update the postal drop
      const updatedPostalDrop = await prisma.postalDrop.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date()
        }
      });
      
      return res.status(200).json({
        success: true,
        postalDrop: updatedPostalDrop
      });
    } catch (error: any) {
      console.error('Error updating postal drop design:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update postal drop design',
        error: error.message
      });
    }
  }
  
  /**
   * Update a postal drop address
   */
  async updateAddress(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { type, address } = req.body;
      const userId = req.user!.userId;
      
      // Verify ownership
      const postalDrop = await prisma.postalDrop.findUnique({
        where: { id }
      });
      
      if (!postalDrop) {
        return res.status(404).json({
          success: false,
          message: 'Postal drop not found'
        });
      }
      
      if (postalDrop.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access to this postal drop'
        });
      }
      
      // Update the appropriate address
      let updateData: any = {};
      if (type === 'recipient') {
        updateData.recipientAddress = address;
      } else if (type === 'sender') {
        updateData.senderAddress = address;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid address type specified'
        });
      }
      
      // Update the postal drop
      const updatedPostalDrop = await prisma.postalDrop.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date()
        }
      });
      
      return res.status(200).json({
        success: true,
        postalDrop: updatedPostalDrop
      });
    } catch (error: any) {
      console.error('Error updating postal drop address:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update postal drop address',
        error: error.message
      });
    }
  }
  
  /**
   * Update personal message
   */
  async updateMessage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { personalMessage } = req.body;
      const userId = req.user!.userId;
      
      // Verify ownership
      const postalDrop = await prisma.postalDrop.findUnique({
        where: { id }
      });
      
      if (!postalDrop) {
        return res.status(404).json({
          success: false,
          message: 'Postal drop not found'
        });
      }
      
      if (postalDrop.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access to this postal drop'
        });
      }
      
      // Update the personal message
      const updatedPostalDrop = await prisma.postalDrop.update({
        where: { id },
        data: {
          personalMessage,
          updatedAt: new Date()
        }
      });
      
      return res.status(200).json({
        success: true,
        postalDrop: updatedPostalDrop
      });
    } catch (error: any) {
      console.error('Error updating personal message:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update personal message',
        error: error.message
      });
    }
  }
  
  /**
   * Get all postal drops for a user
   */
  async getUserPostalDrops(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      
      const postalDrops = await prisma.postalDrop.findMany({
        where: { userId },
        include: {
          qrCode: true,
          order: true
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });
      
      // res.status(200).json({
      //   success: true,
      //   postalDrops
      // });
      res.status(200).json(
        postalDrops
      );
    } catch (error: any) {
      console.error('Error retrieving user postal drops:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve postal drops',
        error: error.message
      });
    }
  }
  
  /**
   * Delete a postal drop
   */
  async deletePostalDrop(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;
      
      // Verify ownership
      const postalDrop = await prisma.postalDrop.findUnique({
        where: { id },
        include: {
          qrCode: true
        }
      });
      
      if (!postalDrop) {
        return res.status(404).json({
          success: false,
          message: 'Postal drop not found'
        });
      }
      
      if (postalDrop.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access to this postal drop'
        });
      }
      
      // Only allow deletion of drafts
      if (postalDrop.status !== 'draft') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete a postal drop that has been ordered'
        });
      }
      
      // Delete related QR code if exists
      if (postalDrop.qrCode) {
        await prisma.qrCode.delete({
          where: { postalDropId: id }
        });
      }
      
      // Delete the postal drop
      await prisma.postalDrop.delete({
        where: { id }
      });
      
      return res.status(200).json({
        success: true,
        message: 'Postal drop successfully deleted'
      });
    } catch (error: any) {
      console.error('Error deleting postal drop:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete postal drop',
        error: error.message
      });
    }
  }
}

export default new PostalDropController();