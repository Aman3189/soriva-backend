// src/modules/auth/auth.service.ts

/**
 * ==========================================
 * AUTH SERVICE - USER AUTHENTICATION
 * ==========================================
 * Handles registration, login, and user authentication
 * Last Updated: October 28, 2025 (Schema Migration - Enum Support)
 *
 * CHANGES (October 28, 2025):
 * - ✅ Added enum imports (PlanType, PlanStatus, SecurityStatus, ActivityTrend)
 * - ✅ Updated user creation with type-safe enums
 * - ✅ Using isPlanActive() helper instead of string comparison
 * - ✅ Added proper type safety for all status checks
 * - ✅ Updated trial tracking with new trialDaysUsed field
 * - ✅ Added cooldown tracking initialization
 *
 * PREVIOUS CHANGES (October 14, 2025):
 * - Updated to new plan name: STARTER (was vibe_free)
 * - Updated trial limits: 42K words, 3K daily (was 30K, 1K)
 * - Uses plansManager for dynamic config (future-proof)
 * - Class-based architecture maintained
 */

import { prisma } from '../../config/prisma';
import bcrypt from 'bcrypt';
import { generateAccessToken } from '../../shared/utils/jwt.util';
import { PlanType as PlanTypeEnum, plansManager } from '../../constants';

// ✅ NEW IMPORTS: Enums and helpers from prisma-enums
// ✅ Import Prisma enums from @prisma/client
import { PlanType, PlanStatus, SecurityStatus, ActivityTrend } from '@prisma/client';

// ✅ Import helper functions from prisma-enums
import { isPlanActive } from '../../types/prisma-enums';
export class AuthService {
  /**
   * Register new user with email and password
   * Assigns STARTER plan (14-day free trial) automatically
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

      // Get STARTER plan configuration
      const starterPlan = plansManager.getPlan(PlanTypeEnum.STARTER);
      if (!starterPlan) {
        throw new Error('Starter plan configuration not found');
      }

      const trialConfig = starterPlan.trial;
      if (!trialConfig || !trialConfig.enabled) {
        throw new Error('Trial configuration not available');
      }

      // Calculate trial dates
      const now = new Date();
      const trialDurationMs = trialConfig.durationDays * 24 * 60 * 60 * 1000;
      const trialEndDate = new Date(now.getTime() + trialDurationMs);

      // ✅ UPDATED: Create user with enums
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || null,
          authProvider: 'email',

          // ✅ Plan configuration (using enums)
          planType: PlanType.STARTER, // ✅ NEW: Enum instead of string
          subscriptionPlan: 'starter', // ✅ Plan name (lowercase string)
          planStatus: PlanStatus.TRIAL, // ✅ NEW: TRIAL status for new users
          planStartDate: now,
          planEndDate: trialEndDate,

          // ✅ Trial tracking
          trialUsed: false,
          trialStartDate: now,
          trialEndDate: trialEndDate,
          trialExtended: false,
          trialDaysUsed: 0, // ✅ NEW FIELD: Track trial usage

          // ✅ Security defaults
          securityStatus: SecurityStatus.TRUSTED, // ✅ NEW: Enum
          suspiciousActivityCount: 0,
          jailbreakAttempts: 0,

          // ✅ Activity tracking defaults
          activityTrend: ActivityTrend.NEW, // ✅ NEW: Enum
          sessionCount: 0,

          // ✅ Memory & response configuration (from plan)
          memoryDays: starterPlan.limits.memoryDays,
          responseDelay: starterPlan.limits.responseDelay,

          // ✅ Cooldown tracking initialization
          cooldownPurchasesThisPeriod: 0, // ✅ NEW FIELD
          cooldownResetDate: trialEndDate, // ✅ NEW FIELD: Reset on trial end
        },
        select: {
          id: true,
          email: true,
          name: true,
          planType: true, // ✅ Returns enum
          subscriptionPlan: true,
          planStatus: true, // ✅ Returns enum
          authProvider: true,
          trialStartDate: true,
          trialEndDate: true,
          createdAt: true,
        },
      });

      // Initialize usage tracking for STARTER trial
      await prisma.usage.create({
        data: {
          userId: user.id,
          planName: 'starter',
          wordsUsed: 0,
          dailyWordsUsed: 0,
          remainingWords: trialConfig.totalWords, // 42,000
          monthlyLimit: trialConfig.totalWords, // 42,000
          dailyLimit: trialConfig.dailyWords, // 3,000
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
          // ✅ Convert enums to strings for API response (if needed)
          planType: user.planType, // Already PlanType enum
          planStatus: user.planStatus, // Already PlanStatus enum
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

      // ✅ UPDATED: Check if plan is active (handles both ACTIVE and TRIAL)
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
          planType: user.planType, // Enum
          subscriptionPlan: user.subscriptionPlan,
          planStatus: user.planStatus, // Enum
          authProvider: user.authProvider,
          securityStatus: user.securityStatus, // Enum
        },
      };
    } catch (error: any) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  /**
   * Get user by ID (helper method)
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
          trialDaysUsed: true, // ✅ NEW FIELD
          securityStatus: true,
          activityTrend: true,
          cooldownPurchasesThisPeriod: true, // ✅ NEW FIELD
          cooldownResetDate: true, // ✅ NEW FIELD
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
   * ✅ UPDATED: Uses enum-based status check
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

      // If trial already used, not active
      if (user.trialUsed) {
        return false;
      }

      // ✅ UPDATED: Use helper function instead of string comparison
      // Checks both ACTIVE and TRIAL status
      if (!isPlanActive(user.planStatus)) {
        return false;
      }

      // Check if trial end date is in the future
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

  /**
   * ✅ NEW METHOD: Check if user can make cooldown purchase
   */
  async canPurchaseCooldown(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          planType: true,
          cooldownPurchasesThisPeriod: true,
          cooldownResetDate: true,
        },
      });

      if (!user) {
        return false;
      }

      // Check if reset date has passed
      const now = new Date();
      if (user.cooldownResetDate && now > user.cooldownResetDate) {
        // Reset period has passed, allow purchase
        return true;
      }

      // Get plan's cooldown limit (default 2 per period)
      const maxCooldowns = 2; // From plans.ts: maxPerPlanPeriod

      // Check if user hasn't exceeded limit
      return user.cooldownPurchasesThisPeriod < maxCooldowns;
    } catch (error: any) {
      console.error('[AuthService] Error checking cooldown eligibility:', error);
      return false;
    }
  }

  /**
   * ✅ NEW METHOD: Get progressive cooldown price
   */
  async getCooldownPrice(userId: string): Promise<number | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          planType: true,
          cooldownPurchasesThisPeriod: true,
        },
      });

      if (!user) {
        return null;
      }

      // Get plan configuration
      const plan = plansManager.getPlan(user.planType as any);
      if (!plan || !plan.cooldownBooster) {
        return null;
      }

      const basePrice = plan.cooldownBooster.price;
      const multipliers = plan.cooldownBooster.progressiveMultipliers;

      // Calculate price based on purchase number
      const purchaseNumber = user.cooldownPurchasesThisPeriod;
      const multiplier = multipliers[purchaseNumber] || 1;

      return Math.round(basePrice * multiplier);
    } catch (error: any) {
      console.error('[AuthService] Error calculating cooldown price:', error);
      return null;
    }
  }
}

export default new AuthService();
