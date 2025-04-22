import express, { Request, Response } from 'express';
import { authenticateUser } from '../middleware/authMiddleware';
import mediaUploadController from '../controllers/mediaUploadController';

const router = express.Router();

// Protected routes - require authentication
router.use(authenticateUser);

// Upload media file
router.post('/media', (req: Request, res: Response) => {
  mediaUploadController.uploadMedia(req, res);
});

export default router;