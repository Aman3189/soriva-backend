// src/config/logger.config.ts
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { logger as customLogger } from '../shared/utils/logger'; // ✅ FIXED PATH

/**
 * ==========================================
 * FILE ROTATION CONFIGURATION - SORIVA V2
 * ==========================================
 * Adds Winston Daily Rotate to existing custom logger
 * 
 * ARCHITECTURE:
 * - Console logs: Custom Logger (colors, features) ✅
 * - File logs: Winston Daily Rotate (persistent) ✅
 * 
 * Phase 2 - Step 3: Log Rotation
 * Last Updated: November 18, 2025
 */

/**
 * File Rotation Manager - Extends existing logger
 */
class FileRotationManager {
  private isDevelopment: boolean;
  private logDirectory: string;
  private fileLogger: winston.Logger;

  constructor(isDevelopment: boolean = false) {
    this.isDevelopment = isDevelopment;
    this.logDirectory = path.join(process.cwd(), 'logs');
    this.fileLogger = this.createFileLogger();
  }

  /**
   * Custom log format for files (JSON + readable)
   */
  private getFileFormat() {
    return winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const log = {
          timestamp,
          level: level.toUpperCase(),
          message,
          ...meta,
        };
        return JSON.stringify(log);
      })
    );
  }

  /**
   * Combined logs transport (INFO and above)
   */
  private getCombinedTransport(): DailyRotateFile {
    return new DailyRotateFile({
      filename: path.join(this.logDirectory, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true, // Compress old logs (.gz)
      maxSize: '20m', // 20MB max per file
      maxFiles: '14d', // Keep 14 days
      format: this.getFileFormat(),
      level: 'info',
    });
  }

  /**
   * Error logs transport (ERROR only)
   */
  private getErrorTransport(): DailyRotateFile {
    return new DailyRotateFile({
      filename: path.join(this.logDirectory, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d', // Keep errors for 30 days
      format: this.getFileFormat(),
      level: 'error',
    });
  }

  /**
   * Create Winston file logger (no console - handled by custom logger)
   */
  private createFileLogger(): winston.Logger {
    // Only enable file rotation in production
    if (this.isDevelopment) {
      // Return dummy logger for development (file rotation disabled)
      return winston.createLogger({
        silent: true, // Don't log anything in dev
      });
    }

    // Production: Enable file rotation
    return winston.createLogger({
      level: 'info',
      format: this.getFileFormat(),
      transports: [
        this.getCombinedTransport(),
        this.getErrorTransport(),
      ],
      exitOnError: false,
    });
  }

  /**
   * Log to file (called after custom logger)
   */
  public logToFile(level: string, message: string, meta?: any): void {
    if (!this.isDevelopment) {
      this.fileLogger.log(level, message, meta);
    }
  }

  /**
   * Get Winston instance for direct access (if needed)
   */
  public getWinstonLogger(): winston.Logger {
    return this.fileLogger;
  }
}

/**
 * Singleton instance
 */
const isDev = process.env.NODE_ENV === 'development';
const fileRotationManager = new FileRotationManager(isDev);

/**
 * Enhanced Logger - Combines custom logger + file rotation
 */
export class EnhancedLogger {
  /**
   * Info log (console + file)
   */
  public static info(message: string, context?: any): void {
    customLogger.info(message, context);
    fileRotationManager.logToFile('info', message, context);
  }

  /**
   * Error log (console + file)
   */
  public static error(message: string, error?: Error | any, context?: any): void {
    customLogger.error(message, error, context);
    fileRotationManager.logToFile('error', message, {
      error: error?.message || error,
      stack: error?.stack,
      ...context,
    });
  }

  /**
   * Warning log (console + file)
   */
  public static warn(message: string, context?: any): void {
    customLogger.warn(message, context);
    fileRotationManager.logToFile('warn', message, context);
  }

  /**
   * Debug log (console only - not saved to file)
   */
  public static debug(message: string, context?: any): void {
    customLogger.debug(message, context);
  }

  /**
   * Success log (console + file)
   */
  public static success(message: string, context?: any): void {
    customLogger.success(message, context);
    fileRotationManager.logToFile('info', `✓ ${message}`, context);
  }

  /**
   * Fail log (console + file)
   */
  public static fail(message: string, error?: Error, context?: any): void {
    customLogger.fail(message, error, context);
    fileRotationManager.logToFile('error', `✗ ${message}`, {
      error: error?.message || error,
      stack: error?.stack,
      ...context,
    });
  }

  /**
   * Pass-through methods (console only)
   */
  public static section(title: string): void {
    customLogger.section(title);
  }

  public static table(data: any): void {
    customLogger.table(data);
  }

  public static json(data: any): void {
    customLogger.json(data);
  }

  public static timer(label: string): () => void {
    return customLogger.timer(label);
  }

  public static async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
    return customLogger.measure(label, fn);
  }

  /**
   * Direct access to custom logger (if needed)
   */
  public static get custom() {
    return customLogger;
  }

  /**
   * Direct access to file rotation manager (if needed)
   */
  public static get files() {
    return fileRotationManager;
  }
}

/**
 * Export default enhanced logger
 */
export default EnhancedLogger;

/**
 * Export file rotation manager for advanced usage
 */
export { fileRotationManager };