// src/modules/auth/auth.service.ts

/**
 * ==========================================
 * AUTH SERVICE - USER AUTHENTICATION
 * ==========================================
 * Handles registration, login, and user authentication
 * Last Updated: November 12, 2025 (Multi-Currency Support)
 *
 * CHANGES (November 12, 2025):
 * - ✅ Added region detection on signup
 * - ✅ Region/currency saved in user profile
 * - ✅ Region info returned in login/profile
 */

import { prisma } from '../../config/prisma';
import bcrypt from 'bcrypt';
import { generateAccessToken } from '@shared/utils/jwt.util';

// Prisma enums
import { PlanType, PlanStatus, SecurityStatus, ActivityTrend, Region, Currency } from '@prisma/client';
import { isPlanActive } from '@shared/types/prisma-enums';

// ⭐ NEW: Region data interface
interface RegionData {
  region: Region;
  currency: Currency;
  country: string;
  detectedCountry?: string;
  countryName?: string;
  timezone?: string;
}

export class AuthService {
  /**
   * Register new user with email and password
   * Assigns STARTER plan (free, 1500 words/day, Llama LLM)
   * ⭐ NEW: Saves region/currency on signup
   */
  async register(email: string, password: string, name?: string, regionData?: RegionData) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const now = new Date();

      // ⭐ NEW: Default region data if not provided
      const userRegionData = regionData || {
        region: 'IN' as Region,
        currency: 'INR' as Currency,
        country: 'IN',
        countryName: 'India',
        timezone: 'Asia/Kolkata',
      };

      // Create user with STARTER plan + region info
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || null,
          authProvider: 'email',

          // ⭐ NEW: Region & Currency
          region: userRegionData.region,
          currency: userRegionData.currency,
          country: userRegionData.country,
          detectedCountry: userRegionData.detectedCountry,
          countryName: userRegionData.countryName,
          timezone: userRegionData.timezone,

          // Plan configuration - STARTER (free plan)
          planType: PlanType.STARTER,
          subscriptionPlan: 'starter',
          planStatus: PlanStatus.ACTIVE,
          planStartDate: now,
          planEndDate: null,

          // Trial tracking (all false/null for STARTER)
          trialUsed: false,
          trialStartDate: null,
          trialEndDate: null,
          trialExtended: false,
          trialDaysUsed: 0,

          // Security defaults
          securityStatus: SecurityStatus.TRUSTED,
          suspiciousActivityCount: 0,
          jailbreakAttempts: 0,

          // Activity tracking
          activityTrend: ActivityTrend.NEW,
          sessionCount: 0,

          // Memory & response defaults
          memoryDays: 7,
          responseDelay: 0,

          // Cooldown tracking
          cooldownPurchasesThisPeriod: 0,
          cooldownResetDate: null,
        },
        select: {
          id: true,
          email: true,
          name: true,
          planType: true,
          subscriptionPlan: true,
          planStatus: true,
          authProvider: true,
          region: true,
          currency: true,
          country: true,
          countryName: true,
          timezone: true,
          createdAt: true,
        },
      });

      // Initialize usage tracking for STARTER
      await prisma.usage.create({
        data: {
          userId: user.id,
          planName: 'starter',
          wordsUsed: 0,
          dailyWordsUsed: 0,
          remainingWords: 1500,
          monthlyLimit: 45000,
          dailyLimit: 1500,
          lastDailyReset: now,
          lastMonthlyReset: now,
          cycleStartDate: now,
          cycleEndDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      // Generate JWT token
      const token = generateAccessToken({
        userId: user.id,
        email: user.email,
        planType: user.subscriptionPlan,
      });

      return {
        success: true,
        token,
        user: {
          ...user,
          planType: user.planType,
          planStatus: user.planStatus,
        },
      };
    } catch (error: any) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  /**
   * Login user with email and password
   * ⭐ NEW: Returns region info
   */
  async login(email: string, password: string) {
    try {
      // Find user by email with region info
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          name: true,
          planType: true,
          subscriptionPlan: true,
          planStatus: true,
          authProvider: true,
          securityStatus: true,
          region: true,
          currency: true,
          country: true,
          countryName: true,
          timezone: true,
        },
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if password exists (OAuth users don't have password)
      if (!user.password) {
        throw new Error('Please login with Google');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Check if plan is active
      if (!isPlanActive(user.planStatus)) {
        throw new Error('Your subscription is inactive. Please renew your plan.');
      }

      // Generate JWT token
      const token = generateAccessToken({
        userId: user.id,
        email: user.email,
        planType: user.subscriptionPlan,
      });

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        token,
        user: userWithoutPassword,
      };
    } catch (error: any) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  /**
   * Get user by ID
   * ⭐ NEW: Includes region info
   */
  async getUserById(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          planType: true,
          subscriptionPlan: true,
          planStatus: true,
          authProvider: true,
          region: true,
          currency: true,
          country: true,
          countryName: true,
          detectedCountry: true,
          timezone: true,
          trialStartDate: true,
          trialEndDate: true,
          trialUsed: true,
          trialDaysUsed: true,
          securityStatus: true,
          activityTrend: true,
          cooldownPurchasesThisPeriod: true,
          cooldownResetDate: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error: any) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  }

  /**
   * Get user profile (alias for getUserById)
   */
  async getProfile(userId: string) {
    return this.getUserById(userId);
  }

  /**
   * ⭐ NEW: Update user's region
   */
  async updateRegion(
    userId: string,
    regionData: {
      region: Region;
      currency: Currency;
      country: string;
      countryName?: string;
      timezone?: string;
    }
  ) {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          region: regionData.region,
          currency: regionData.currency,
          country: regionData.country,
          countryName: regionData.countryName,
          timezone: regionData.timezone,
        },
        select: {
          id: true,
          email: true,
          region: true,
          currency: true,
          country: true,
          countryName: true,
          timezone: true,
        },
      });

      return updatedUser;
    } catch (error: any) {
      throw new Error(`Failed to update region: ${error.message}`);
    }
  }

  /**
   * Check if user's trial is still active
   */
  async isTrialActive(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          trialEndDate: true,
          trialUsed: true,
          planStatus: true,
        },
      });

      if (!user) {
        return false;
      }

      if (user.trialUsed) {
        return false;
      }

      if (!isPlanActive(user.planStatus)) {
        return false;
      }

      const now = new Date();
      const trialEnd = user.trialEndDate;

      if (!trialEnd) {
        return false;
      }

      return trialEnd > now;
    } catch (error: any) {
      console.error('[AuthService] Error checking trial status:', error);
      return false;
    }
  }
}

export default new AuthService();