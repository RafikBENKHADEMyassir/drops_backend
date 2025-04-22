import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Ensure QR code directory exists
const QR_CODE_DIR = path.join(__dirname, '../../public/qrcodes');
if (!fs.existsSync(QR_CODE_DIR)) {
  fs.mkdirSync(QR_CODE_DIR, { recursive: true });
}

/**
 * QR Code Generator Service
 */
class QRCodeGeneratorService {
  /**
   * Generate a QR code and save it to the file system
   * @param contentUrl - URL to the content
   * @param qrCodeType - Type of QR code (static/dynamic)
   * @returns Path to the generated QR code
   */
  async generateQRCode(contentUrl: string, qrCodeType: 'static' | 'dynamic' = 'static'): Promise<string> {
    try {
      // For dynamic QR codes, we create a redirect URL with a unique identifier
      // This allows us to update the contentUrl later without changing the QR code
      let qrContent: string;
      
      if (qrCodeType === 'dynamic') {
        const uniqueId = uuidv4();
        qrContent = `${process.env.APP_URL}/qr/${uniqueId}`;
        
        // Store the mapping between uniqueId and contentUrl in the database
        // This would be handled by the QR code controller
      } else {
        // For static QR codes, we directly encode the contentUrl
        qrContent = contentUrl;
      }

      // Generate QR code
      const qrCodeFilename = `${uuidv4()}.png`;
      const qrCodePath = path.join(QR_CODE_DIR, qrCodeFilename);

      // Generate QR code with good error correction level for better scanning
      await QRCode.toFile(qrCodePath, qrContent, {
        errorCorrectionLevel: 'H', // High
        margin: 1,
        width: 300,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return `/qrcodes/${qrCodeFilename}`;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }
  
  /**
   * Get the content URL for a given QR code ID
   * @param qrCodeId - ID of the QR code
   * @returns Content URL
   */
  async getContentUrl(qrCodeId: string): Promise<string> {
    try {
      const qrCode = await prisma.qrCode.findUnique({
        where: { id: qrCodeId }
      });
      
      if (!qrCode) {
        throw new Error('QR code not found');
      }
      
      // Update scan count
      await prisma.qrCode.update({
        where: { id: qrCodeId },
        data: {
          scanCount: { increment: 1 },
          lastScanned: new Date()
        }
      });
      
      return qrCode.contentUrl;
    } catch (error) {
      console.error('Error retrieving content URL:', error);
      throw error;
    }
  }
  
  /**
   * Update the content URL for a dynamic QR code
   * @param qrCodeId - ID of the QR code
   * @param newContentUrl - New content URL
   * @returns Updated QR code object
   */
  async updateContentUrl(qrCodeId: string, newContentUrl: string) {
    try {
      const qrCode = await prisma.qrCode.findUnique({
        where: { id: qrCodeId }
      });
      
      if (!qrCode) {
        throw new Error('QR code not found');
      }
      
      if (qrCode.type !== 'dynamic') {
        throw new Error('Cannot update content for static QR code');
      }
      
      const updatedQrCode = await prisma.qrCode.update({
        where: { id: qrCodeId },
        data: {
          contentUrl: newContentUrl,
          updatedAt: new Date()
        }
      });
      
      return updatedQrCode;
    } catch (error) {
      console.error('Error updating content URL:', error);
      throw error;
    }
  }
}

export default new QRCodeGeneratorService();