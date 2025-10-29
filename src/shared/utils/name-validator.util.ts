// src/utils/name-validator.util.ts
// SORIVA Backend - Name Validation Utility
// 100% Dynamic | Class-Based | Singleton Pattern | Production-Ready

import { NameValidationResult } from '@shared/types/user-profile.types';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * INTERFACES
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

interface ValidationRule {
  name: string;
  validate: (name: string) => boolean;
  errorMessage: string;
  priority: number;
}

interface SanitizationRule {
  name: string;
  transform: (name: string) => string;
  priority: number;
}

interface NameValidatorConfig {
  minLength: number;
  maxLength: number;
  allowNumbers: boolean;
  allowSpecialChars: boolean;
  allowMultipleSpaces: boolean;
  requireCapitalization: boolean;
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * NAME VALIDATOR CLASS (SINGLETON)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

class NameValidator {
  private static instance: NameValidator;
  private config: NameValidatorConfig;
  private validationRules: ValidationRule[];
  private sanitizationRules: SanitizationRule[];
  private isInitialized: boolean = false;

  // Blacklisted words/patterns
  private readonly blacklistedWords: Set<string>;
  private readonly suspiciousPatterns: RegExp[];

  /**
   * Private constructor (Singleton pattern)
   */
  private constructor() {
    // Default configuration
    this.config = {
      minLength: 2,
      maxLength: 50,
      allowNumbers: false,
      allowSpecialChars: false,
      allowMultipleSpaces: false,
      requireCapitalization: true,
    };

    this.validationRules = [];
    this.sanitizationRules = [];

    // Initialize blacklisted words
    this.blacklistedWords = new Set([
      'user',
      'admin',
      'bot',
      'test',
      'demo',
      'anonymous',
      'guest',
      'default',
      'system',
      'soriva',
      'ai',
      'assistant',
      'null',
      'undefined',
      'none',
      // Add abusive words here if needed
    ]);

    // Suspicious patterns
    this.suspiciousPatterns = [
      /^test\d+$/i, // test1, test2, etc.
      /^user\d+$/i, // user1, user2, etc.
      /^[a-z]{1,2}$/i, // Single or double letters
      /^\d+$/, // Only numbers
      /^(.)\1{4,}$/, // Repeated characters (aaaaa)
      /^[^a-z]+$/i, // No letters at all
    ];

    this.initialize();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): NameValidator {
    if (!NameValidator.instance) {
      NameValidator.instance = new NameValidator();
    }
    return NameValidator.instance;
  }

  /**
   * Initialize validation and sanitization rules
   */
  private initialize(): void {
    if (this.isInitialized) return;

    this.loadValidationRules();
    this.loadSanitizationRules();

    this.isInitialized = true;
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * MAIN VALIDATION METHOD
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */

  /**
   * Validate and sanitize name
   */
  public validate(name: string): NameValidationResult {
    if (!name || typeof name !== 'string') {
      return this.createInvalidResult(['Name is required'], null);
    }

    // First, sanitize the name
    const sanitized = this.sanitize(name);

    // Then validate
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Run all validation rules
    const sortedRules = [...this.validationRules].sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      if (!rule.validate(sanitized)) {
        issues.push(rule.errorMessage);
      }
    }

    // Check for blacklisted words
    const blacklistIssue = this.checkBlacklist(sanitized);
    if (blacklistIssue) {
      issues.push(blacklistIssue);
    }

    // Check for suspicious patterns
    const suspiciousIssue = this.checkSuspiciousPatterns(sanitized);
    if (suspiciousIssue) {
      issues.push(suspiciousIssue);
    }

    // Generate suggestions if needed
    if (issues.length > 0) {
      suggestions.push(...this.generateSuggestions(sanitized));
    }

    // Return result
    if (issues.length === 0) {
      return this.createValidResult(sanitized);
    } else {
      return this.createInvalidResult(issues, sanitized, suggestions);
    }
  }

  /**
   * Batch validate multiple names
   */
  public validateBatch(names: string[]): NameValidationResult[] {
    return names.map((name) => this.validate(name));
  }

  /**
   * Quick validation (just check if valid, no details)
   */
  public isValid(name: string): boolean {
    return this.validate(name).isValid;
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * SANITIZATION METHODS
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */

  /**
   * Sanitize name (remove unwanted characters, normalize)
   */
  public sanitize(name: string): string {
    if (!name || typeof name !== 'string') return '';

    let sanitized = name;

    // Apply all sanitization rules in priority order
    const sortedRules = [...this.sanitizationRules].sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      sanitized = rule.transform(sanitized);
    }

    return sanitized;
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * VALIDATION RULES
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */

  /**
   * Load validation rules
   */
  private loadValidationRules(): void {
    this.validationRules = [
      // Rule 1: Not empty
      {
        name: 'not-empty',
        validate: (name: string) => name.trim().length > 0,
        errorMessage: 'Name cannot be empty',
        priority: 100,
      },

      // Rule 2: Minimum length
      {
        name: 'min-length',
        validate: (name: string) => name.trim().length >= this.config.minLength,
        errorMessage: `Name must be at least ${this.config.minLength} characters`,
        priority: 90,
      },

      // Rule 3: Maximum length
      {
        name: 'max-length',
        validate: (name: string) => name.trim().length <= this.config.maxLength,
        errorMessage: `Name must be less than ${this.config.maxLength} characters`,
        priority: 90,
      },

      // Rule 4: Contains at least one letter
      {
        name: 'has-letters',
        validate: (name: string) => /[a-zA-Z]/.test(name),
        errorMessage: 'Name must contain at least one letter',
        priority: 85,
      },

      // Rule 5: No numbers (if not allowed)
      {
        name: 'no-numbers',
        validate: (name: string) => this.config.allowNumbers || !/\d/.test(name),
        errorMessage: 'Name cannot contain numbers',
        priority: 80,
      },

      // Rule 6: No special characters (if not allowed)
      {
        name: 'no-special-chars',
        validate: (name: string) => this.config.allowSpecialChars || /^[a-zA-Z\s'-]+$/.test(name),
        errorMessage: 'Name can only contain letters, spaces, hyphens, and apostrophes',
        priority: 80,
      },

      // Rule 7: No excessive spaces
      {
        name: 'no-excessive-spaces',
        validate: (name: string) => !/\s{3,}/.test(name),
        errorMessage: 'Name cannot have excessive spaces',
        priority: 70,
      },

      // Rule 8: No leading/trailing spaces
      {
        name: 'no-edge-spaces',
        validate: (name: string) => name === name.trim(),
        errorMessage: 'Name cannot start or end with spaces',
        priority: 70,
      },

      // Rule 9: Valid word count (1-4 words)
      {
        name: 'word-count',
        validate: (name: string) => {
          const words = name.trim().split(/\s+/);
          return words.length >= 1 && words.length <= 4;
        },
        errorMessage: 'Name should have 1-4 words',
        priority: 60,
      },

      // Rule 10: No repeated characters
      {
        name: 'no-repeated-chars',
        validate: (name: string) => !/(.)\1{4,}/.test(name),
        errorMessage: 'Name has too many repeated characters',
        priority: 50,
      },
    ];
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * SANITIZATION RULES
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */

  /**
   * Load sanitization rules
   */
  private loadSanitizationRules(): void {
    this.sanitizationRules = [
      // Rule 1: Trim whitespace
      {
        name: 'trim',
        transform: (name: string) => name.trim(),
        priority: 100,
      },

      // Rule 2: Normalize spaces (multiple spaces → single space)
      {
        name: 'normalize-spaces',
        transform: (name: string) => name.replace(/\s+/g, ' '),
        priority: 90,
      },

      // Rule 3: Remove special characters (except allowed ones)
      {
        name: 'remove-special-chars',
        transform: (name: string) => {
          if (this.config.allowSpecialChars) return name;
          return name.replace(/[^a-zA-Z\s'-]/g, '');
        },
        priority: 80,
      },

      // Rule 4: Remove numbers (if not allowed)
      {
        name: 'remove-numbers',
        transform: (name: string) => {
          if (this.config.allowNumbers) return name;
          return name.replace(/\d/g, '');
        },
        priority: 80,
      },

      // Rule 5: Capitalize properly (if required)
      {
        name: 'capitalize',
        transform: (name: string) => {
          if (!this.config.requireCapitalization) return name;
          return name
            .split(' ')
            .map((word) => {
              if (word.length === 0) return word;
              return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' ');
        },
        priority: 70,
      },

      // Rule 6: Remove emoji and unicode
      {
        name: 'remove-emoji',
        transform: (name: string) => {
          // Remove emoji and other unicode characters
          return name.replace(/[^\x00-\x7F]/g, '');
        },
        priority: 75,
      },

      // Rule 7: Fix common typos (double apostrophes, etc.)
      {
        name: 'fix-typos',
        transform: (name: string) => {
          return name
            .replace(/'{2,}/g, "'") // Multiple apostrophes → single
            .replace(/-{2,}/g, '-'); // Multiple hyphens → single
        },
        priority: 60,
      },
    ];
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * HELPER METHODS
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */

  /**
   * Check for blacklisted words
   */
  private checkBlacklist(name: string): string | null {
    const lowerName = name.toLowerCase();
    const words = lowerName.split(/\s+/);

    for (const word of words) {
      if (this.blacklistedWords.has(word)) {
        return `Name contains a reserved word: "${word}"`;
      }
    }

    return null;
  }

  /**
   * Check for suspicious patterns
   */
  private checkSuspiciousPatterns(name: string): string | null {
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(name)) {
        return 'Name appears to be invalid or test data';
      }
    }

    return null;
  }

  /**
   * Generate suggestions for invalid names
   */
  private generateSuggestions(name: string): string[] {
    const suggestions: string[] = [];

    // If too short
    if (name.length < this.config.minLength) {
      suggestions.push('Please provide your full name');
    }

    // If has numbers
    if (/\d/.test(name)) {
      const withoutNumbers = name.replace(/\d/g, '');
      suggestions.push(`Try: "${withoutNumbers}"`);
    }

    // If all lowercase
    if (name === name.toLowerCase() && name.length > 0) {
      const capitalized = this.capitalizeWords(name);
      suggestions.push(`Try: "${capitalized}"`);
    }

    // If has excessive spaces
    if (/\s{2,}/.test(name)) {
      const normalized = name.replace(/\s+/g, ' ').trim();
      suggestions.push(`Try: "${normalized}"`);
    }

    return suggestions;
  }

  /**
   * Capitalize words properly
   */
  private capitalizeWords(name: string): string {
    return name
      .split(' ')
      .map((word) => {
        if (word.length === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  }

  /**
   * Create valid result
   */
  private createValidResult(sanitizedName: string): NameValidationResult {
    return {
      isValid: true,
      sanitizedName,
      issues: [],
    };
  }

  /**
   * Create invalid result
   */
  private createInvalidResult(
    issues: string[],
    sanitizedName: string | null,
    suggestions?: string[]
  ): NameValidationResult {
    return {
      isValid: false,
      sanitizedName,
      issues,
      suggestions,
    };
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * CONFIGURATION METHODS
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<NameValidatorConfig>): void {
    this.config = { ...this.config, ...config };
    // Reload rules with new config
    this.loadValidationRules();
    this.loadSanitizationRules();
  }

  /**
   * Get current configuration
   */
  public getConfig(): NameValidatorConfig {
    return { ...this.config };
  }

  /**
   * Add blacklisted word
   */
  public addBlacklistedWord(word: string): void {
    this.blacklistedWords.add(word.toLowerCase());
  }

  /**
   * Remove blacklisted word
   */
  public removeBlacklistedWord(word: string): void {
    this.blacklistedWords.delete(word.toLowerCase());
  }

  /**
   * Get statistics
   */
  public getStats(): {
    validationRules: number;
    sanitizationRules: number;
    blacklistedWords: number;
    suspiciousPatterns: number;
  } {
    return {
      validationRules: this.validationRules.length,
      sanitizationRules: this.sanitizationRules.length,
      blacklistedWords: this.blacklistedWords.size,
      suspiciousPatterns: this.suspiciousPatterns.length,
    };
  }
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * EXPORT SINGLETON INSTANCE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

export const nameValidator = NameValidator.getInstance();
