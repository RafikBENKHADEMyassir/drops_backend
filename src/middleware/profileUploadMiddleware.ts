import multer from 'multer';
import path from 'path';
import { Request, Response } from 'express';
import sharp from 'sharp';
import fs from 'fs';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);

// Ensure thumbnail directory exists
const ensureThumbnailDir = async () => {
  const thumbsDir = 'uploads/profiles/thumbs';
  if (!(await exists(thumbsDir))) {
    await mkdir(thumbsDir, { recursive: true });
  }
  return thumbsDir;
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/profiles/');
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    // Get extension from original file or default to .jpg
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `profile-${uniqueSuffix}${ext}`);
  },
});

// Improved image file filter with more flexible MIME type checking
const imageFileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Same as before...
  console.log('Incoming file details:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    encoding: file.encoding,
    mimetype: file.mimetype,
    size: file.size
  });

  // List of allowed MIME types
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/heic',
    'image/heif',
    'application/octet-stream' // Allow generic binary data
  ];

  // Check file extension as fallback
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'];
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) || validExtensions.includes(fileExt)) {
    console.log('File accepted:', file.originalname);
    cb(null, true);
  } else {
    console.log('File rejected:', file.originalname, 'MIME:', file.mimetype);
    cb(new Error(`Invalid file type. Allowed extensions: ${validExtensions.join(', ')}`));
  }
};

// Profile upload middleware with better error handling
export const profileUpload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
}).single('profileImage');

// Helper function to generate thumbnail
const generateThumbnail = async (filePath: string, filename: string): Promise<string> => {
  const thumbsDir = await ensureThumbnailDir();
  const thumbnailPath = path.join(thumbsDir, filename);
  
  await sharp(filePath)
    .resize(150, 150, { fit: 'cover' })
    .jpeg({ quality: 80 })
    .toFile(thumbnailPath);
  
  return path.join('uploads/profiles/thumbs', filename);
};

// Helper function to handle multer upload with proper error handling
export const handleProfileUpload = (req: Request, res: Response): Promise<{ filePath?: string, thumbnailPath?: string }> => {
  return new Promise((resolve, reject) => {
    profileUpload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        // Multer-specific errors
        if (err.code === 'LIMIT_FILE_SIZE') {
          reject(new Error('File size too large. Maximum size is 5MB'));
        } else {
          reject(new Error(`Upload error: ${err.message}`));
        }
      } else if (err) {
        // Other errors
        reject(err);
      } else {
        try {
          // If file was uploaded successfully, generate thumbnail
          if (req.file) {
            const filePath = req.file.path;
            const filename = path.basename(filePath);
            const thumbnailPath = await generateThumbnail(filePath, filename);
            
            resolve({ 
              filePath: `/uploads/profiles/${filename}`,
              thumbnailPath: `/uploads/profiles/thumbs/${filename}`
            });
          } else {
            resolve({});
          }
        } catch (thumbError) {
          console.error('Error generating thumbnail:', thumbError);
          // Still resolve with the original file even if thumbnail generation fails
          if (req.file) {
            const filename = path.basename(req.file.path);
            resolve({ 
              filePath: `/uploads/profiles/${filename}`
            });
          } else {
            resolve({});
          }
        }
      }
    });
  });
};