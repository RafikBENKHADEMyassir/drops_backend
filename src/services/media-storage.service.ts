import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { Request } from 'express';

// Configure media directories
const MEDIA_DIR = path.join(__dirname, '../../public/media');
const IMAGE_DIR = path.join(MEDIA_DIR, 'images');
const VIDEO_DIR = path.join(MEDIA_DIR, 'videos');
const AUDIO_DIR = path.join(MEDIA_DIR, 'audio');
const THUMBNAIL_DIR = path.join(MEDIA_DIR, 'thumbnails');

// Ensure directories exist
[MEDIA_DIR, IMAGE_DIR, VIDEO_DIR, AUDIO_DIR, THUMBNAIL_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Define file interfaces
interface MediaFile {
  originalUrl: string;
  thumbnailUrl: string | null;
  contentType: 'image' | 'video' | 'audio';
  mimeType: string;
  size: number;
}

// Configure storage
const storage = multer.diskStorage({
  destination: (_req: Request, file: Express.Multer.File, cb) => {
    let destDir = IMAGE_DIR;
    
    if (file.mimetype.startsWith('video/')) {
      destDir = VIDEO_DIR;
    } else if (file.mimetype.startsWith('audio/')) {
      destDir = AUDIO_DIR;
    }
    
    cb(null, destDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    cb(null, fileName);
  }
});

// Configure upload middleware
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb) => {
    // Check file types
    const allowedMimeTypes = [
      'image/jpeg', 'image/png', 'image/gif',
      'video/mp4', 'video/quicktime',
      'audio/mpeg', 'audio/mp3', 'audio/wav'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, MP4, QuickTime, MP3, and WAV are allowed.') as any);
      return;
    }
  }
});

/**
 * Media Storage Service
 */
class MediaStorageService {
  /**
   * Get multer upload middleware
   */
  getUploadMiddleware() {
    return upload.single('media');
  }
  
  /**
   * Process uploaded image
   * @param file - Uploaded file object
   */
  async processImage(file: Express.Multer.File): Promise<MediaFile> {
    try {
      // Generate a thumbnail
      const thumbnailFilename = `thumb_${path.basename(file.filename)}`;
      const thumbnailPath = path.join(THUMBNAIL_DIR, thumbnailFilename);
      
      await sharp(file.path)
        .resize(300, 300, { fit: 'inside' })
        .toFile(thumbnailPath);
      
      return {
        originalUrl: `/media/images/${file.filename}`,
        thumbnailUrl: `/media/thumbnails/${thumbnailFilename}`,
        contentType: 'image',
        mimeType: file.mimetype,
        size: file.size
      };
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error('Failed to process image');
    }
  }
  
  /**
   * Process uploaded video
   * @param file - Uploaded file object
   */
  async processVideo(file: Express.Multer.File): Promise<MediaFile> {
    try {
      return new Promise((resolve, _reject) => {
        const thumbnailFilename = `thumb_${path.parse(file.filename).name}.jpg`;
        // const thumbnailPath = path.join(THUMBNAIL_DIR, thumbnailFilename);
        
        // Generate thumbnail from video
        ffmpeg(file.path)
          .screenshots({
            timestamps: ['00:00:01'],
            filename: thumbnailFilename,
            folder: THUMBNAIL_DIR,
            size: '320x240'
          })
          .on('end', () => {
            resolve({
              originalUrl: `/media/videos/${file.filename}`,
              thumbnailUrl: `/media/thumbnails/${thumbnailFilename}`,
              contentType: 'video',
              mimeType: file.mimetype,
              size: file.size
            });
          })
          .on('error', (err) => {
            console.error('Error generating video thumbnail:', err);
            // Still return info even without thumbnail
            resolve({
              originalUrl: `/media/videos/${file.filename}`,
              thumbnailUrl: null,
              contentType: 'video',
              mimeType: file.mimetype,
              size: file.size
            });
          });
      });
    } catch (error) {
      console.error('Error processing video:', error);
      throw new Error('Failed to process video');
    }
  }
  
  /**
   * Process uploaded audio
   * @param file - Uploaded file object
   */
  async processAudio(file: Express.Multer.File): Promise<MediaFile> {
    try {
      // For audio, we just use a default audio thumbnail
      return {
        originalUrl: `/media/audio/${file.filename}`,
        thumbnailUrl: `/media/thumbnails/default_audio.png`, // You'd need to create this default thumbnail
        contentType: 'audio',
        mimeType: file.mimetype,
        size: file.size
      };
    } catch (error) {
      console.error('Error processing audio:', error);
      throw new Error('Failed to process audio');
    }
  }
  
  /**
   * Process uploaded file based on its type
   * @param file - Uploaded file object
   */
  async processUploadedFile(file: Express.Multer.File | undefined): Promise<MediaFile> {
    if (!file) {
      throw new Error('No file uploaded');
    }
    
    if (file.mimetype.startsWith('image/')) {
      return this.processImage(file);
    } else if (file.mimetype.startsWith('video/')) {
      return this.processVideo(file);
    } else if (file.mimetype.startsWith('audio/')) {
      return this.processAudio(file);
    } else {
      throw new Error('Unsupported file type');
    }
  }
  
  /**
   * Delete media files
   * @param fileUrl - URL of the file to delete
   * @param thumbnailUrl - URL of the thumbnail to delete
   */
  async deleteMedia(fileUrl: string | null, thumbnailUrl: string | null): Promise<void> {
    try {
      if (fileUrl) {
        const filePath = path.join(__dirname, '../../public', fileUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      if (thumbnailUrl && !thumbnailUrl.includes('default_audio.png')) {
        const thumbnailPath = path.join(__dirname, '../../public', thumbnailUrl);
        if (fs.existsSync(thumbnailPath)) {
          fs.unlinkSync(thumbnailPath);
        }
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      throw new Error('Failed to delete media files');
    }
  }
}

export default new MediaStorageService();