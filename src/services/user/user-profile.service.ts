// src/services/user-profile.service.ts
// SORIVA Backend - User Profile Service (MAIN ORCHESTRATOR)
// 100% Dynamic | Class-Based | Singleton Pattern | Production-Ready

import {
  UserProfile,
  UserNameInfo,
  UserPreferences,
  ProfileCompleteness,
  ProfileStatus,
  HeaderDisplayData,
  NameDetectionResult,
  ProfileUpdateRequest,
  ProfileRetrievalOptions,
  Gender,
  NameConfidence,
  NameSource,
  DetectedLanguage,
  BotResponseLanguage,
  DEFAULT_USER_PREFERENCES,
  DEFAULT_PROFILE_COMPLETENESS,
  UserProfileData,
  NameExtractionRequest,
} from '@shared/types/user-profile.types';
import { genderDetector } from '@shared/utils/gender-detector.util';
import { nameValidator } from '@shared/utils/name-validator.util';
import { PrismaClient } from '@prisma/client';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * INTERFACES
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

interface ProfileCache {
  [userId: string]: {
    profile: UserProfile;
    timestamp: number;
    ttl: number;
  };
}

interface NameDetectionOptions {
  shouldAskForName: boolean;
  priority: 'high' | 'medium' | 'low';
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * USER PROFILE SERVICE (SINGLETON - MAIN ORCHESTRATOR)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

class UserProfileService {
  private static instance: UserProfileService;
  private prisma: PrismaClient;
  private profileCache: ProfileCache;
  private readonly cacheTTL: number = 5 * 60 * 1000; // 5 minutes

  /**
   * Private constructor (Singleton pattern)
   */
  private constructor() {
    this.prisma = new PrismaClient();
    this.profileCache = {};
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): UserProfileService {
    if (!UserProfileService.instance) {
      UserProfileService.instance = new UserProfileService();
    }
    return UserProfileService.instance;
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * MAIN PROFILE METHODS
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */

  /**
   * Get user profile (with cache)
   */
  public async getProfile(userId: string, options?: ProfileRetrievalOptions): Promise<UserProfile> {
    // Check cache first
    const cached = this.getCachedProfile(userId);
    if (cached) return cached;

    // Fetch from database
    const profile = await this.fetchProfileFromDatabase(userId);

    // Cache it
    this.cacheProfile(userId, profile);

    return profile;
  }

  /**
   * Create new user profile (first-time user)
   */
  public async createProfile(userId: string, email: string): Promise<UserProfile> {
    const emailInitial = this.extractEmailInitial(email);

    const profile: UserProfile = {
      userId,
      email,
      emailInitial,
      nameInfo: null,
      preferences: { ...DEFAULT_USER_PREFERENCES },
      completeness: { ...DEFAULT_PROFILE_COMPLETENESS },
      metadata: {
        createdAt: new Date(),
        lastActiveAt: new Date(),
        totalInteractions: 0,
        firstInteractionAt: new Date(),
        isReturningUser: false,
      },
    };

    // Save to database
    await this.saveProfileToDatabase(profile);

    // Cache it
    this.cacheProfile(userId, profile);

    return profile;
  }

  /**
   * Update user profile
   */
  public async updateProfile(request: ProfileUpdateRequest): Promise<UserProfile> {
    const { userId, nameInfo, preferences } = request;

    // Get current profile
    const currentProfile = await this.getProfile(userId);

    // Update fields
    const updatedProfile: UserProfile = {
      ...currentProfile,
      nameInfo: nameInfo
        ? ({ ...currentProfile.nameInfo, ...nameInfo } as UserNameInfo)
        : currentProfile.nameInfo,
      preferences: preferences
        ? { ...currentProfile.preferences, ...preferences }
        : currentProfile.preferences,
    };

    // Recalculate completeness
    updatedProfile.completeness = this.calculateCompleteness(updatedProfile);

    // Update last active
    updatedProfile.metadata.lastActiveAt = new Date();

    // Save to database
    await this.saveProfileToDatabase(updatedProfile);

    // Update cache
    this.cacheProfile(userId, updatedProfile);

    return updatedProfile;
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * NAME DETECTION & EXTRACTION
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */

  /**
   * Extract name from message (internal method to avoid circular dependency)
   */
  private async extractNameFromMessage(
    request: NameExtractionRequest
  ): Promise<NameDetectionResult> {
    const { message, detectedLanguage } = request;

    // Simple pattern matching for name extraction
    const patterns = [
      // English
      /(?:my name is|i am|i'm|call me)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)/i,
      // Hinglish
      /(?:mera naam|mera name|naam hai)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)/i,
      // Punjabi
      /(?:mera naam)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\s+(?:hai|aa|ae)/i,
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const extractedName = match[1].trim();
        const validation = nameValidator.validate(extractedName);

        if (validation.isValid && validation.sanitizedName) {
          const genderResult = genderDetector.detectGender(validation.sanitizedName);

          return {
            detected: true,
            name: validation.sanitizedName,
            confidence: NameConfidence.HIGH,
            gender: genderResult.gender,
            genderConfidence: genderResult.confidence,
            source: NameSource.EXTRACTED,
            metadata: {
              detectedAt: new Date(),
              detectedFrom: message.substring(0, 100),
              detectionMethod: 'pattern_matching',
            },
          };
        }
      }
    }

    // No name found
    return {
      detected: false,
      name: null,
      confidence: NameConfidence.NONE,
      gender: Gender.NEUTRAL,
      genderConfidence: NameConfidence.NONE,
      source: NameSource.INFERRED,
      metadata: {
        detectedAt: new Date(),
        detectedFrom: '',
        detectionMethod: 'none',
      },
    };
  }

  /**
   * Process message and extract name if present
   */
  public async processMessageForName(
    userId: string,
    message: string,
    conversationHistory?: Array<{ role: string; content: string }>
  ): Promise<{
    nameDetected: boolean;
    profile: UserProfile;
    detectionResult?: NameDetectionResult;
  }> {
    // Get current profile
    const profile = await this.getProfile(userId);

    // If name already exists, no need to extract
    if (profile.nameInfo) {
      return {
        nameDetected: false,
        profile,
      };
    }

    // Try to extract name
    const detectionResult = await this.extractNameFromMessage({
      userId,
      message,
      conversationHistory,
      detectedLanguage: profile.preferences.detectedLanguage,
    });

    // If name detected, update profile
    if (detectionResult.detected && detectionResult.name) {
      const updatedProfile = await this.setUserName(userId, detectionResult);

      return {
        nameDetected: true,
        profile: updatedProfile,
        detectionResult,
      };
    }

    return {
      nameDetected: false,
      profile,
    };
  }

  /**
   * Set user name from detection result
   */
  public async setUserName(
    userId: string,
    detectionResult: NameDetectionResult
  ): Promise<UserProfile> {
    if (!detectionResult.detected || !detectionResult.name) {
      throw new Error('Cannot set name from unsuccessful detection');
    }

    const nameParts = detectionResult.name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

    const nameInfo: UserNameInfo = {
      fullName: detectionResult.name,
      firstName,
      lastName,
      displayName: firstName, // Use first name for display
      gender: detectionResult.gender,
      genderConfidence: detectionResult.genderConfidence,
      source: detectionResult.source,
      detectedAt: detectionResult.metadata?.detectedAt || new Date(),
      lastUpdated: new Date(),
    };

    // Update profile with name
    return await this.updateProfile({
      userId,
      nameInfo,
    });
  }

  /**
   * Manually set user name (user refuses automated detection)
   */
  public async manuallySetName(userId: string, name: string): Promise<UserProfile> {
    // Validate name
    const validation = nameValidator.validate(name);

    if (!validation.isValid || !validation.sanitizedName) {
      throw new Error(`Invalid name: ${validation.issues.join(', ')}`);
    }

    // Detect gender
    const genderResult = genderDetector.detectGender(validation.sanitizedName);

    // Create name info
    const nameParts = validation.sanitizedName.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

    const nameInfo: UserNameInfo = {
      fullName: validation.sanitizedName,
      firstName,
      lastName,
      displayName: firstName,
      gender: genderResult.gender,
      genderConfidence: genderResult.confidence,
      source: NameSource.USER_PROVIDED,
      detectedAt: new Date(),
      lastUpdated: new Date(),
    };

    // Update profile
    return await this.updateProfile({
      userId,
      nameInfo,
    });
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * HEADER DISPLAY DATA
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */

  /**
   * Get header display data for frontend
   */
  public async getHeaderDisplayData(userId: string): Promise<HeaderDisplayData> {
    const profile = await this.getProfile(userId);

    return {
      displayName: profile.nameInfo?.displayName || 'User',
      emailInitial: profile.emailInitial,
      gender: profile.nameInfo?.gender || Gender.NEUTRAL,
      isNameAvailable: !!profile.nameInfo,
    };
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * LANGUAGE DETECTION & PREFERENCES
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */

  /**
   * Update detected language
   */
  public async updateDetectedLanguage(
    userId: string,
    detectedLanguage: DetectedLanguage
  ): Promise<UserProfile> {
    return await this.updateProfile({
      userId,
      preferences: { detectedLanguage },
    });
  }

  /**
   * Update bot response language
   */
  public async updateBotResponseLanguage(
    userId: string,
    botResponseLanguage: BotResponseLanguage
  ): Promise<UserProfile> {
    return await this.updateProfile({
      userId,
      preferences: { botResponseLanguage },
    });
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * USER INTERACTION TRACKING
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */

  /**
   * Track user interaction
   */
  public async trackInteraction(userId: string): Promise<void> {
    const profile = await this.getProfile(userId);

    profile.metadata.totalInteractions += 1;
    profile.metadata.lastActiveAt = new Date();

    // Determine if returning user (visited before in last 24 hours)
    const timeSinceLastVisit = Date.now() - profile.metadata.lastActiveAt.getTime();
    profile.metadata.isReturningUser = timeSinceLastVisit > 24 * 60 * 60 * 1000;

    await this.saveProfileToDatabase(profile);
    this.cacheProfile(userId, profile);
  }

  /**
   * Check if user is first-time visitor
   */
  public async isFirstTimeUser(userId: string): Promise<boolean> {
    const profile = await this.getProfile(userId);
    return profile.metadata.totalInteractions === 0;
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * PROFILE COMPLETENESS
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */

  /**
   * Calculate profile completeness
   */
  private calculateCompleteness(profile: UserProfile): ProfileCompleteness {
    const hasName = !!profile.nameInfo;
    const hasGender = profile.nameInfo?.gender !== Gender.NEUTRAL;
    const hasDetectedLanguage = profile.preferences.detectedLanguage !== DetectedLanguage.UNKNOWN;

    const missingFields: string[] = [];
    if (!hasName) missingFields.push('name');
    if (!hasGender) missingFields.push('gender');
    if (!hasDetectedLanguage) missingFields.push('language');

    let status: ProfileStatus;
    if (hasName && hasGender && hasDetectedLanguage) {
      status = ProfileStatus.COMPLETE;
    } else if (hasName) {
      status = ProfileStatus.PARTIAL;
    } else {
      status = ProfileStatus.INCOMPLETE;
    }

    const completionPercentage = Math.round(((3 - missingFields.length) / 3) * 100);

    return {
      status,
      hasName,
      hasGender,
      hasDetectedLanguage,
      completionPercentage,
      missingFields,
    };
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * DATABASE OPERATIONS
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */

  /**
   * Fetch profile from database
   */
  private async fetchProfileFromDatabase(userId: string): Promise<UserProfile> {
    try {
      // Try to find user in database
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          // Add other fields as per your schema
        },
      });

      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }

      // Extract email initial
      const emailInitial = this.extractEmailInitial(user.email);

      // Parse stored name info if exists
      let nameInfo: UserNameInfo | null = null;
      if (user.name) {
        const nameParts = user.name.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

        const genderResult = genderDetector.detectGender(user.name);

        nameInfo = {
          fullName: user.name,
          firstName,
          lastName,
          displayName: firstName,
          gender: genderResult.gender,
          genderConfidence: genderResult.confidence,
          source: NameSource.USER_PROVIDED,
          detectedAt: new Date(),
          lastUpdated: new Date(),
        };
      }

      // Build profile
      const profile: UserProfile = {
        userId: user.id,
        email: user.email,
        emailInitial,
        nameInfo,
        preferences: { ...DEFAULT_USER_PREFERENCES },
        completeness: this.calculateCompleteness({
          userId: user.id,
          email: user.email,
          emailInitial,
          nameInfo,
          preferences: DEFAULT_USER_PREFERENCES,
          completeness: DEFAULT_PROFILE_COMPLETENESS,
          metadata: {
            createdAt: new Date(),
            lastActiveAt: new Date(),
            totalInteractions: 0,
            firstInteractionAt: new Date(),
            isReturningUser: false,
          },
        }),
        metadata: {
          createdAt: new Date(),
          lastActiveAt: new Date(),
          totalInteractions: 0,
          firstInteractionAt: new Date(),
          isReturningUser: false,
        },
      };

      return profile;
    } catch (error) {
      console.error('[UserProfileService] Database fetch error:', error);
      throw error;
    }
  }

  /**
   * Save profile to database
   */
  private async saveProfileToDatabase(profile: UserProfile): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: profile.userId },
        data: {
          email: profile.email,
          name: profile.nameInfo?.fullName || null,
          // Add other fields as per your schema
        },
      });
    } catch (error) {
      console.error('[UserProfileService] Database save error:', error);
      throw error;
    }
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * CACHE MANAGEMENT
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */

  /**
   * Get cached profile
   */
  private getCachedProfile(userId: string): UserProfile | null {
    const cached = this.profileCache[userId];

    if (!cached) return null;

    // Check if expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      delete this.profileCache[userId];
      return null;
    }

    return cached.profile;
  }

  /**
   * Cache profile
   */
  private cacheProfile(userId: string, profile: UserProfile): void {
    this.profileCache[userId] = {
      profile,
      timestamp: Date.now(),
      ttl: this.cacheTTL,
    };
  }

  /**
   * Clear cache for user
   */
  public clearCache(userId: string): void {
    delete this.profileCache[userId];
  }

  /**
   * Clear all cache
   */
  public clearAllCache(): void {
    this.profileCache = {};
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * HELPER METHODS
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */

  /**
   * Extract first letter from email
   */
  private extractEmailInitial(email: string): string {
    if (!email || email.length === 0) return 'U';
    return email.charAt(0).toUpperCase();
  }

  /**
   * Get service statistics
   */
  public getStats(): {
    cachedProfiles: number;
    cacheHitRate: number;
  } {
    return {
      cachedProfiles: Object.keys(this.profileCache).length,
      cacheHitRate: 0, // TODO: Implement proper tracking
    };
  }

  /**
   * Cleanup - close database connection
   */
  public async cleanup(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * EXPORT SINGLETON INSTANCE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

export const userProfileService = UserProfileService.getInstance();
