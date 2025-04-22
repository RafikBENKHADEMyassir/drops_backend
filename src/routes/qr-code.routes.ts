import express, { Request, Response } from 'express';
import qrCodeController from '../controllers/qr-code.controller';
import mediaStorageService from '../services/media-storage.service';
import { authenticateUser } from '..//middleware/authMiddleware';

const router = express.Router();

// Public routes
// Redirect to content when QR code is scanned
router.get('/redirect/:uniqueId', (req: Request, res: Response) => {
  qrCodeController.redirectToContent(req, res);
});
// Protected routes
router.use(authenticateUser);

// Create a new QR code for a postal drop
router.post('/:postalDropId', (req: Request, res: Response) => {
  // Type assertion to match the controller's expected type
  const enhancedReq = req as any;
  qrCodeController.createQRCode(enhancedReq, res);
});
// Update QR code content (only for dynamic QR codes)
router.put('/:id/content', (req: Request, res: Response) => {
  // Type assertion to match the controller's expected type
  const enhancedReq = req as any;
  qrCodeController.updateContent(enhancedReq, res);
});
// Get QR code by ID
router.get('/:id', (req: Request, res: Response) => {
  qrCodeController.getById(req, res);
});

// Upload media content for QR code
router.post('/upload', mediaStorageService.getUploadMiddleware(), async (req, res): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
      return;
    }

    const result = await mediaStorageService.processUploadedFile(req.file);
    
    res.status(200).json({
      success: true,
      media: result
    });
  } catch (error: any) {
    console.error('Error uploading media:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload media',
      error: error.message
    });
  }
});

export default router;