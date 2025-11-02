// src/modules/auth/auth.service.ts

/**
 * ==========================================
 * AUTH SERVICE - USER AUTHENTICATION
 * ==========================================
 * Handles registration, login, and user authentication
 * Last Updated: November 2, 2025 (Studio Credits Update)
 *
 * CHANGES (November 2, 2025):
 * - ✅ Removed trial logic
 * - ✅ Direct STARTER plan assignment (no trial)
 * - ✅ Default planStatus = ACTIVE (not TRIAL)
 * - ✅ 1500 words daily limit (Llama LLM)
 * - ✅ Studio credits = 0 (must purchase boosters)
 */

import { prisma } from '../../config/prisma';
import bcrypt from 'bcrypt';
import { generateAccessToken } from '@shared/utils/jwt.util';

// Prisma enums
import { PlanType, PlanStatus, SecurityStatus, ActivityTrend } from '@prisma/client';
import { isPlanActive } from '@shared/types/prisma-enums';

export class AuthService {
  /**
   * Register new user with email and password
   * Assigns STARTER plan (free, 1500 words/day, Llama LLM)
   */
  async register(email: string, password: string, name?: string) {
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

      // Create user with STARTER plan (no trial)
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || null,
          authProvider: 'email',

          // Plan configuration - STARTER (free plan)
          planType: PlanType.STARTER,
          subscriptionPlan: 'starter',
          planStatus: PlanStatus.ACTIVE, // ✅ ACTIVE, not TRIAL
          planStartDate: now,
          planEndDate: null, // No end date for free plan

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
          memoryDays: 7, // STARTER plan default
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
          remainingWords: 1500, // Daily limit
          monthlyLimit: 45000, // ~1500 * 30 days
          dailyLimit: 1500, // STARTER daily limit
          lastDailyReset: now,
          lastMonthlyReset: now,
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
   */
  async login(email: string, password: string) {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
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

      return {
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          planType: user.planType,
          subscriptionPlan: user.subscriptionPlan,
          planStatus: user.planStatus,
          authProvider: user.authProvider,
          securityStatus: user.securityStatus,
        },
      };
    } catch (error: any) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  /**
   * Get user by ID
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