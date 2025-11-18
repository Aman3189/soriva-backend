// src/types/admin.types.ts
import { Request } from 'express';

/**
 * ==========================================
 * ADMIN TYPES - SORIVA V2
 * ==========================================
 * TypeScript interfaces and types for admin protection system
 * 
 * Phase 2 - Step 4: Admin Route Protection
 * Last Updated: November 18, 2025
 */

/**
 * Admin Protection Configuration
 */
export interface AdminProtectionConfig {
  enabled: boolean;
  allowedIPs: string[];
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  tokenSecret?: string;
  requireToken: boolean;
  auditLog: boolean;
}

/**
 * Admin Request Metadata
 */
export interface AdminRequestMeta {
  ip: string;
  userId?: string;
  action: string;
  timestamp: Date;
  endpoint: string;
  method: string;
  userAgent?: string;
}

/**
 * Extended Request interface with admin metadata
 */
export interface AdminRequest extends Request {
  adminMeta?: {
    ip: string;
    userId?: string;
    isAdmin: boolean;
    timestamp?: Date;
  };
}

/**
 * Admin Action Types
 */
export enum AdminAction {
  USER_CREATE = 'USER_CREATE',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',
  USER_BAN = 'USER_BAN',
  USER_UNBAN = 'USER_UNBAN',
  
  BILLING_OVERRIDE = 'BILLING_OVERRIDE',
  BILLING_REFUND = 'BILLING_REFUND',
  
  SYSTEM_CONFIG_UPDATE = 'SYSTEM_CONFIG_UPDATE',
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
  
  SECURITY_IP_ADD = 'SECURITY_IP_ADD',
  SECURITY_IP_REMOVE = 'SECURITY_IP_REMOVE',
  
  AUDIT_LOG_VIEW = 'AUDIT_LOG_VIEW',
  AUDIT_LOG_EXPORT = 'AUDIT_LOG_EXPORT',
}

/**
 * Admin Audit Log Entry
 */
export interface AdminAuditLog {
  id: string;
  action: AdminAction | string;
  adminId?: string;
  adminIP: string;
  endpoint: string;
  method: string;
  requestBody?: any;
  responseStatus?: number;
  success: boolean;
  duration?: number;
  timestamp: Date;
  userAgent?: string;
  metadata?: Record<string, any>;
}

/**
 * Admin Token Payload
 */
export interface AdminTokenPayload {
  adminId: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  iat?: number;
  exp?: number;
}

/**
 * Admin Response
 */
export interface AdminResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp?: Date;
}

/**
 * IP Allowlist Entry
 */
export interface IPAllowlistEntry {
  ip: string;
  label?: string;
  addedBy?: string;
  addedAt: Date;
  expiresAt?: Date;
  active: boolean;
}

/**
 * Admin Rate Limit Info
 */
export interface AdminRateLimitInfo {
  ip: string;
  endpoint: string;
  requestCount: number;
  windowStart: Date;
  windowEnd: Date;
  blocked: boolean;
}

/**
 * Admin Guard Options
 */
export interface AdminGuardOptions {
  requireToken?: boolean;
  requireAudit?: boolean;
  customRateLimit?: {
    windowMs: number;
    maxRequests: number;
  };
  allowedActions?: AdminAction[];
}

/**
 * Admin Permission
 */
export type AdminPermission =
  | 'user.read'
  | 'user.write'
  | 'user.delete'
  | 'billing.read'
  | 'billing.write'
  | 'billing.refund'
  | 'system.config'
  | 'system.maintenance'
  | 'security.manage'
  | 'audit.read'
  | 'audit.export'
  | 'admin.manage';

/**
 * Admin Role with Permissions
 */
export interface AdminRole {
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: AdminPermission[];
  description: string;
}

/**
 * Export all types
 */

