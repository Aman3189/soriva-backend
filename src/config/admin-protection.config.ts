// src/config/admin-protection.config.ts

/**
 * ==========================================
 * ADMIN PROTECTION CONFIGURATION - SORIVA V2
 * ==========================================
 * IP allowlist, rate limiting, and security for admin routes
 * 
 * SECURITY LAYERS:
 * 1. IP Allowlist (only trusted IPs)
 * 2. Admin-specific rate limiting (10 req/hour)
 * 3. Token validation (optional - can add 2FA later)
 * 4. Audit logging (all admin actions tracked)
 * 
 * Phase 2 - Step 4: Admin Route Protection
 * Last Updated: November 18, 2025
 */

/**
 * Admin Protection Configuration Interface
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
}

/**
 * Admin Protection Manager - Class-based implementation
 */
class AdminProtectionManager {
  private isDevelopment: boolean;
  private config: AdminProtectionConfig;

  constructor(isDevelopment: boolean = false) {
    this.isDevelopment = isDevelopment;
    this.config = this.initializeConfig();
  }

  /**
   * Initialize configuration from environment variables
   */
  private initializeConfig(): AdminProtectionConfig {
    // Development: Relaxed protection for testing
    if (this.isDevelopment) {
      return {
        enabled: true,
        allowedIPs: this.parseAllowedIPs() || ['127.0.0.1', '::1', 'localhost'],
        rateLimit: {
          windowMs: 60 * 60 * 1000, // 1 hour
          maxRequests: 100, // Relaxed for development
        },
        requireToken: false, // Optional in dev
        auditLog: true,
      };
    }

    // Production: Strict protection
    return {
      enabled: true,
      allowedIPs: this.parseAllowedIPs() || ['127.0.0.1'], // Restrictive default
      rateLimit: {
        windowMs: parseInt(process.env.ADMIN_RATE_LIMIT_WINDOW || '3600000'), // 1 hour
        maxRequests: parseInt(process.env.ADMIN_RATE_LIMIT_MAX || '10'), // 10 req/hour
      },
      tokenSecret: process.env.ADMIN_TOKEN_SECRET,
      requireToken: process.env.ADMIN_REQUIRE_TOKEN === 'true',
      auditLog: true,
    };
  }

  /**
   * Parse allowed IPs from environment variable
   * Format: ADMIN_ALLOWED_IPS=127.0.0.1,::1,192.168.1.100
   */
  private parseAllowedIPs(): string[] | null {
    const envIPs = process.env.ADMIN_ALLOWED_IPS;

    if (!envIPs) {
      return null;
    }

    return envIPs
      .split(',')
      .map((ip) => ip.trim())
      .filter((ip) => ip.length > 0);
  }

  /**
   * Normalize IP address (handle IPv6, proxies, etc.)
   */
  public normalizeIP(ip: string): string {
    // Remove IPv6 prefix if present
    if (ip.startsWith('::ffff:')) {
      return ip.substring(7);
    }

    // Convert localhost variations
    if (ip === '::1') {
      return 'localhost';
    }

    return ip;
  }

  /**
   * Check if IP is in allowlist
   */
  public isIPAllowed(ip: string): boolean {
    if (!this.config.enabled) {
      return true; // Protection disabled
    }

    const normalizedIP = this.normalizeIP(ip);

    // Check against allowlist
    return this.config.allowedIPs.some((allowedIP) => {
      const normalizedAllowed = this.normalizeIP(allowedIP);
      return normalizedIP === normalizedAllowed || normalizedAllowed === 'localhost';
    });
  }

  /**
   * Validate admin token (simple implementation - can enhance with JWT later)
   */
  public validateToken(token?: string): boolean {
    // If token not required, allow
    if (!this.config.requireToken) {
      return true;
    }

    // If no token provided but required, deny
    if (!token) {
      return false;
    }

    // If no secret configured, deny (misconfiguration)
    if (!this.config.tokenSecret) {
      console.error('ADMIN_TOKEN_SECRET not configured but token required!');
      return false;
    }

    // Simple token validation (enhance with JWT in future)
    return token === this.config.tokenSecret;
  }

  /**
   * Get rate limit configuration for admin routes
   */
  public getRateLimitConfig() {
    return this.config.rateLimit;
  }

  /**
   * Get full configuration
   */
  public getConfig(): AdminProtectionConfig {
    return { ...this.config };
  }

  /**
   * Check if protection is enabled
   */
  public isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Add IP to allowlist dynamically (use with caution)
   */
  public addAllowedIP(ip: string): void {
    const normalizedIP = this.normalizeIP(ip);
    if (!this.config.allowedIPs.includes(normalizedIP)) {
      this.config.allowedIPs.push(normalizedIP);
      console.log(`[ADMIN PROTECTION] Added IP to allowlist: ${normalizedIP}`);
    }
  }

  /**
   * Remove IP from allowlist dynamically (use with caution)
   */
  public removeAllowedIP(ip: string): void {
    const normalizedIP = this.normalizeIP(ip);
    const index = this.config.allowedIPs.indexOf(normalizedIP);
    if (index > -1) {
      this.config.allowedIPs.splice(index, 1);
      console.log(`[ADMIN PROTECTION] Removed IP from allowlist: ${normalizedIP}`);
    }
  }

  /**
   * Get allowed IPs list (for debugging)
   */
  public getAllowedIPs(): string[] {
    return [...this.config.allowedIPs];
  }

  /**
   * Create audit log entry metadata
   */
  public createAuditMeta(
    ip: string,
    action: string,
    endpoint: string,
    method: string,
    userId?: string
  ): AdminRequestMeta {
    return {
      ip: this.normalizeIP(ip),
      userId,
      action,
      timestamp: new Date(),
      endpoint,
      method,
    };
  }
}

/**
 * Singleton instances for different environments
 */
const isDev = process.env.NODE_ENV === 'development';
const developmentAdminProtection = new AdminProtectionManager(true);
const productionAdminProtection = new AdminProtectionManager(false);

/**
 * Get appropriate configuration based on NODE_ENV
 */
export const getAdminProtection = (isDevelopment: boolean = isDev) => {
  return isDevelopment ? developmentAdminProtection : productionAdminProtection;
};

/**
 * Export manager class for advanced usage
 */
export default AdminProtectionManager;

/*
 * Export current active instance
 */
export const adminProtection = getAdminProtection();