// ============================================
// SORIVA HEALTH - CLOUDINARY SERVICE
// Path: src/modules/health/services/cloudinary.service.ts
// Purpose: File upload, delete, transform for health reports
// ============================================

import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { CLOUDINARY_FOLDERS } from '../health.constants';
import { HealthError, HEALTH_ERROR_CODES } from '../health.types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CLOUDINARY CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  resourceType: string;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  publicId?: string;
  resourceType?: 'image' | 'raw' | 'auto';
  transformation?: any[];
  tags?: string[];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CLOUDINARY SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class CloudinaryService {
  /**
   * Upload file buffer to Cloudinary
   */
  async uploadBuffer(
    buffer: Buffer,
    options: CloudinaryUploadOptions = {}
  ): Promise<CloudinaryUploadResult> {
    try {
      const folder = options.folder || CLOUDINARY_FOLDERS.REPORTS;

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            public_id: options.publicId,
            resource_type: options.resourceType || 'auto',
            transformation: options.transformation,
            tags: options.tags,
          },
          (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            if (error) {
              console.error('[Cloudinary] Upload error:', error);
              reject(
                new HealthError(
                  'Failed to upload file',
                  HEALTH_ERROR_CODES.UPLOAD_FAILED,
                  500
                )
              );
              return;
            }

            if (!result) {
              reject(
                new HealthError(
                  'No upload result received',
                  HEALTH_ERROR_CODES.UPLOAD_FAILED,
                  500
                )
              );
              return;
            }

            console.log(`[Cloudinary] Upload success: ${result.public_id}`);

            resolve({
              url: result.url,
              secureUrl: result.secure_url,
              publicId: result.public_id,
              format: result.format,
              width: result.width,
              height: result.height,
              bytes: result.bytes,
              resourceType: result.resource_type,
            });
          }
        );

        uploadStream.end(buffer);
      });
    } catch (error) {
      console.error('[Cloudinary] Upload failed:', error);
      throw new HealthError(
        'Failed to upload file to cloud storage',
        HEALTH_ERROR_CODES.UPLOAD_FAILED,
        500
      );
    }
  }

  /**
   * Upload health report (image or PDF)
   */
  async uploadReport(
    buffer: Buffer,
    userId: string,
    fileName: string
  ): Promise<CloudinaryUploadResult> {
    const timestamp = Date.now();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    const publicId = `${userId}_${timestamp}_${sanitizedName}`;

    return this.uploadBuffer(buffer, {
      folder: CLOUDINARY_FOLDERS.REPORTS,
      publicId,
      resourceType: 'auto',
      tags: ['health-report', userId],
    });
  }

  /**
   * Upload doctor summary PDF
   */
  async uploadSummaryPDF(
    buffer: Buffer,
    userId: string,
    reportId: string
  ): Promise<CloudinaryUploadResult> {
    const timestamp = Date.now();
    const publicId = `summary_${userId}_${reportId}_${timestamp}`;

    return this.uploadBuffer(buffer, {
      folder: CLOUDINARY_FOLDERS.SUMMARIES,
      publicId,
      resourceType: 'raw',
      tags: ['health-summary', userId],
    });
  }

  /**
   * Delete file from Cloudinary
   */
  async delete(publicId: string, resourceType: string = 'image'): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });

      console.log(`[Cloudinary] Delete result for ${publicId}:`, result);

      return result.result === 'ok';
    } catch (error) {
      console.error('[Cloudinary] Delete failed:', error);
      return false;
    }
  }

  /**
   * Delete multiple files
   */
  async deleteMultiple(publicIds: string[], resourceType: string = 'image'): Promise<void> {
    try {
      await cloudinary.api.delete_resources(publicIds, {
        resource_type: resourceType,
      });

      console.log(`[Cloudinary] Deleted ${publicIds.length} files`);
    } catch (error) {
      console.error('[Cloudinary] Bulk delete failed:', error);
    }
  }

  /**
   * Get optimized URL for image
   */
  getOptimizedUrl(publicId: string, options: { width?: number; height?: number; quality?: number } = {}): string {
    return cloudinary.url(publicId, {
      width: options.width || 800,
      height: options.height,
      crop: 'limit',
      quality: options.quality || 'auto',
      fetch_format: 'auto',
      secure: true,
    });
  }

  /**
   * Get thumbnail URL
   */
  getThumbnailUrl(publicId: string, size: number = 200): string {
    return cloudinary.url(publicId, {
      width: size,
      height: size,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto',
      secure: true,
    });
  }

  /**
   * Check if Cloudinary is configured
   */
  isConfigured(): boolean {
    return !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.isConfigured()) {
        console.warn('[Cloudinary] Not configured');
        return false;
      }

      await cloudinary.api.ping();
      return true;
    } catch (error) {
      console.error('[Cloudinary] Health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const cloudinaryService = new CloudinaryService();