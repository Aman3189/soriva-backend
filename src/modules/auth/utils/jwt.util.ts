import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../dto/auth.dto';

/**
 * JWT Utility Class
 * Handles token generation and verification
 * 
 * NOTE: Using getters instead of static readonly to ensure
 * env vars are read at runtime, not at class load time
 */
export class JWTUtil {
  // Use getters to ensure env vars are read at runtime
  private static get ACCESS_TOKEN_SECRET(): string {
    return process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
  }
  
  private static get REFRESH_TOKEN_SECRET(): string {
    return process.env.JWT_REFRESH_SECRET || 'soriva-refresh-secret-key';
  }
  
  private static readonly ACCESS_TOKEN_EXPIRY = '7d'; // 7 days
  private static readonly REFRESH_TOKEN_EXPIRY = '30d'; // 30 days

  /**
   * Generate access token
   */
  static generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY
    });
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY
    });
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.ACCESS_TOKEN_SECRET) as JWTPayload;
      return decoded;
    } catch (error) {
      console.error('Access token verification failed:', error);
      return null;
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.REFRESH_TOKEN_SECRET) as JWTPayload;
      return decoded;
    } catch (error) {
      console.error('Refresh token verification failed:', error);
      return null;
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      console.error('Token decode failed:', error);
      return null;
    }
  }
}