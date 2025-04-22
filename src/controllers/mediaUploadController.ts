import { Request, Response } from 'express';
import path from 'path';
import { handleMediaUpload } from '../middleware/mediaUploadMiddleware';
import sharp from 'sharp';

class MediaController {
  /**
   * Upload media file
   */
  async uploadMedia(req: Request, res: Response): Promise<void> {
    try {
      // Handle file upload
      await handleMediaUpload(req, res);
      
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
        return;
      }
      
      const { filename, mimetype, size, path: filePath } = req.file;
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const fileUrl = `${baseUrl}/uploads/media/${filename}`;
      
      // Generate thumbnail for images
      let thumbnailUrl = fileUrl;
      if (mimetype.startsWith('image/')) {
        const thumbFilename = `thumb_${filename}`;
        const thumbPath = path.join('uploads/media', thumbFilename);
        
        try {
          await sharp(filePath)
            .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
            .toFile(thumbPath);
            
          thumbnailUrl = `${baseUrl}/uploads/media/${thumbFilename}`;
        } catch (error) {
          console.error('Error generating thumbnail:', error);
          // On error, use original as thumbnail
        }
      }
      
      // For video, we'd ideally generate a video thumbnail
      // This would require ffmpeg, but for simplicity we're skipping that
      
      res.status(201).json({
        success: true,
        url: fileUrl,
        thumbnailUrl: thumbnailUrl,
        filename: filename,
        originalFilename: req.file.originalname,
        contentType: mimetype,
        fileSize: size,
        createdAt: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Error uploading media:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload media'
      });
    }
  }
}

export default new MediaController();