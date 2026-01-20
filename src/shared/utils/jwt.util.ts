// src/shared/utils/jwt.util.ts
import jwt, { SignOptions } from 'jsonwebtoken';

// Lazy-load JWT configuration to ensure env vars are available
const getJWTSecret = (): string => 
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

const getJWTExpiresIn = (): string => 
  process.env.JWT_EXPIRES_IN || '7d';

const getJWTRefreshExpiresIn = (): string => 
  process.env.JWT_REFRESH_EXPIRES_IN || '30d';

export interface JWTPayload {
  userId: string;
  email: string;
  planType: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate Access Token
 */
export const generateAccessToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, getJWTSecret(), {
    expiresIn: getJWTExpiresIn(),
  } as SignOptions);
};

/**
 * Generate Refresh Token
 */
export const generateRefreshToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, getJWTSecret(), {
    expiresIn: getJWTRefreshExpiresIn(),
  } as SignOptions);
};

/**
 * Verify Token
 */
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, getJWTSecret()) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Decode Token (without verification)
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Generate Token Pair (Access + Refresh)
 */
export const generateTokenPair = (payload: Omit<JWTPayload, 'iat' | 'exp'>) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;

  // Format: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

export const generateToken = generateAccessToken;