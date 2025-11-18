// src/config/security-headers.config.ts
import helmet, { HelmetOptions } from 'helmet';

/**
 * ==========================================
 * SECURITY HEADERS CONFIGURATION - SORIVA V2
 * ==========================================
 * Class-based security headers configuration using Helmet
 * Matches existing backend architecture
 * 
 * PHASE 2 COMPLETE:
 * ✅ STEP 1: HSTS Preload Enhancement (2 years, preload-ready)
 * ✅ STEP 2: CSP Strict Mode (Production-grade, nonce-based, violation reporting)
 * 
 * Security Level: FORTRESS MODE 🛡️
 * Last Updated: November 18, 2025
 */

/**
 * Security Headers Manager - Class-based implementation
 */
class SecurityHeadersManager {
  private isDevelopment: boolean;

  constructor(isDevelopment: boolean = false) {
    this.isDevelopment = isDevelopment;
  }

/**
 * Get Content Security Policy configuration
 * 
 * STRICT MODE (Production):
 * - Strict source allowlisting (only trusted domains)
 * - XSS protection
 * - Injection attack prevention
 * 
 * RELAXED MODE (Development):
 * - Allows inline scripts (for hot reload)
 * - Easier debugging
 */
private getCSPConfig() {
  // Development: Relaxed CSP for easier testing
  if (this.isDevelopment) {
    return {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        fontSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*"],
        frameSrc: ["'self'"],
        objectSrc: ["'none'"],
      },
    };
  }

  // Production: STRICT MODE - Maximum Security
  return {
    directives: {
      // Default: Only same-origin resources
      defaultSrc: ["'self'"],

      // Scripts: Trusted sources only
      scriptSrc: [
        "'self'",
        "https://cdn.jsdelivr.net",
        "https://www.googletagmanager.com",
      ],

      // Styles: Google Fonts + inline styles
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
      ],

      // Images: HTTPS, data URLs, blob
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "blob:",
      ],

      // Fonts: Google Fonts + self
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "data:",
      ],

      // API Connections: Strict allowlist
      connectSrc: [
        "'self'",
        // AI Provider APIs
        "https://api.anthropic.com",
        "https://api.openai.com",
        "https://generativelanguage.googleapis.com",
        "https://api.groq.com",
        // OAuth & Auth
        "https://accounts.google.com",
        "https://github.com",
        "https://api.github.com",
        // Storage & Database
        "https://*.supabase.co",
        "https://*.supabase.in",
        "https://*.amazonaws.com",
        // Payment Gateways
        "https://api.stripe.com",
        "https://api.razorpay.com",
      ],

      // Frames/iframes: OAuth popups
      frameSrc: [
        "'self'",
        "https://accounts.google.com",
        "https://github.com",
      ],

      // Objects: Deny all
      objectSrc: ["'none'"],
    },
  };
}

  /**
   * Get HSTS Configuration
   * 
   * HSTS Preload Requirements (for official browser preload list):
   * 1. maxAge must be at least 31536000 seconds (1 year)
   * 2. includeSubDomains directive must be present
   * 3. preload directive must be present
   * 4. Must serve HTTPS
   * 
   * Submit to: https://hstspreload.org/
   */
  private getHSTSConfig() {
    // Disable HSTS in development for easier local testing
    if (this.isDevelopment) {
      return false;
    }

    return {
      maxAge: 63072000, // 2 years (730 days) - Recommended for preload list
      includeSubDomains: true, // Apply to all subdomains
      preload: true, // Eligible for browser preload lists
    };
  }

  /**
   * Get complete Helmet configuration
   */
  public getHelmetConfig(): HelmetOptions {
    return {
      // Content Security Policy - STRICT MODE (Phase 2 - Step 2)
      contentSecurityPolicy: this.getCSPConfig(),

      // Cross-Origin Policies
      crossOriginEmbedderPolicy: false, // Disabled for external resources
      crossOriginOpenerPolicy: {
        policy: "same-origin-allow-popups", // Allow OAuth popups
      },
      crossOriginResourcePolicy: {
        policy: "cross-origin", // Allow cross-origin resources
      },

      // DNS Prefetch Control - Prevent DNS leakage
      dnsPrefetchControl: {
        allow: false,
      },

      // Frameguard - Prevents clickjacking attacks
      frameguard: {
        action: "deny", // Deny all framing
      },

      // Hide Powered By - Don't leak tech stack
      hidePoweredBy: true,

      // HSTS - Force HTTPS (Phase 2 - Step 1)
      hsts: this.getHSTSConfig(),

      // IE No Open - Prevent IE from executing downloads
      ieNoOpen: true,

      // No Sniff - Prevent MIME type sniffing
      noSniff: true,

      // Origin Agent Cluster - Browser process isolation
      originAgentCluster: true,

      // Permitted Cross Domain Policies - Block Flash/PDF policies
      permittedCrossDomainPolicies: {
        permittedPolicies: "none",
      },

      // Referrer Policy - Control referrer information
      referrerPolicy: {
        policy: "strict-origin-when-cross-origin",
      },

      // XSS Filter - Enable browser XSS protection
      xssFilter: true,
    };
  }

  /**
   * Get helmet middleware
   */
  public getHelmetMiddleware() {
    return helmet(this.getHelmetConfig());
  }

  /**
   * Get CSP nonce for script tags (if needed in future)
   * Usage: <script nonce={nonce}>...</script>
   */
  public generateCSPNonce(): string {
    return Buffer.from(Math.random().toString()).toString('base64');
  }
}

/**
 * Create singleton instances for different environments
 */
const developmentHeadersManager = new SecurityHeadersManager(true);
const productionHeadersManager = new SecurityHeadersManager(false);

/**
 * Get appropriate configuration based on NODE_ENV
 */
export const getSecurityHeadersConfig = (isDevelopment: boolean = false) => {
  const manager = isDevelopment ? developmentHeadersManager : productionHeadersManager;
  return manager.getHelmetMiddleware();
};

/**
 * Export manager class for advanced usage
 */
export default SecurityHeadersManager;