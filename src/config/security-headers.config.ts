// src/config/security-headers.config.ts
import helmet, { HelmetOptions } from 'helmet';

/**
 * ==========================================
 * SECURITY HEADERS CONFIGURATION - SORIVA V2
 * ==========================================
 * Class-based security headers configuration using Helmet
 * Matches existing backend architecture
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
   */
  private getCSPConfig() {
    if (this.isDevelopment) {
      return false; // Disable CSP in development for easier debugging
    }

    return {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'", // Required for some React builds
          "https://cdn.jsdelivr.net",
          "https://www.googletagmanager.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'", // Required for styled-components
          "https://fonts.googleapis.com",
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https:", // Allow HTTPS images
          "blob:", // For uploaded/generated images
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        connectSrc: [
          "'self'",
          // AI Provider APIs
          "https://api.anthropic.com", // Claude
          "https://api.openai.com", // GPT
          "https://generativelanguage.googleapis.com", // Gemini
          "https://api.groq.com", // Groq
          // OAuth Providers
          "https://accounts.google.com",
          "https://github.com",
          // Storage & DB
          "https://*.supabase.co", // Supabase (RAG/Storage)
          "https://*.amazonaws.com", // AWS S3
        ],
        frameSrc: [
          "'self'",
          "https://accounts.google.com", // Google OAuth
          "https://github.com", // GitHub OAuth
        ],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [], // Force HTTPS in production
      },
    };
  }

  /**
   * Get complete Helmet configuration
   */
  public getHelmetConfig(): HelmetOptions {
    return {
      // Content Security Policy
      contentSecurityPolicy: this.getCSPConfig(),

      // Cross-Origin Policies
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: {
        policy: "same-origin-allow-popups", // Allow OAuth popups
      },
      crossOriginResourcePolicy: {
        policy: "cross-origin", // Allow cross-origin resources
      },

      // DNS Prefetch Control
      dnsPrefetchControl: {
        allow: false,
      },

      // Frameguard - Prevents clickjacking
      frameguard: {
        action: "deny",
      },

      // Hide Powered By
      hidePoweredBy: true,

      // HSTS - Force HTTPS
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },

      // IE No Open
      ieNoOpen: true,

      // No Sniff
      noSniff: true,

      // Origin Agent Cluster
      originAgentCluster: true,

      // Permitted Cross Domain Policies
      permittedCrossDomainPolicies: {
        permittedPolicies: "none",
      },

      // Referrer Policy
      referrerPolicy: {
        policy: "strict-origin-when-cross-origin",
      },

      // XSS Filter
      xssFilter: true,
    };
  }

  /**
   * Get helmet middleware
   */
  public getHelmetMiddleware() {
    return helmet(this.getHelmetConfig());
  }
}

/**
 * Create instances for different environments
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