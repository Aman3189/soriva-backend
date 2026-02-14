/**
 * ==========================================
 * OAUTH SERVICE - MANUAL OAUTH WITH PKCE
 * ==========================================
 * Implements OAuth 2.0 with PKCE (RFC 7636)
 * Supports: Google, GitHub
 * 
 * UPDATED: January 19, 2026
 * ✅ FIXED: Now imports limits from plans.ts (single source of truth)
 * ✅ FIXED: No more hardcoded word limits
 * ✅ FIXED: Dynamic plan configuration
 */

import { prisma } from '../../config/prisma';
import { generateAccessToken } from '@/shared/utils/jwt.util';
import { PKCEUtil } from '@/shared/utils/pkce-util';
import { PlanType, PlanStatus, SecurityStatus, ActivityTrend, Region, Currency } from '@prisma/client';

// ✅ IMPORT FROM PLANS.TS - SINGLE SOURCE OF TRUTH
import { 
  PLANS_STATIC_CONFIG, 
  getPlanPricing,
  Region as PlanRegion 
} from '../../constants/plans';

// ==========================================
// HELPER: GET PLAN LIMITS FROM plans.ts
// ==========================================

/**
 * Get plan limits dynamically from plans.ts
 * This ensures all limits come from single source of truth
 */
function getPlanLimits(planType: PlanType, region: Region = Region.IN) {
  // Map Prisma Region to plans.ts Region
  const planRegion = region === Region.IN ? PlanRegion.INDIA : PlanRegion.INTERNATIONAL;
  
  // Get pricing/limits from plans.ts
  const pricing = getPlanPricing(planType, planRegion);
  
  if (!pricing || !pricing.limits) {
    // Fallback defaults if plan not found (shouldn't happen)
    console.warn(`⚠️ Plan limits not found for ${planType}, using defaults`);
    return {
      monthlyWords: 45000,
      dailyWords: 1500,
      monthlyTokens: 0,
      dailyTokens: 0,
    };
  }
  
  return {
    monthlyWords: pricing.limits.monthlyWords || 0,
    dailyWords: pricing.limits.dailyWords || 0,
    monthlyTokens: pricing.limits.monthlyTokens || 0,
    dailyTokens: pricing.limits.dailyTokens || 0,
  };
}

// ==========================================
// TYPE DEFINITIONS
// ==========================================

interface TokensResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  id_token?: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

interface GitHubUserInfo {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
}

interface RegionData {
  region: Region;
  currency: Currency;
}

// ==========================================
// OAUTH SERVICE CLASS
// ==========================================

export class OAuthService {
  private pkceUtil: PKCEUtil;

  constructor() {
    this.pkceUtil = new PKCEUtil();
  }

  /**
   * ==========================================
   * GOOGLE OAUTH WITH PKCE
   * ==========================================
   */

  /**
   * Step 1: Generate Google OAuth URL with PKCE
   */
  public async generateGoogleAuthUrl(): Promise<{
    url: string;
    codeVerifier: string;
    state: string;
  }> {
    try {
      // Generate PKCE parameters
      const codeVerifier = this.pkceUtil.generateCodeVerifier();
      const codeChallenge = this.pkceUtil.generateCodeChallenge(codeVerifier);
      const state = this.pkceUtil.generateState();

      // Build Google OAuth URL
      const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL!,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256', // SHA-256
      });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

      console.log('🔐 Google OAuth URL generated with PKCE');

      return {
        url: authUrl,
        codeVerifier, // Client must store this temporarily
        state,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to generate Google auth URL:', error);
      throw new Error(`Failed to generate Google auth URL: ${errorMessage}`);
    }
  }

  /**
   * Step 2: Handle Google OAuth callback
   */
  public async handleGoogleCallback(
    code: string,
    codeVerifier: string,
    state: string,
    regionData?: RegionData
  ): Promise<{
    success: boolean;
    token: string;
    user: any;
  }> {
    try {
      console.log('🔄 Processing Google OAuth callback with PKCE...');

      // Exchange authorization code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: process.env.GOOGLE_CALLBACK_URL!,
          grant_type: 'authorization_code',
          code_verifier: codeVerifier, // ← PKCE verification
        }),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.json() as { error?: string; error_description?: string };
        console.error('❌ Token exchange failed:', error);
        throw new Error(`Token exchange failed: ${error.error_description || error.error}`);
      }

      const tokens = await tokenResponse.json() as OAuthTokenResponse;
      console.log('✅ Tokens received from Google');

      // Get user info from Google
      const userInfoResponse = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        }
      );

      if (!userInfoResponse.ok) {
        throw new Error('Failed to fetch user info from Google');
      }

      const userInfo = await userInfoResponse.json() as GoogleUserInfo;
      console.log(`📧 User info received: ${userInfo.email}`);

      // Default region if not provided
      const userRegion: RegionData = regionData || {
        region: Region.IN,
        currency: Currency.INR,
      };

      // Find or create user
      let user = await prisma.user.findUnique({
        where: { googleId: userInfo.id },
      });

      const now = new Date();
      const defaultPlan = PlanType.STARTER;

      if (!user) {
        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: userInfo.email },
        });

        if (existingUser) {
          // Link Google account to existing user
          console.log(`🔗 Linking Google to existing user: ${userInfo.email}`);
          user = await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              googleId: userInfo.id,
              googleEmail: userInfo.email,
              googleAvatar: userInfo.picture,
              authProvider: 'google',
              name: userInfo.name || existingUser.name,
            },
          });
        } else {
          // Create new user with STARTER plan
          console.log(`🆕 Creating new user: ${userInfo.email}`);
          user = await prisma.user.create({
            data: {
              email: userInfo.email,
              googleId: userInfo.id,
              googleEmail: userInfo.email,
              googleAvatar: userInfo.picture,
              name: userInfo.name,
              authProvider: 'google',

              // Region
              region: userRegion.region,
              currency: userRegion.currency,

              // STARTER plan
              planType: defaultPlan,
              planStatus: PlanStatus.ACTIVE,
              planStartDate: now,
              planEndDate: null,

              // Security defaults
              securityStatus: SecurityStatus.TRUSTED,
              suspiciousActivityCount: 0,
              jailbreakAttempts: 0,

              // Activity
              activityTrend: ActivityTrend.NEW,
              sessionCount: 0,

              // Memory & response
              memoryDays: 7,
              responseDelay: 0,
            },
          });

          // ✅ GET LIMITS FROM plans.ts - NOT HARDCODED!
          const planLimits = getPlanLimits(defaultPlan, userRegion.region);
          
          console.log(`📊 Setting up usage with limits from plans.ts:`, {
            plan: defaultPlan,
            monthlyLimit: planLimits.monthlyWords,
            dailyLimit: planLimits.dailyWords,
          });

          // Initialize usage tracking with DYNAMIC limits
          await prisma.usage.create({
            data: {
              userId: user.id,
              planName: defaultPlan.toLowerCase(),
              wordsUsed: 0,
              dailyWordsUsed: 0,
              remainingWords: planLimits.dailyWords,           // ✅ FROM plans.ts
              monthlyLimit: planLimits.monthlyWords,           // ✅ FROM plans.ts
              dailyLimit: planLimits.dailyWords,               // ✅ FROM plans.ts
              lastDailyReset: now,
              lastMonthlyReset: now,
              cycleStartDate: now,
              cycleEndDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
            },
          });

          console.log('✅ User created with STARTER plan (limits from plans.ts)');
        }
        } else {
          // 🔄 SYNC: Refresh user data on every login
          console.log(`✅ Existing user logged in: ${user.email}`);
          
          // Update last login timestamp
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              lastLoginAt: now,
              googleAvatar: userInfo.picture, // Keep avatar fresh
            },
          });
          
          console.log(`🔄 User synced: planType=${user.planType}`);
        }

      // Generate JWT token
      const jwtToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        planType: user.planType,
      });

      console.log('✅ JWT token generated');

      return {
        success: true,
        token: jwtToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.googleAvatar,
          planType: user.planType,
          planStatus: user.planStatus,
          authProvider: user.authProvider,
          region: user.region,
          currency: user.currency,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Google OAuth callback failed:', error);
      throw new Error(`Google OAuth failed: ${errorMessage}`);
    }
  }

  /**
   * ==========================================
   * GITHUB OAUTH WITH PKCE
   * ==========================================
   */

  /**
   * Step 1: Generate GitHub OAuth URL with PKCE
   */
  public async generateGitHubAuthUrl(): Promise<{
    url: string;
    codeVerifier: string;
    state: string;
  }> {
    try {
      const codeVerifier = this.pkceUtil.generateCodeVerifier();
      const codeChallenge = this.pkceUtil.generateCodeChallenge(codeVerifier);
      const state = this.pkceUtil.generateState();

      const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID!,
        redirect_uri: process.env.GITHUB_CALLBACK_URL!,
        scope: 'user:email',
        state: state,
        // Note: GitHub doesn't officially support PKCE yet,
        // but we still generate parameters for future compatibility
      });

      const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

      console.log('🔐 GitHub OAuth URL generated');

      return {
        url: authUrl,
        codeVerifier,
        state,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to generate GitHub auth URL:', error);
      throw new Error(`Failed to generate GitHub auth URL: ${errorMessage}`);
    }
  }

  /**
   * Step 2: Handle GitHub OAuth callback
   */
  public async handleGitHubCallback(
    code: string,
    state: string,
    regionData?: RegionData
  ): Promise<{
    success: boolean;
    token: string;
    user: any;
  }> {
    try {
      console.log('🔄 Processing GitHub OAuth callback...');

      // Exchange code for token
      const tokenResponse = await fetch(
        'https://github.com/login/oauth/access_token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            client_id: process.env.GITHUB_CLIENT_ID!,
            client_secret: process.env.GITHUB_CLIENT_SECRET!,
            code,
            redirect_uri: process.env.GITHUB_CALLBACK_URL!,
          }),
        }
      );

      const tokens = await tokenResponse.json() as TokensResponse;

      if (tokens.error) {
        throw new Error(tokens.error_description || tokens.error);
      }

      console.log('✅ Tokens received from GitHub');

      // Get user info
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          Accept: 'application/json',
        },
      });

      const userInfo = await userResponse.json() as GitHubUserInfo;

      // Get user email (if not public)
      let userEmail = userInfo.email;
      if (!userEmail) {
        const emailResponse = await fetch('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            Accept: 'application/json',
          },
        });
        const emails = await emailResponse.json() as GitHubEmail[];
        const primaryEmail = emails.find((e) => e.primary);
        
        userEmail = primaryEmail?.email || null;
      }

      if (!userEmail) {
        throw new Error('No email found from GitHub');
      }

      console.log(`📧 User info received: ${userEmail}`);

      const userRegion: RegionData = regionData || {
        region: Region.IN,
        currency: Currency.INR,
      };

      // Find or create user
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { githubId: userInfo.id.toString() },
            { email: userEmail },
          ],
        },
      });

      const now = new Date();
      const defaultPlan = PlanType.STARTER;

      if (!user) {
        console.log(`🆕 Creating new GitHub user: ${userEmail}`);
        user = await prisma.user.create({
          data: {
            email: userEmail,
            githubId: userInfo.id.toString(),
            name: userInfo.name || userInfo.login,
            googleAvatar: userInfo.avatar_url,
            authProvider: 'github',

            region: userRegion.region,
            currency: userRegion.currency,

            planType: defaultPlan,
            planStatus: PlanStatus.ACTIVE,
            planStartDate: now,

            securityStatus: SecurityStatus.TRUSTED,
            activityTrend: ActivityTrend.NEW,
            memoryDays: 7,
            responseDelay: 0,
          },
        });

        // ✅ GET LIMITS FROM plans.ts - NOT HARDCODED!
        const planLimits = getPlanLimits(defaultPlan, userRegion.region);
        
        console.log(`📊 Setting up usage with limits from plans.ts:`, {
          plan: defaultPlan,
          monthlyLimit: planLimits.monthlyWords,
          dailyLimit: planLimits.dailyWords,
        });

        await prisma.usage.create({
          data: {
            userId: user.id,
            planName: defaultPlan.toLowerCase(),
            wordsUsed: 0,
            dailyWordsUsed: 0,
            remainingWords: planLimits.dailyWords,           // ✅ FROM plans.ts
            monthlyLimit: planLimits.monthlyWords,           // ✅ FROM plans.ts
            dailyLimit: planLimits.dailyWords,               // ✅ FROM plans.ts
            lastDailyReset: now,
            lastMonthlyReset: now,
            cycleStartDate: now,
            cycleEndDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          },
        });

        console.log('✅ GitHub user created with STARTER plan (limits from plans.ts)');
      } else if (!user.githubId) {
        console.log(`🔗 Linking GitHub to existing user: ${userEmail}`);
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            githubId: userInfo.id.toString(),
            authProvider: 'github',
          },
        });
      }

      const jwtToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        planType: user.planType,
      });

      return {
        success: true,
        token: jwtToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.googleAvatar,
          planType: user.planType,
          planStatus: user.planStatus,
          authProvider: user.authProvider,
          region: user.region,
          currency: user.currency,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ GitHub OAuth callback failed:', error);
      throw new Error(`GitHub OAuth failed: ${errorMessage}`);
    }
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          googleAvatar: true,
          planType: true,
          planStatus: true,
          authProvider: true,
          region: true,
          currency: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch user profile: ${errorMessage}`);
    }
  }
}

export default new OAuthService();