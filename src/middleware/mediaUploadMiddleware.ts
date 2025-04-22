import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';
import crypto from 'crypto';

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads/media';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // Generate a unique filename with original extension
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueId}${ext}`);
  },
});

// File filter for media files
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Log incoming file details
  console.log('Uploading file:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  });

  // Accept image, video, and audio files
  if (
    file.mimetype.startsWith('image/') || 
    file.mimetype.startsWith('video/') || 
    file.mimetype.startsWith('audio/') ||
    file.mimetype === 'application/octet-stream' // For generic binary data
  ) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`));
  }
};

// Create multer upload instance
export const mediaUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB file size limit
  },
}).single('file');

// Helper function to handle media upload with proper error handling
export const handleMediaUpload = (req: Request, res: Response): Promise<void> => {
  return new Promise((resolve, reject) => {
    mediaUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          reject(new Error('File size too large. Maximum size is 50MB'));
        } else {
          reject(new Error(`Upload error: ${err.message}`));
        }
      } else if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};