// src/modules/chat/file.manager.ts
import { v2 as cloudinary } from 'cloudinary';

/**
 * Simple File Interface (Phase 1 - Basic)
 */
interface UploadedFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

/**
 * File Manager
 * Handles file uploads (images, PDFs) for chat
 */
export class FileManager {
  private maxImageSize = 5 * 1024 * 1024; // 5 MB
  private maxPdfSize = 10 * 1024 * 1024; // 10 MB

  private allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  private allowedPdfTypes = ['application/pdf'];

  constructor() {
    // Configure Cloudinary (if env vars exist)
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
    }
  }

  /**
   * Validate file type and size
   */
  validateFile(file: UploadedFile, type: 'image' | 'pdf'): { valid: boolean; error?: string } {
    // Check file type
    const allowedTypes = type === 'image' ? this.allowedImageTypes : this.allowedPdfTypes;
    if (!allowedTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
      };
    }

    // Check file size
    const maxSize = type === 'image' ? this.maxImageSize : this.maxPdfSize;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File too large. Max size: ${maxSize / (1024 * 1024)} MB`,
      };
    }

    return { valid: true };
  }

  /**
   * Upload image to Cloudinary
   */
  async uploadImage(
    file: UploadedFile
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Validate
      const validation = this.validateFile(file, 'image');
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Check if Cloudinary configured
      if (!process.env.CLOUDINARY_CLOUD_NAME) {
        return {
          success: false,
          error: 'Cloudinary not configured. Please add CLOUDINARY_* env variables.',
        };
      }

      // Upload to Cloudinary
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'soriva/chat-images',
            resource_type: 'image',
            transformation: [
              { width: 1920, height: 1080, crop: 'limit' },
              { quality: 'auto' },
              { fetch_format: 'auto' },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(file.buffer);
      });

      return {
        success: true,
        url: result.secure_url,
      };
    } catch (error: any) {
      console.error('Upload image error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload image',
      };
    }
  }

  /**
   * Upload PDF to Cloudinary
   */
  async uploadPDF(file: UploadedFile): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Validate
      const validation = this.validateFile(file, 'pdf');
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Check if Cloudinary configured
      if (!process.env.CLOUDINARY_CLOUD_NAME) {
        return {
          success: false,
          error: 'Cloudinary not configured. Please add CLOUDINARY_* env variables.',
        };
      }

      // Upload to Cloudinary
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'soriva/chat-pdfs',
            resource_type: 'raw',
            format: 'pdf',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(file.buffer);
      });

      return {
        success: true,
        url: result.secure_url,
      };
    } catch (error: any) {
      console.error('Upload PDF error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload PDF',
      };
    }
  }

  /**
   * Upload any file (auto-detect type)
   */
  async uploadFile(
    file: UploadedFile
  ): Promise<{ success: boolean; url?: string; type?: string; error?: string }> {
    try {
      // Detect file type
      if (this.allowedImageTypes.includes(file.mimetype)) {
        const result = await this.uploadImage(file);
        return { ...result, type: 'image' };
      } else if (this.allowedPdfTypes.includes(file.mimetype)) {
        const result = await this.uploadPDF(file);
        return { ...result, type: 'pdf' };
      } else {
        return {
          success: false,
          error: 'Unsupported file type. Only images and PDFs allowed.',
        };
      }
    } catch (error: any) {
      console.error('Upload file error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload file',
      };
    }
  }

  /**
   * Extract text from PDF (Phase 2 feature)
   */
  async extractTextFromPDF(
    fileUrl: string
  ): Promise<{ success: boolean; text?: string; error?: string }> {
    try {
      // Phase 1: Placeholder
      return {
        success: true,
        text: `[PDF uploaded: ${fileUrl}]\nText extraction coming in Phase 2.`,
      };
    } catch (error: any) {
      console.error('Extract PDF text error:', error);
      return {
        success: false,
        error: error.message || 'Failed to extract text',
      };
    }
  }

  /**
   * Get file info
   */
  getFileInfo(file: UploadedFile) {
    return {
      name: file.originalname,
      size: file.size,
      sizeReadable: `${(file.size / 1024).toFixed(2)} KB`,
      type: file.mimetype,
      isImage: this.allowedImageTypes.includes(file.mimetype),
      isPDF: this.allowedPdfTypes.includes(file.mimetype),
    };
  }
}
