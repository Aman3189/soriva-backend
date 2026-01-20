import { Request, Response } from 'express';
import authService from './auth.service';
import { z } from 'zod';
import { Region, Currency } from '@prisma/client';
import {
  getRegionFromCountry,
  getCurrencyFromRegion,
} from '@constants/plans';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// ⭐ Region data interface
interface RegionData {
  region: Region;
  currency: Currency;
  country: string;
  detectedCountry?: string;
  countryName?: string;
  timezone?: string;
}

// ⭐ Helper: Get country name from code
const COUNTRY_NAMES: Record<string, string> = {
  IN: 'India',
  US: 'United States',
  GB: 'United Kingdom',
  CA: 'Canada',
  AU: 'Australia',
  DE: 'Germany',
  FR: 'France',
  IT: 'Italy',
  ES: 'Spain',
  NL: 'Netherlands',
  BR: 'Brazil',
  MX: 'Mexico',
  JP: 'Japan',
  CN: 'China',
  SG: 'Singapore',
  AE: 'United Arab Emirates',
};

function getCountryName(countryCode: string): string {
  return COUNTRY_NAMES[countryCode.toUpperCase()] || countryCode;
}

export class AuthController {
  /**
   * POST /api/auth/register
   * Register a new user with region detection
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const { email, password, name } = registerSchema.parse(req.body);

      // ⭐ Get region data from middleware
      const regionalReq = req as any;
      const regionData: RegionData = {
        region: regionalReq.region || ('IN' as Region),
        currency: regionalReq.currency || ('INR' as Currency),
        country: regionalReq.country || 'IN',
        detectedCountry: regionalReq.detectedCountry,
        countryName: regionalReq.countryName || 'India',
        timezone: regionalReq.timezone || 'Asia/Kolkata',
      };

      // Register user with region data
      const result = await authService.register({ email, password, name, regionData });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          ...result,
          region: regionData.region,
          currency: regionData.currency,
          country: regionData.countryName,
        },
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.issues,
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: error.message || 'Registration failed',
      });
    }
  }

  /**
   * POST /api/auth/login
   * Login user and return region info
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const { email, password } = loginSchema.parse(req.body);

      // Login user
      const result = await authService.login({ email, password });

      // ⭐ Include region info in response
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          ...result,
          region: result.user?.region || 'IN',
          currency: result.user?.currency || 'INR',
          country: result.user?.region === 'IN' ? 'India' : 'International',
        },
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.issues,
        });
        return;
      }

      res.status(401).json({
        success: false,
        message: error.message || 'Login failed',
      });
    }
  }

  /**
   * GET /api/auth/profile
   * Get current user profile with region info
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;

      if (!user || !user.userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - No user ID found',
        });
        return;
      }

      const profile = await authService.getProfile(user.userId);

      // ⭐ Include formatted region info
      res.status(200).json({
        success: true,
        data: {
          ...profile,
          regionalInfo: {
            region: profile.region || 'IN',
            currency: profile.currency || 'INR',
            country: profile.countryName || 'India',
            timezone: profile.timezone || 'Asia/Kolkata',
          },
        },
      });
    } catch (error: any) {
      console.error('❌ Profile Error:', error.message);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch profile',
      });
    }
  }

  /**
   * ⭐ PATCH /api/auth/region
   * Update user's region manually
   */
 async updateRegion(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;

    if (!user || !user.userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const { country } = req.body;

    if (!country || typeof country !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Country code is required',
      });
      return;
    }

    const countryCode = country.toUpperCase();
    
    // ✅ FIXED: Type assertion
    const region = (countryCode === 'IN' ? 'IN' : 'INTL') as Region;
    const currency = (countryCode === 'IN' ? 'INR' : 'USD') as Currency;
    const countryName = getCountryName(countryCode);

    const updatedUser = await authService.updateRegion(user.userId, {
      region,
      currency,
      country: countryCode,
      countryName,
    });

    res.status(200).json({
      success: true,
      message: 'Region updated successfully',
      data: {
        region: updatedUser.region,
        currency: updatedUser.currency,
        country: updatedUser.countryName,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update region',
    });
  }
}
}

export default new AuthController();