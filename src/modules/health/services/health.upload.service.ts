// ============================================
// SORIVA HEALTH - UPLOAD SERVICE
// Path: src/modules/health/services/health.upload.service.ts
// ============================================
// Cloudinary upload + Gemini Vision OCR
// ============================================

import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Readable } from 'stream';

// pdf-parse CommonJS require
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface UploadResult {
  success: boolean;
  fileUrl?: string;
  publicId?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  pageCount?: number;
  extractedText?: string;
  error?: string;
}

export interface FileInput {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CLOUDINARY CONFIG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Configure Cloudinary (if not already configured globally)
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEALTH UPLOAD SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class HealthUploadService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    // Initialize Gemini for OCR
    if (process.env.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
  }

  // ═══════════════════════════════════════════════════════
  // MAIN UPLOAD METHOD
  // ═══════════════════════════════════════════════════════

  /**
   * Upload health report file and extract text
   */
  async uploadHealthReport(
    file: FileInput,
    userId: string
  ): Promise<UploadResult> {
    try {
      // Validate file
      const validationError = this.validateFile(file);
      if (validationError) {
        return { success: false, error: validationError };
      }

      // Check Cloudinary config
      if (!process.env.CLOUDINARY_CLOUD_NAME) {
        return { success: false, error: 'Cloudinary not configured' };
      }

      // Upload to Cloudinary
      const uploadResult = await this.uploadToCloudinary(file, userId);
      if (!uploadResult.success) {
        return uploadResult;
      }

      // Get page count (for PDFs)
      let pageCount = 1;
      if (file.mimetype === 'application/pdf') {
        pageCount = await this.getPDFPageCount(file.buffer);
      }

      // Extract text using Gemini Vision OCR
      let extractedText: string | undefined;
      if (uploadResult.fileUrl) {
        extractedText = await this.extractTextWithGemini(
          uploadResult.fileUrl,
          file.mimetype
        );
      }

      return {
        success: true,
        fileUrl: uploadResult.fileUrl,
        publicId: uploadResult.publicId,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        pageCount,
        extractedText,
      };
    } catch (error: any) {
      console.error('Health Upload Error:', error);
      return {
        success: false,
        error: error.message || 'Upload failed',
      };
    }
  }

  // ═══════════════════════════════════════════════════════
  // CLOUDINARY UPLOAD
  // ═══════════════════════════════════════════════════════

  /**
   * Upload file to Cloudinary
   */
  private async uploadToCloudinary(
    file: FileInput,
    userId: string
  ): Promise<UploadResult> {
    return new Promise((resolve) => {
      // Create unique filename
      const timestamp = Date.now();
      const sanitizedName = file.originalname
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .substring(0, 50);
      
      const publicId = `health/${userId}/${timestamp}_${sanitizedName}`;

      // Determine resource type
      const resourceType = file.mimetype === 'application/pdf' ? 'raw' : 'image';

      // Upload stream
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          resource_type: resourceType,
          folder: 'soriva-health',
          access_mode: 'authenticated', // Private access
          type: 'authenticated',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            resolve({
              success: false,
              error: 'Failed to upload file to storage',
            });
          } else if (result) {
            resolve({
              success: true,
              fileUrl: result.secure_url,
              publicId: result.public_id,
            });
          } else {
            resolve({
              success: false,
              error: 'Unknown upload error',
            });
          }
        }
      );

      // Pipe buffer to upload stream
      const readable = new Readable();
      readable.push(file.buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }

  // ═══════════════════════════════════════════════════════
  // GEMINI VISION OCR
  // ═══════════════════════════════════════════════════════

  /**
   * Extract text from image/PDF using Gemini Vision
   */
  private async extractTextWithGemini(
    fileUrl: string,
    mimeType: string
  ): Promise<string | undefined> {
    if (!this.genAI) {
      console.warn('Gemini not configured, skipping OCR');
      return undefined;
    }

    try {
      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-lite' 
      });

      // For PDFs, we need to handle differently
      // Gemini can process images directly via URL
      if (mimeType === 'application/pdf') {
        // For PDFs, we'll use a text extraction prompt
        // Note: Gemini 1.5+ can handle PDFs directly
        const result = await model.generateContent([
          {
            fileData: {
              fileUri: fileUrl,
              mimeType: mimeType,
            },
          },
          {
            text: `Extract ALL text from this medical report document. 
            
Instructions:
- Extract every piece of text visible in the document
- Maintain the structure (headers, values, units)
- Include all test names, values, reference ranges
- Include patient information if visible
- Include lab name, date, doctor name if visible
- Do NOT summarize or interpret - just extract the raw text
- If text is unclear, indicate with [unclear]

Output the extracted text:`,
          },
        ]);

        const response = result.response;
        return response.text();
      } else {
        // For images (JPG, PNG, etc.)
        const result = await model.generateContent([
          {
            fileData: {
              fileUri: fileUrl,
              mimeType: mimeType,
            },
          },
          {
            text: `Extract ALL text from this medical report image.
            
Instructions:
- Extract every piece of text visible in the image
- Maintain the structure (headers, values, units)
- Include all test names, values, reference ranges
- Include patient information if visible
- Include lab name, date, doctor name if visible
- Do NOT summarize or interpret - just extract the raw text
- If text is unclear, indicate with [unclear]

Output the extracted text:`,
          },
        ]);

        const response = result.response;
        return response.text();
      }
    } catch (error: any) {
      console.error('Gemini OCR Error:', error);
      
      // Don't fail the upload if OCR fails
      // User can still view the file
      return undefined;
    }
  }

  /**
   * Alternative: Extract text using base64 (for when URL doesn't work)
   */
  async extractTextFromBuffer(
    buffer: Buffer,
    mimeType: string
  ): Promise<string | undefined> {
    if (!this.genAI) {
      return undefined;
    }

    try {
      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-lite' 
      });

      const base64Data = buffer.toString('base64');

      const result = await model.generateContent([
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        {
          text: `Extract ALL text from this medical report.
          
Instructions:
- Extract every piece of text visible
- Maintain the structure (headers, values, units)
- Include all test names, values, reference ranges
- Do NOT summarize or interpret - just extract the raw text

Output the extracted text:`,
        },
      ]);

      const response = result.response;
      return response.text();
    } catch (error: any) {
      console.error('Gemini OCR (base64) Error:', error);
      return undefined;
    }
  }

  // ═══════════════════════════════════════════════════════
  // PDF UTILITIES
  // ═══════════════════════════════════════════════════════

  /**
   * Get page count from PDF
   */
  private async getPDFPageCount(buffer: Buffer): Promise<number> {
    try {
      const data = await pdfParse(buffer);
      return data.numpages || 1;
    } catch (error) {
      console.error('PDF page count error:', error);
      return 1; // Default to 1 if can't determine
    }
  }

  /**
   * Extract text from PDF using pdf-parse (fallback)
   */
  async extractTextFromPDF(buffer: Buffer): Promise<string | undefined> {
    try {
      const data = await pdfParse(buffer);
      return data.text || undefined;
    } catch (error) {
      console.error('PDF text extraction error:', error);
      return undefined;
    }
  }

  // ═══════════════════════════════════════════════════════
  // VALIDATION
  // ═══════════════════════════════════════════════════════

  /**
   * Validate uploaded file
   */
  private validateFile(file: FileInput): string | null {
    // Check file exists
    if (!file || !file.buffer) {
      return 'No file provided';
    }

    // Check file size (max 20MB)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      return 'File size exceeds 20MB limit';
    }

    // Check mime type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return 'Invalid file type. Allowed: PDF, JPG, PNG, WebP';
    }

    return null;
  }

  // ═══════════════════════════════════════════════════════
  // DELETE FILE
  // ═══════════════════════════════════════════════════════

  /**
   * Delete file from Cloudinary
   */
  async deleteFile(publicId: string, resourceType: 'image' | 'raw' = 'image'): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
        type: 'authenticated',
      });
      return result.result === 'ok';
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════
  // SIGNED URL (For private access)
  // ═══════════════════════════════════════════════════════

  /**
   * Generate signed URL for private file access
   */
  generateSignedUrl(publicId: string, expiresInSeconds: number = 3600): string {
    return cloudinary.url(publicId, {
      sign_url: true,
      type: 'authenticated',
      expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
    });
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SINGLETON EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const healthUploadService = new HealthUploadService();