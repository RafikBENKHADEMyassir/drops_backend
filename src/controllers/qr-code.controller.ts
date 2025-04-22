import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import qrCodeGeneratorService from '../services/qr-code-generator.service';
// import mediaStorageService from '../services/media-storage.service';
// import { QrCodeData } from '../types/postal-drop.types';

const prisma = new PrismaClient();

interface CreateQRCodeRequest extends Request {
  params: {
    postalDropId: string;
  }
  body: {
    type: 'static' | 'dynamic';
    contentType: 'image' | 'video' | 'audio';
    contentUrl: string;
    thumbnailUrl?: string;
  }
  user: {
    userId: string;
  }
}

interface UpdateContentRequest extends Request {
  params: {
    id: string;
  }
  body: {
    contentUrl: string;
    contentType: 'image' | 'video' | 'audio';
    thumbnailUrl?: string;
  }
  user: {
    userId: string;
  }
}

/**
 * QR Code Controller
 */
class QRCodeController {
  /**
   * Create a new QR code for a postal drop
   */
  async createQRCode(req: CreateQRCodeRequest, res: Response) {
    try {
      const { postalDropId } = req.params;
      const { type, contentType, contentUrl, thumbnailUrl } = req.body;
      const userId = req.user.userId;
      
      // Verify ownership of the postal drop
      const postalDrop = await prisma.postalDrop.findUnique({
        where: { id: postalDropId },
        include: { qrCode: true }
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
      
      // Check if a QR code already exists
      if (postalDrop.qrCode) {
        return res.status(400).json({
          success: false,
          message: 'This postal drop already has a QR code'
        });
      }
      
      // Generate the QR code
      const qrCodeUrl = await qrCodeGeneratorService.generateQRCode(contentUrl, type);
      
      // Create the QR code record
      const qrCode = await prisma.qrCode.create({
        data: {
          postalDropId,
          type,
          contentType,
          contentUrl,
          thumbnailUrl,
          scanCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      return res.status(201).json({
        success: true,
        qrCode,
        qrCodeUrl
      });
    } catch (error: any) {
      console.error('Error creating QR code:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create QR code',
        error: error.message
      });
    }
  }
  
  /**
   * Update QR code content
   */
  async updateContent(req: UpdateContentRequest, res: Response) {
    try {
      const { id } = req.params;
      const { contentUrl, contentType, thumbnailUrl } = req.body;
      const userId = req.user.userId;
      
      // Find the QR code
      const qrCode = await prisma.qrCode.findUnique({
        where: { id },
        include: { postalDrop: true }
      });
      
      if (!qrCode) {
        return res.status(404).json({
          success: false,
          message: 'QR code not found'
        });
      }
      
      // Verify ownership via postal drop
      if (qrCode.postalDrop.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access to this QR code'
        });
      }
      
      // Verify QR code is dynamic
      if (qrCode.type !== 'dynamic') {
        return res.status(400).json({
          success: false,
          message: 'Cannot update content for static QR codes'
        });
      }
      
      // Update the QR code content
      const updatedQrCode = await prisma.qrCode.update({
        where: { id },
        data: {
          contentUrl,
          contentType,
          thumbnailUrl,
          updatedAt: new Date()
        }
      });
      
      return res.status(200).json({
        success: true,
        qrCode: updatedQrCode
      });
    } catch (error: any) {
      console.error('Error updating QR code content:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update QR code content',
        error: error.message
      });
    }
  }
  
  /**
   * Redirect to QR code content
   */
  async redirectToContent(req: Request, res: Response) {
    try {
      const { uniqueId } = req.params;
      
      // Find QR code by uniqueId
      // This would typically involve a lookup table mapping uniqueId to QR code ID
      // For simplicity, we'll assume uniqueId is the QR code ID in this example
      
      const qrCode = await prisma.qrCode.findUnique({
        where: { id: uniqueId }
      });
      
      if (!qrCode) {
        return res.status(404).json({
          success: false,
          message: 'QR code not found'
        });
      }
      
      // Update scan count and last scanned
      await prisma.qrCode.update({
        where: { id: uniqueId },
        data: {
          scanCount: { increment: 1 },
          lastScanned: new Date()
        }
      });
      
      // Redirect to the content URL
      return res.redirect(qrCode.contentUrl);
    } catch (error: any) {
      console.error('Error redirecting to content:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to redirect to content',
        error: error.message
      });
    }
  }
  
  /**
   * Get QR code by ID
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;
      
      const qrCode = await prisma.qrCode.findUnique({
        where: { id },
        include: { postalDrop: true }
      });
      
      if (!qrCode) {
        return res.status(404).json(
         'QR code not found'
        );
      }
      
      // Verify ownership via postal drop
      if (qrCode.postalDrop.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access to this QR code'
        });
      }
      
      return res.status(200).json({
        success: true,
        qrCode
      });
    } catch (error: any) {
      console.error('Error retrieving QR code:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve QR code',
        error: error.message
      });
    }
  }
}

export default new QRCodeController();