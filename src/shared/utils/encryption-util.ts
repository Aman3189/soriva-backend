/**
 * ==========================================
 * ENCRYPTION UTILITY - AES-256-GCM
 * ==========================================
 * Military-grade encryption for chat messages
 * Algorithm: AES-256-GCM (Galois/Counter Mode)
 * Features: Unique IV per message, Authentication tags
 * Last Updated: November 18, 2025
 */

import crypto from 'crypto';

/**
 * Encryption result containing all necessary data
 */
interface EncryptionResult {
  encrypted: string;      // Base64 encrypted data
  iv: string;             // Base64 initialization vector
  authTag: string;        // Base64 authentication tag
}

/**
 * Decryption input data
 */
interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}

/**
 * ==========================================
 * ENCRYPTION UTILITY CLASS
 * ==========================================
 */
export class EncryptionUtil {
  private readonly algorithm: string = 'aes-256-gcm';
  private readonly keyLength: number = 32; // 256 bits
  private readonly ivLength: number = 16;  // 128 bits
  private encryptionKey: Buffer;

  constructor() {
    this.encryptionKey = this.getEncryptionKey();
  }

  /**
   * Get encryption key from environment variable
   * Creates one if not exists (development only)
   */
  private getEncryptionKey(): Buffer {
    const envKey = process.env.ENCRYPTION_KEY;

    if (!envKey) {
      // Development: Generate random key (NOT for production!)
      if (process.env.NODE_ENV === 'production') {
        throw new Error('ENCRYPTION_KEY must be set in production environment');
      }

      console.warn('⚠️  WARNING: ENCRYPTION_KEY not found. Generating temporary key.');
      console.warn('⚠️  Add ENCRYPTION_KEY to .env file for production!');

      // Generate 32-byte random key
      const tempKey = crypto.randomBytes(this.keyLength);
      return tempKey;
    }

    // Validate key length
    const key = Buffer.from(envKey, 'hex');
    
    if (key.length !== this.keyLength) {
      throw new Error(
        `Invalid ENCRYPTION_KEY length. Expected ${this.keyLength} bytes (64 hex chars), got ${key.length} bytes`
      );
    }

    return key;
  }

  /**
   * ==========================================
   * ENCRYPT MESSAGE
   * ==========================================
   * Encrypts plain text using AES-256-GCM
   * Returns: { encrypted, iv, authTag }
   */
  public encrypt(plainText: string): EncryptionResult {
    try {
      if (!plainText || plainText.trim().length === 0) {
        throw new Error('Cannot encrypt empty text');
      }

      // Generate random IV (unique per message)
      const iv = crypto.randomBytes(this.ivLength);

      // Create cipher
      const cipher = crypto.createCipheriv(
        this.algorithm,
        this.encryptionKey,
        iv
      );

      // Encrypt
      let encrypted = cipher.update(plainText, 'utf8', 'base64');
      encrypted += cipher.final('base64');

      // Get authentication tag (cast to any due to TypeScript definitions)
      const authTag = (cipher as any).getAuthTag();

      // Return all components as base64
      return {
        encrypted,
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Encryption failed:', errorMessage);
      throw new Error(`Encryption failed: ${errorMessage}`);
    }
  }

  /**
   * ==========================================
   * DECRYPT MESSAGE
   * ==========================================
   * Decrypts encrypted data using AES-256-GCM
   * Validates authentication tag for integrity
   */
  public decrypt(encryptedData: EncryptedData): string {
    try {
      if (!encryptedData.encrypted || !encryptedData.iv || !encryptedData.authTag) {
        throw new Error('Missing required encryption data (encrypted/iv/authTag)');
      }

      // Convert from base64
      const iv = Buffer.from(encryptedData.iv, 'base64');
      const authTag = Buffer.from(encryptedData.authTag, 'base64');

      // Create decipher
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.encryptionKey,
        iv
      );

      // Set authentication tag (cast to any due to TypeScript definitions)
      (decipher as any).setAuthTag(authTag);

      // Decrypt
      let decrypted = decipher.update(encryptedData.encrypted, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Decryption failed:', errorMessage);
      
      // Authentication tag verification failed = data tampered!
      if (errorMessage.includes('Unsupported state or unable to authenticate data')) {
        throw new Error('Decryption failed: Data integrity check failed (possible tampering)');
      }
      
      throw new Error(`Decryption failed: ${errorMessage}`);
    }
  }

  /**
   * ==========================================
   * UTILITY METHODS
   * ==========================================
   */

  /**
   * Generate a new encryption key (for setup)
   * Returns 64-character hex string
   */
  public static generateKey(): string {
    const key = crypto.randomBytes(32);
    return key.toString('hex');
  }

  /**
   * Check if encryption is properly configured
   */
  public isConfigured(): boolean {
    return !!process.env.ENCRYPTION_KEY;
  }

  /**
   * Validate encryption key format
   */
  public static isValidKey(key: string): boolean {
    try {
      const buffer = Buffer.from(key, 'hex');
      return buffer.length === 32; // 256 bits
    } catch {
      return false;
    }
  }
}

// ==========================================
// SINGLETON EXPORT
// ==========================================
export default new EncryptionUtil();