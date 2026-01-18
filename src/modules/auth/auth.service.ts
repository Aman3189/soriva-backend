// src/modules/auth/auth.service.ts

/**
 * ==========================================
 * AUTH SERVICE - USER AUTHENTICATION
 * ==========================================
 * Handles registration, login, and user authentication
 * Last Updated: December 4, 2025 (Device Fingerprint + Abuse Controls)
 *
 * FEATURES:
 * ✅ Device fingerprint tracking
 * ✅ Account creation limits per device (max 2)
 * ✅ IP-based signup limits (max 3/day)
 * ✅ 30-day cooldown between accounts on same device
 * ✅ Blocked device check
 * ✅ Suspicious login detection
 * ✅ Verification status tracking
 * ✅ Refund tracking
 */

import { prisma } from '../../config/prisma';
import bcrypt from 'bcrypt';
import { generateAccessToken } from '@shared/utils/jwt.util';

// Prisma enums
import { PlanType, PlanStatus, SecurityStatus, ActivityTrend, Region, Currency } from '@prisma/client';
import { isPlanActive } from '@shared/types/prisma-enums';

// Abuse limits integration
import {
  canCreateAccountOnDevice,
  ACCOUNT_ELIGIBILITY,
} from '@/constants/abuse-limits';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface DeviceFingerprint {
  visitorId: string;
  ipAddressHash?: string;
  userAgent?: string;
  screenResolution?: string;
  timezone?: string;
  language?: string;
  platform?: string;
}

interface RegionData {
  region: Region;
  currency: Currency;
  country: string;
  detectedCountry?: string;
  countryName?: string;
  timezone?: string;
}

interface SignupData {
  email: string;
  password: string;
  name?: string;
  regionData?: RegionData;
  fingerprint?: DeviceFingerprint;
  ipAddress?: string;
}

interface LoginData {
  email: string;
  password: string;
  fingerprint?: DeviceFingerprint;
  ipAddress?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTH SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class AuthService {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PRIVATE HELPERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private async getDeviceAccountCount(visitorId: string): Promise<number> {
    return prisma.user.count({
      where: { deviceFingerprint: visitorId },
    });
  }

  private async getDeviceStarterCount(visitorId: string): Promise<number> {
    return prisma.user.count({
      where: {
        deviceFingerprint: visitorId,
        planType: PlanType.STARTER,
      },
    });
  }

  private async getIPAccountsToday(ipAddressHash: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.user.count({
      where: {
        ipAddressHash,
        createdAt: { gte: today },
      },
    });
  }

  private async getDaysSinceLastAccount(visitorId: string): Promise<number> {
    const lastUser = await prisma.user.findFirst({
      where: { deviceFingerprint: visitorId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    if (!lastUser) return 999;

    const diffMs = Date.now() - lastUser.createdAt.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  private async isDeviceBlocked(visitorId: string): Promise<boolean> {
    const blocked = await prisma.blockedDevice.findUnique({
      where: { fingerprint: visitorId },
    });
    return !!blocked;
  }

  private hashIP(ip: string): string {
    let hash = 0;
    for (let i = 0; i < ip.length; i++) {
      const char = ip.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return `ip_${Math.abs(hash).toString(16)}`;
  }

  private getAccountAgeDays(createdAt: Date): number {
    return Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REGISTRATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async register(data: SignupData) {
    const { email, password, name, regionData, fingerprint, ipAddress } = data;

    try {
      // ════════════════════════════════════════════════════════════
      // DEVICE FINGERPRINT ABUSE CHECKS
      // ════════════════════════════════════════════════════════════

      if (fingerprint?.visitorId) {
        const isBlocked = await this.isDeviceBlocked(fingerprint.visitorId);
        if (isBlocked) {
          throw new Error('Account creation is not allowed from this device');
        }

        const existingAccountsOnDevice = await this.getDeviceAccountCount(fingerprint.visitorId);
        const existingStarterAccountsOnDevice = await this.getDeviceStarterCount(fingerprint.visitorId);
        const daysSinceLastAccountOnDevice = await this.getDaysSinceLastAccount(fingerprint.visitorId);

        const ipHash = ipAddress ? this.hashIP(ipAddress) : fingerprint.ipAddressHash || '';
        const accountsCreatedOnIPToday = ipHash ? await this.getIPAccountsToday(ipHash) : 0;

        const canCreate = canCreateAccountOnDevice({
          existingAccountsOnDevice,
          existingStarterAccountsOnDevice,
          accountsCreatedOnIPToday,
          daysSinceLastAccountOnDevice,
          isStarterAccount: true,
        });

        if (!canCreate.allowed) {
          throw new Error(canCreate.reason);
        }
      }

      // ════════════════════════════════════════════════════════════
      // CHECK EXISTING USER
      // ════════════════════════════════════════════════════════════

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // ════════════════════════════════════════════════════════════
      // CREATE USER
      // ════════════════════════════════════════════════════════════

      const hashedPassword = await bcrypt.hash(password, 10);
      const now = new Date();

      const userRegionData = regionData || {
        region: 'IN' as Region,
        currency: 'INR' as Currency,
        country: 'IN',
        countryName: 'India',
        timezone: 'Asia/Kolkata',
      };

      const ipHash = ipAddress ? this.hashIP(ipAddress) : fingerprint?.ipAddressHash || null;

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || null,
          authProvider: 'email',

          // Device fingerprint
          deviceFingerprint: fingerprint?.visitorId || null,
          ipAddressHash: ipHash,
          lastLoginIP: ipHash,

          // Region & Currency
          region: userRegionData.region,
          currency: userRegionData.currency,
          country: userRegionData.country,
          detectedCountry: userRegionData.detectedCountry,
          countryName: userRegionData.countryName,
          timezone: userRegionData.timezone,

          // Plan configuration
          planType: PlanType.STARTER,
          planStatus: PlanStatus.ACTIVE,
          planStartDate: now,

          // Trial tracking
          trialUsed: false,
          trialExtended: false,
          trialDaysUsed: 0,

          // Security defaults
          securityStatus: SecurityStatus.TRUSTED,
          suspiciousActivityCount: 0,
          jailbreakAttempts: 0,

          // Activity tracking
          activityTrend: ActivityTrend.NEW,
          sessionCount: 0,

          // Defaults
          memoryDays: 7,
          responseDelay: 0,

          // Cooldown tracking
          cooldownPurchasesThisPeriod: 0,

          // Verification status
          emailVerified: false,
          mobileVerified: false,

          // Refund tracking
          refundCount: 0,
          refundsThisYear: 0,
          accidentalBoosterRefunds: 0,
          accountFlagged: false,
        },
        select: {
          id: true,
          email: true,
          name: true,
          planType: true,
          planStatus: true,
          authProvider: true,
          region: true,
          currency: true,
          country: true,
          countryName: true,
          timezone: true,
          emailVerified: true,
          mobileVerified: true,
          createdAt: true,
        },
      });

      // Initialize usage tracking
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

      // Log signup event
      if (fingerprint?.visitorId) {
        await prisma.signupLog.create({
          data: {
            userId: user.id,
            deviceFingerprint: fingerprint.visitorId,
            ipAddressHash: ipHash,
            userAgent: fingerprint.userAgent,
            screenResolution: fingerprint.screenResolution,
            timezone: fingerprint.timezone,
            platform: fingerprint.platform,
          },
        });
      }

      // Generate JWT
      const token = generateAccessToken({
        userId: user.id,
        email: user.email,
        planType: user.planType,
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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LOGIN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async login(data: LoginData) {
    const { email, password, fingerprint, ipAddress } = data;

    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          name: true,
          planType: true,
          planStatus: true,
          authProvider: true,
          securityStatus: true,
          region: true,
          currency: true,
          country: true,
          countryName: true,
          timezone: true,
          emailVerified: true,
          mobileVerified: true,
          deviceFingerprint: true,
          accountFlagged: true,
        },
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      if (!user.password) {
        throw new Error('Please login with Google');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      if (user.securityStatus === SecurityStatus.BLOCKED) {
        throw new Error('Your account has been blocked. Please contact support.');
      }

      if (user.accountFlagged) {
        console.warn(`[AuthService] Flagged account login: ${user.id}`);
      }

      if (!isPlanActive(user.planStatus)) {
        throw new Error('Your subscription is inactive. Please renew your plan.');
      }

      // Update login tracking
      const ipHash = ipAddress ? this.hashIP(ipAddress) : null;
      const updateData: any = {
        lastLoginIP: ipHash,
        lastLoginAt: new Date(),
        sessionCount: { increment: 1 },
      };

      if (fingerprint?.visitorId && !user.deviceFingerprint) {
        updateData.deviceFingerprint = fingerprint.visitorId;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      // Log suspicious login (different device)
      if (
        fingerprint?.visitorId &&
        user.deviceFingerprint &&
        fingerprint.visitorId !== user.deviceFingerprint
      ) {
        await prisma.securityLog.create({
          data: {
            userId: user.id,
            ipAddress: ipHash || 'unknown',
            threatType: 'SUSPICIOUS_LOGIN',
            severity: 'MEDIUM',
            userInput: fingerprint.visitorId,
            sanitizedInput: fingerprint.visitorId,
            matchedPatterns: ['different_device'],
            detectionMethod: ['fingerprint_mismatch'],
            wasBlocked: false,
            blockReason: `Login from different device. Known: ${user.deviceFingerprint}, New: ${fingerprint.visitorId}`,
          },
        });

        await prisma.user.update({
          where: { id: user.id },
          data: { suspiciousActivityCount: { increment: 1 } },
        });
      }

      const token = generateAccessToken({
        userId: user.id,
        email: user.email,
        planType: user.planType,
      });

      const { password: _, deviceFingerprint: __, ...userWithoutSensitive } = user;

      return {
        success: true,
        token,
        user: userWithoutSensitive,
      };
    } catch (error: any) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LEGACY LOGIN (backward compatible)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async loginLegacy(email: string, password: string) {
    return this.login({ email, password });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // USER PROFILE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async getUserById(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          planType: true,
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
          emailVerified: true,
          mobileVerified: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const accountAgeDays = this.getAccountAgeDays(user.createdAt);

      return {
        ...user,
        accountAgeDays,
        eligibility: {
          canPurchaseBoosters:
            accountAgeDays >= ACCOUNT_ELIGIBILITY.minAccountAgeDaysForBoosters &&
            user.mobileVerified,
          boosterRequirements: {
            minAccountAgeDays: ACCOUNT_ELIGIBILITY.minAccountAgeDaysForBoosters,
            currentAgeDays: accountAgeDays,
            mobileVerified: user.mobileVerified,
            emailVerified: user.emailVerified,
          },
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  }

  async getProfile(userId: string) {
    return this.getUserById(userId);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REGION MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
      return prisma.user.update({
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
    } catch (error: any) {
      throw new Error(`Failed to update region: ${error.message}`);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VERIFICATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async verifyEmail(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });
  }

  async verifyMobile(userId: string, mobileNumber?: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        mobileVerified: true,
        mobileNumber: mobileNumber || undefined,
      },
    });
  }

  async getVerificationStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        emailVerified: true,
        mobileVerified: true,
        createdAt: true,
      },
    });

    if (!user) throw new Error('User not found');

    const accountAgeDays = this.getAccountAgeDays(user.createdAt);

    return {
      emailVerified: user.emailVerified,
      mobileVerified: user.mobileVerified,
      accountAgeDays,
      canPurchaseBoosters:
        accountAgeDays >= ACCOUNT_ELIGIBILITY.minAccountAgeDaysForBoosters &&
        user.mobileVerified,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TRIAL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

      if (!user || user.trialUsed || !isPlanActive(user.planStatus)) {
        return false;
      }

      return user.trialEndDate ? user.trialEndDate > new Date() : false;
    } catch (error: any) {
      console.error('[AuthService] Error checking trial:', error);
      return false;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ADMIN: DEVICE BLOCKING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async blockDevice(fingerprint: string, reason: string, blockedBy: string): Promise<void> {
    await prisma.blockedDevice.create({
      data: { fingerprint, reason, blockedBy },
    });
  }

  async unblockDevice(fingerprint: string): Promise<void> {
    await prisma.blockedDevice.delete({
      where: { fingerprint },
    });
  }

  async getBlockedDevices() {
    return prisma.blockedDevice.findMany({
      orderBy: { blockedAt: 'desc' },
    });
  }
}

export default new AuthService();