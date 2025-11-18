// src/services/audit-log.service.ts
import { PrismaClient } from '@prisma/client';

/**
 * ==========================================
 * AUDIT LOG SERVICE - SORIVA V2
 * ==========================================
 * Class-based audit logging service
 * Tracks security-critical events
 * Matches existing backend architecture
 * Last Updated: November 18, 2025
 */

/**
 * Audit event types enum
 */
export enum AuditEventType {
  // Authentication
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  REGISTER_SUCCESS = 'REGISTER_SUCCESS',
  REGISTER_FAILURE = 'REGISTER_FAILURE',
  LOGOUT = 'LOGOUT',

  // OAuth
  OAUTH_GOOGLE_SUCCESS = 'OAUTH_GOOGLE_SUCCESS',
  OAUTH_GOOGLE_FAILURE = 'OAUTH_GOOGLE_FAILURE',
  OAUTH_GITHUB_SUCCESS = 'OAUTH_GITHUB_SUCCESS',
  OAUTH_GITHUB_FAILURE = 'OAUTH_GITHUB_FAILURE',

  // Security
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // Critical
  PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_SUCCESS = 'PASSWORD_RESET_SUCCESS',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  REGION_UPDATE = 'REGION_UPDATE',

  // Admin
  ADMIN_ACCESS = 'ADMIN_ACCESS',
  USER_DATA_EXPORT = 'USER_DATA_EXPORT',
}

/**
 * Audit log entry interface
 */
export interface AuditLogEntry {
  eventType: AuditEventType;
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  message?: string;
  metadata?: Record<string, any>;
}

/**
 * Audit Log Service - Class-based implementation
 */
export class AuditLogService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Log an audit event
   */
  public async log(entry: AuditLogEntry): Promise<void> {
    try {
      this.logToConsole(entry);
      // TODO: Store in database after creating AuditLog model in Prisma schema
      // await this.storeInDatabase(entry);
    } catch (error) {
      console.error('❌ Failed to log audit event:', error);
      // Don't throw - logging failure shouldn't break the app
    }
  }

  /**
   * Log authentication success
   */
  public async logAuthSuccess(
    userId: string,
    email: string,
    method: 'email' | 'google' | 'github',
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const eventType =
      method === 'email'
        ? AuditEventType.LOGIN_SUCCESS
        : method === 'google'
        ? AuditEventType.OAUTH_GOOGLE_SUCCESS
        : AuditEventType.OAUTH_GITHUB_SUCCESS;

    await this.log({
      eventType,
      userId,
      email,
      ipAddress,
      userAgent,
      success: true,
      message: `User logged in successfully via ${method}`,
      metadata: { method },
    });
  }

  /**
   * Log authentication failure
   */
  public async logAuthFailure(
    email: string,
    method: 'email' | 'google' | 'github',
    reason: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const eventType =
      method === 'email'
        ? AuditEventType.LOGIN_FAILURE
        : method === 'google'
        ? AuditEventType.OAUTH_GOOGLE_FAILURE
        : AuditEventType.OAUTH_GITHUB_FAILURE;

    await this.log({
      eventType,
      email,
      ipAddress,
      userAgent,
      success: false,
      message: `Login failed: ${reason}`,
      metadata: { method, reason },
    });
  }

  /**
   * Log registration success
   */
  public async logRegistrationSuccess(
    userId: string,
    email: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      eventType: AuditEventType.REGISTER_SUCCESS,
      userId,
      email,
      ipAddress,
      userAgent,
      success: true,
      message: 'User registered successfully',
    });
  }

  /**
   * Log rate limit violation
   */
  public async logRateLimitExceeded(
    path: string,
    ipAddress?: string,
    userId?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      eventType: AuditEventType.RATE_LIMIT_EXCEEDED,
      userId,
      ipAddress,
      userAgent,
      success: false,
      message: `Rate limit exceeded on ${path}`,
      metadata: { path },
    });
  }

  /**
   * Log unauthorized access attempt
   */
  public async logUnauthorizedAccess(
    path: string,
    reason: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      eventType: AuditEventType.UNAUTHORIZED_ACCESS,
      ipAddress,
      userAgent,
      success: false,
      message: `Unauthorized access attempt: ${reason}`,
      metadata: { path, reason },
    });
  }

  /**
   * Log to console with formatting
   */
  private logToConsole(entry: AuditLogEntry): void {
    const timestamp = new Date().toISOString();
    const icon = entry.success ? '✅' : '❌';
    const color = entry.success ? '\x1b[32m' : '\x1b[31m'; // Green or Red
    const reset = '\x1b[0m';

    console.log(
      `${icon} ${color}[AUDIT]${reset} ${timestamp} | ${entry.eventType} | ${
        entry.email || entry.userId || 'Unknown'
      } | ${entry.ipAddress || 'Unknown IP'}`
    );

    if (entry.message) {
      console.log(`   └─ ${entry.message}`);
    }

    if (entry.metadata) {
      console.log(`   └─ Metadata:`, JSON.stringify(entry.metadata));
    }
  }

  /**
   * Store audit log in database
   * TODO: Implement after creating AuditLog Prisma model
   */
  private async storeInDatabase(entry: AuditLogEntry): Promise<void> {
    // Uncomment after creating AuditLog model in schema.prisma
    /*
    await this.prisma.auditLog.create({
      data: {
        eventType: entry.eventType,
        userId: entry.userId,
        email: entry.email,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        success: entry.success,
        message: entry.message,
        metadata: entry.metadata,
        createdAt: new Date(),
      },
    });
    */
  }

  /**
   * Get recent audit logs (for admin dashboard)
   * TODO: Implement after creating AuditLog model
   */
  public async getRecentLogs(limit: number = 100): Promise<any[]> {
    return [];
  }

  /**
   * Get logs for specific user
   * TODO: Implement after creating AuditLog model
   */
  public async getUserLogs(userId: string, limit: number = 50): Promise<any[]> {
    return [];
  }
}

/**
 * Export singleton instance
 */
export const auditLogService = new AuditLogService();

/**
 * Export class for advanced usage
 */
export default AuditLogService;