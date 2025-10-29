// src/types/user-profile.types.ts
// SORIVA Backend - User Profile Type Definitions
// 100% Type-Safe | Comprehensive | Production-Ready

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ENUMS
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

/**
 * User gender types
 */
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  NEUTRAL = 'neutral', // For unisex names or when uncertain
}

/**
 * Name detection confidence levels
 */
export enum NameConfidence {
  HIGH = 'high', // 90-100% confident
  MEDIUM = 'medium', // 70-89% confident
  LOW = 'low', // 50-69% confident
  NONE = 'none', // <50% confident
}

/**
 * Profile completeness status
 */
export enum ProfileStatus {
  INCOMPLETE = 'incomplete', // Missing name
  PARTIAL = 'partial', // Has name, missing other info
  COMPLETE = 'complete', // All basic info present
}

/**
 * Name source - where did we get the name from?
 */
export enum NameSource {
  USER_PROVIDED = 'user_provided', // User explicitly told their name
  EXTRACTED = 'extracted', // Extracted from conversation
  OAUTH = 'oauth', // From Google/OAuth profile
  INFERRED = 'inferred', // Inferred from context
}

/**
 * User's detected language (what they speak)
 */
export enum DetectedLanguage {
  ENGLISH = 'english',
  HINDI = 'hindi',
  HINGLISH = 'hinglish',
  PUNJABI = 'punjabi',
  PUNJABI_ENGLISH = 'punjabi_english', // Punjabi in English script
  UNKNOWN = 'unknown',
}

/**
 * Bot's response language (ONLY English or Hinglish for token optimization)
 */
export enum BotResponseLanguage {
  ENGLISH = 'english', // Pure English responses
  HINGLISH = 'hinglish', // Hindi words in English script
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * CORE INTERFACES
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

/**
 * Name detection result
 */
export interface NameDetectionResult {
  detected: boolean;
  name: string | null;
  confidence: NameConfidence;
  gender: Gender;
  genderConfidence: NameConfidence;
  source: NameSource;
  alternativeNames?: string[]; // If multiple names detected
  metadata?: {
    detectedAt: Date;
    detectedFrom: string; // Message where name was found
    detectionMethod: string; // NLP, regex, etc.
  };
}

/**
 * User name information
 */
export interface UserNameInfo {
  fullName: string;
  firstName: string;
  lastName?: string;
  displayName: string; // What to show in header
  gender: Gender;
  genderConfidence: NameConfidence;
  source: NameSource;
  detectedAt: Date;
  lastUpdated: Date;
}

/**
 * User preferences
 */
export interface UserPreferences {
  detectedLanguage: DetectedLanguage; // What user speaks
  botResponseLanguage: BotResponseLanguage; // What bot responds in
  showNameInHeader: boolean; // Privacy setting
  allowNameStorage: boolean; // GDPR compliance
  preferredGreeting?: string; // Custom greeting preference
  tonePreference?: 'formal' | 'casual' | 'auto'; // Communication style
}

/**
 * User profile completeness
 */
export interface ProfileCompleteness {
  status: ProfileStatus;
  hasName: boolean;
  hasGender: boolean;
  hasDetectedLanguage: boolean;
  completionPercentage: number; // 0-100
  missingFields: string[];
}

/**
 * Complete user profile
 */
export interface UserProfile {
  userId: string;
  email: string;
  emailInitial: string; // First letter for chat icon
  nameInfo: UserNameInfo | null;
  preferences: UserPreferences;
  completeness: ProfileCompleteness;
  metadata: {
    createdAt: Date;
    lastActiveAt: Date;
    totalInteractions: number;
    firstInteractionAt: Date;
    isReturningUser: boolean;
  };
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * REQUEST/RESPONSE TYPES
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

/**
 * Request to extract name from message
 */
export interface NameExtractionRequest {
  userId: string;
  message: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  detectedLanguage?: DetectedLanguage;
}

/**
 * Request to update user profile
 */
export interface ProfileUpdateRequest {
  userId: string;
  nameInfo?: Partial<UserNameInfo>;
  preferences?: Partial<UserPreferences>;
}

/**
 * Profile retrieval options
 */
export interface ProfileRetrievalOptions {
  includeMetadata?: boolean;
  includePreferences?: boolean;
  includeCompleteness?: boolean;
}

/**
 * Header display data
 */
export interface HeaderDisplayData {
  displayName: string; // What to show (Name or "User")
  emailInitial: string; // First letter of email
  gender: Gender; // For tone/personality
  isNameAvailable: boolean;
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * NAME VALIDATION & DETECTION TYPES
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

/**
 * Name validation result
 */
export interface NameValidationResult {
  isValid: boolean;
  sanitizedName: string | null;
  issues: string[]; // List of validation issues
  suggestions?: string[]; // Suggested corrections
}

/**
 * Gender detection result
 */
export interface GenderDetectionResult {
  gender: Gender;
  confidence: NameConfidence;
  source: 'database' | 'ml' | 'api' | 'default';
  metadata?: {
    matchedPattern?: string;
    alternativeGenders?: Gender[];
  };
}

/**
 * Name pattern for regex matching
 */
export interface NamePattern {
  pattern: RegExp;
  priority: number; // Higher = check first
  language: DetectedLanguage;
  examples: string[];
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * GREETING & INTERACTION TYPES
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

/**
 * Greeting context
 */
export interface GreetingContext {
  userId: string;
  profile: UserProfile;
  isFirstInteraction: boolean;
  isReturningUser: boolean;
  timeSinceLastVisit?: number; // In milliseconds
  detectedLanguage: DetectedLanguage;
  botResponseLanguage: BotResponseLanguage;
}

/**
 * Name request prompt
 */
export interface NameRequestPrompt {
  message: string; // The actual prompt text
  language: BotResponseLanguage; // Bot responds in English or Hinglish only
  tone: 'formal' | 'casual' | 'friendly';
  includeOptOut: boolean; // "You don't have to share if you don't want to"
}

/**
 * Welcome message
 */
export interface WelcomeMessage {
  greeting: string; // Main greeting text
  personalizedMessage?: string; // Additional personalized content
  suggestedActions?: string[]; // Conversation starters
  tone: 'formal' | 'casual' | 'friendly';
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * DATABASE STORAGE TYPES
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

/**
 * User profile data for database storage
 */
export interface UserProfileData {
  userId: string;
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  gender?: Gender;
  genderConfidence?: NameConfidence;
  nameSource?: NameSource;
  detectedLanguage?: DetectedLanguage; // What user speaks
  botResponseLanguage?: BotResponseLanguage; // What bot responds in
  showNameInHeader?: boolean;
  allowNameStorage?: boolean;
  nameDetectedAt?: Date;
  lastUpdatedAt?: Date;
  metadata?: Record<string, any>;
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ERROR TYPES
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

/**
 * Profile service errors
 */
export enum ProfileErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_NAME = 'INVALID_NAME',
  DATABASE_ERROR = 'DATABASE_ERROR',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  EXTRACTION_FAILED = 'EXTRACTION_FAILED',
}

/**
 * Profile error
 */
export interface ProfileError {
  code: ProfileErrorCode;
  message: string;
  details?: any;
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ANALYTICS & TRACKING TYPES
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

/**
 * Name detection analytics
 */
export interface NameDetectionAnalytics {
  userId: string;
  detectionAttempts: number;
  successfulDetections: number;
  failedDetections: number;
  averageConfidence: number;
  detectionSources: Record<NameSource, number>;
  genderDistribution: Record<Gender, number>;
}

/**
 * Profile completion analytics
 */
export interface ProfileCompletionAnalytics {
  totalUsers: number;
  completeProfiles: number;
  partialProfiles: number;
  incompleteProfiles: number;
  averageCompletionPercentage: number;
  averageTimeToCompletion: number; // In milliseconds
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * EXPORT DEFAULTS
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

/**
 * Default user preferences
 */
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  detectedLanguage: DetectedLanguage.UNKNOWN,
  botResponseLanguage: BotResponseLanguage.ENGLISH, // Default to English for token optimization
  showNameInHeader: true,
  allowNameStorage: true,
  tonePreference: 'auto',
};

/**
 * Default profile completeness
 */
export const DEFAULT_PROFILE_COMPLETENESS: ProfileCompleteness = {
  status: ProfileStatus.INCOMPLETE,
  hasName: false,
  hasGender: false,
  hasDetectedLanguage: false,
  completionPercentage: 0,
  missingFields: ['name', 'gender', 'detectedLanguage'],
};
