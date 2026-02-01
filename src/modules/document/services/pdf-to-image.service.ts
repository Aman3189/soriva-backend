// src/modules/document/services/pdf-to-image.service.ts

/**
 * SORIVA PDF TO IMAGE SERVICE
 * Using pdf2pic for reliable Node.js PDF conversion
 */

import { fromBuffer } from 'pdf2pic';
import { logger } from '@shared/utils/logger';
import fs from 'fs';
import path from 'path';
import os from 'os';

export interface PDFToImageOptions {
  dpi?: number;
  maxPages?: number;
  format?: 'png' | 'jpeg';
  quality?: number;
}

export interface ConvertedPage {
  pageNumber: number;
  imageBuffer: Buffer;
  width: number;
  height: number;
}

export interface ConversionResult {
  success: boolean;
  pages: ConvertedPage[];
  totalPages: number;
  error?: string;
}

class PDFToImageService {
  private static instance: PDFToImageService;
  private readonly DEFAULT_DPI = 200;
  private readonly DEFAULT_MAX_PAGES = 20;

  private constructor() {
    logger.info('[PDF2Image] Service initialized');
  }

  public static getInstance(): PDFToImageService {
    if (!PDFToImageService.instance) {
      PDFToImageService.instance = new PDFToImageService();
    }
    return PDFToImageService.instance;
  }

  public async convertPDFToImages(
    pdfBuffer: Buffer,
    options: PDFToImageOptions = {}
  ): Promise<ConversionResult> {
    const {
      dpi = this.DEFAULT_DPI,
      maxPages = this.DEFAULT_MAX_PAGES,
      format = 'png',
    } = options;

    try {
      const converter = fromBuffer(pdfBuffer, {
        density: dpi,
        format: format,
        width: 1600,
        height: 2200,
        saveFilename: 'page',
        savePath: os.tmpdir(),
      });

      const pages: ConvertedPage[] = [];

      // Convert pages
      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        try {
          const result = await converter(pageNum, { responseType: 'buffer' });
          
          if (result && result.buffer) {
           pages.push({
                pageNumber: pageNum,
                imageBuffer: result.buffer as Buffer,
                width: 1600,
                height: 2200,
                });
            logger.info(`[PDF2Image] Page ${pageNum} converted`);
          } else {
            // No more pages
            break;
          }
        } catch (pageError: any) {
          // If page doesn't exist, we're done
          if (pageError.message?.includes('Invalid page') || 
              pageError.message?.includes('page number')) {
            break;
          }
          logger.error(`[PDF2Image] Page ${pageNum} error:`, pageError);
          break;
        }
      }

      return {
        success: pages.length > 0,
        pages,
        totalPages: pages.length,
      };

    } catch (error) {
      const message = error instanceof Error ? error.message : 'PDF conversion failed';
      logger.error('[PDF2Image] Conversion failed:', error);
      return {
        success: false,
        pages: [],
        totalPages: 0,
        error: message,
      };
    }
  }

  public async convertSinglePage(
    pdfBuffer: Buffer,
    pageNumber: number = 1,
    options: PDFToImageOptions = {}
  ): Promise<ConvertedPage | null> {
    const result = await this.convertPDFToImages(pdfBuffer, {
      ...options,
      maxPages: pageNumber,
    });
    return result.pages[pageNumber - 1] || null;
  }

  public async getPDFInfo(pdfBuffer: Buffer): Promise<{
    pageCount: number;
    isEncrypted: boolean;
  } | null> {
    try {
      const result = await this.convertPDFToImages(pdfBuffer, { maxPages: 100 });
      return {
        pageCount: result.totalPages,
        isEncrypted: false,
      };
    } catch {
      return null;
    }
  }
}

export const pdfToImageService = PDFToImageService.getInstance();
export default pdfToImageService;