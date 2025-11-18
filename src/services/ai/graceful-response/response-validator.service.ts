/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * RESPONSE VALIDATOR SERVICE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Punjab, India
 * Created: November 16, 2025
 * Updated: Phase 2 - Natural Question Recognition
 * Purpose: Validate AI responses against graceful conflict handling rules
 *
 * Features:
 * - Apology detection (over-apologizing check)
 * - Defensive behavior detection
 * - Length appropriateness check (20-40 words for factual corrections)
 * - Action presence check (with natural question recognition)
 * - Scoring system (0-100)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { ConflictType } from './conflict-detector.service';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export enum ViolationType {
  OVER_APOLOGIZING = 'over_apologizing',
  DEFENSIVE = 'defensive',
  TOO_LONG = 'too_long',
  TOO_SHORT = 'too_short',
  NO_ACTION = 'no_action',
  REPEATING_COMPLAINT = 'repeating_complaint',
  MAKING_EXCUSES = 'making_excuses',
}

export enum ViolationSeverity {
  CRITICAL = 'critical', // Must fix
  MODERATE = 'moderate', // Should fix
  MINOR = 'minor', // Nice to fix
}

export interface ValidationViolation {
  type: ViolationType;
  severity: ViolationSeverity;
  evidence: string; // The problematic part
  suggestion?: string; // How to fix
}

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100 (100 = perfect)
  violations: ValidationViolation[];
  passedChecks: string[];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VALIDATION PATTERNS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const APOLOGY_PATTERNS = {
  excessive: [
    /i('m| am) (so |very |really |extremely )?sorry/i,
    /i (sincerely |deeply |truly )?apologize/i,
    /my (deepest |sincerest )?apologies/i,
    /maafi (chahta|chahti|mangta) (hu|hoon)/i,
    /sorry/gi, // Multiple "sorry" in response
  ],
  light: [
    /arre,? sorry/i, // "Arre sorry" is OK in Hinglish
    /oops/i,
  ],
};

const DEFENSIVE_PATTERNS = [
  /let me explain why/i,
  /the reason (i|that)/i,
  /i (was trying|meant) to/i,
  /(because|kyunki) (i|main)/i,
  /main toh bas/i,
  /i didn't mean to/i,
  /i thought/i,
  /my intention was/i,
  /i was just/i,
];

const EXCUSE_PATTERNS = [
  /i must have (misunderstood|confused)/i,
  /it seems (like )?i/i,
  /perhaps i/i,
  /maybe i/i,
  /i might have/i,
];

const REPEATING_PATTERNS = [
  // Checks if AI is repeating user's complaint
  /you (said|mentioned) (that )?/i,
  /i (understand|see) (you|that) (don't|didn't)/i,
];

// Action indicators (GOOD - should be present)
const ACTION_INDICATORS = {
  askPreference: [
    /aap kais[ie] tone prefer/i,
    /(what|how) (would you|do you) (like|prefer)/i,
    /kya chahiye/i,
    /bataiye/i,
  ],
  provideSolution: [/here'?s (the|how|what)/i, /let me (fix|correct|show)/i, /try this/i],
  adjustTone: [/chill mode/i, /accordingly/i, /adjust/i],
  // Natural follow-up questions (for factual corrections and general engagement)
  engagingQuestion: [
    /\?$/i, // Ends with question mark - ANY question is engaging!
    /(aur|kya|what|which|how|when|where|why|shall we|would you like|want to)/i, // Question words
    /(chahoge|chahiye|jaanna|discuss|explore|know|tell|help|continue|more)/i, // Engagement verbs
    /(dhanyavaad|thanks|shukriya|appreciate).+(kya|\?)/i, // Gratitude + question combo
  ],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RESPONSE VALIDATOR SERVICE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class ResponseValidatorService {
  /**
   * Main validation method
   */
  public validate(response: string, conflictType: ConflictType): ValidationResult {
    const violations: ValidationViolation[] = [];
    const passedChecks: string[] = [];

    // Check 1: Over-apologizing
    const apologyViolation = this.checkApologies(response);
    if (apologyViolation) {
      violations.push(apologyViolation);
    } else {
      passedChecks.push('no_excessive_apologies');
    }

    // Check 2: Defensive behavior
    const defensiveViolation = this.checkDefensiveBehavior(response);
    if (defensiveViolation) {
      violations.push(defensiveViolation);
    } else {
      passedChecks.push('not_defensive');
    }

    // Check 3: Making excuses
    const excuseViolation = this.checkExcuses(response);
    if (excuseViolation) {
      violations.push(excuseViolation);
    } else {
      passedChecks.push('no_excuses');
    }

    // Check 4: Length appropriateness
    const lengthViolation = this.checkLength(response, conflictType);
    if (lengthViolation) {
      violations.push(lengthViolation);
    } else {
      passedChecks.push('appropriate_length');
    }

    // Check 5: Action presence (only for certain conflict types)
    if (this.shouldHaveAction(conflictType)) {
      const actionViolation = this.checkActionPresence(response, conflictType);
      if (actionViolation) {
        violations.push(actionViolation);
      } else {
        passedChecks.push('has_action');
      }
    }

    // Calculate score
    const score = this.calculateScore(violations, passedChecks);

    return {
      isValid: violations.filter((v) => v.severity === ViolationSeverity.CRITICAL).length === 0,
      score,
      violations,
      passedChecks,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHECK METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private checkApologies(response: string): ValidationViolation | null {
    // Count "sorry" occurrences
    const sorryCount = (response.match(/sorry/gi) || []).length;

    // Check excessive apology patterns
    for (const pattern of APOLOGY_PATTERNS.excessive) {
      const matches = response.match(pattern);
      if (matches && matches.length > 0) {
        // Allow light Hinglish "arre sorry" (it's cultural)
        if (pattern.source.includes('arre') && sorryCount === 1) {
          continue;
        }

        return {
          type: ViolationType.OVER_APOLOGIZING,
          severity: ViolationSeverity.CRITICAL,
          evidence: matches[0],
          suggestion: 'Use quick acknowledgment instead: "Got it!" or "Samajh gaya!"',
        };
      }
    }

    // Multiple "sorry" is also a violation
    if (sorryCount >= 2) {
      return {
        type: ViolationType.OVER_APOLOGIZING,
        severity: ViolationSeverity.CRITICAL,
        evidence: `Multiple apologies detected (${sorryCount} times)`,
        suggestion: 'Apologize once max, or not at all',
      };
    }

    return null;
  }

  private checkDefensiveBehavior(response: string): ValidationViolation | null {
    for (const pattern of DEFENSIVE_PATTERNS) {
      const match = response.match(pattern);
      if (match) {
        return {
          type: ViolationType.DEFENSIVE,
          severity: ViolationSeverity.CRITICAL,
          evidence: match[0],
          suggestion: "Don't justify behavior. Just acknowledge and move forward.",
        };
      }
    }

    return null;
  }

  private checkExcuses(response: string): ValidationViolation | null {
    for (const pattern of EXCUSE_PATTERNS) {
      const match = response.match(pattern);
      if (match) {
        return {
          type: ViolationType.MAKING_EXCUSES,
          severity: ViolationSeverity.MODERATE,
          evidence: match[0],
          suggestion: 'Skip excuses. Focus on solution.',
        };
      }
    }

    return null;
  }

  private checkLength(response: string, conflictType: ConflictType): ValidationViolation | null {
    const wordCount = response.split(/\s+/).length;
    const charCount = response.length;

    // Length limits based on conflict type
    const limits: Record<
      ConflictType,
      { minWords?: number; maxWords: number; chars: number }
    > = {
      [ConflictType.TONE_COMPLAINT]: { maxWords: 30, chars: 200 },
      [ConflictType.STYLE_ADJUSTMENT]: { maxWords: 25, chars: 150 },
      [ConflictType.FACTUAL_CORRECTION]: { minWords: 20, maxWords: 50, chars: 300 }, // ✅ 20-50 words
      [ConflictType.IDENTITY_CHALLENGE]: { maxWords: 20, chars: 120 },
      [ConflictType.HELPFULNESS_COMPLAINT]: { maxWords: 35, chars: 220 },
      [ConflictType.NONE]: { maxWords: 100, chars: 600 },
    };

    const limit = limits[conflictType] || limits[ConflictType.NONE];

    // Check minimum words (for factual corrections)
    if (limit.minWords && wordCount < limit.minWords) {
      return {
        type: ViolationType.TOO_SHORT,
        severity: ViolationSeverity.MODERATE,
        evidence: `${wordCount} words (minimum: ${limit.minWords} words)`,
        suggestion: `Expand response to ${limit.minWords}-${limit.maxWords} words with natural warmth and engagement`,
      };
    }

    // Check maximum words
    if (wordCount > limit.maxWords || charCount > limit.chars) {
      return {
        type: ViolationType.TOO_LONG,
        severity: ViolationSeverity.MODERATE,
        evidence: `${wordCount} words, ${charCount} chars (limit: ${limit.maxWords} words)`,
        suggestion: 'Keep conflict responses brief. 1-2 lines max.',
      };
    }

    return null;
  }

  private checkActionPresence(
    response: string,
    conflictType: ConflictType
  ): ValidationViolation | null {
    let hasAction = false;

    // Check for action indicators
    for (const indicators of Object.values(ACTION_INDICATORS)) {
      if (indicators.some((pattern) => pattern.test(response))) {
        hasAction = true;
        break;
      }
    }

    // Special case: For factual corrections, just having a question mark is enough!
    if (conflictType === ConflictType.FACTUAL_CORRECTION && response.includes('?')) {
      hasAction = true;
    }

    if (!hasAction) {
      let suggestion = '';

      switch (conflictType) {
        case ConflictType.TONE_COMPLAINT:
          suggestion = 'Ask: "Aap kaisi tone prefer karte ho?"';
          break;
        case ConflictType.STYLE_ADJUSTMENT:
          suggestion = 'Acknowledge and adjust: "Chill mode ON 😎"';
          break;
        case ConflictType.FACTUAL_CORRECTION:
          suggestion = 'Add engaging follow-up question: "Aur kya jaanna chahoge?"';
          break;
        case ConflictType.HELPFULNESS_COMPLAINT:
          suggestion = 'Ask: "What specifically would help?"';
          break;
      }

      return {
        type: ViolationType.NO_ACTION,
        severity: ViolationSeverity.CRITICAL,
        evidence: 'No solution or engagement detected',
        suggestion,
      };
    }

    return null;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HELPER METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private shouldHaveAction(conflictType: ConflictType): boolean {
    // All conflict types except NONE should have action
    return conflictType !== ConflictType.NONE;
  }

  private calculateScore(violations: ValidationViolation[], passedChecks: string[]): number {
    let score = 100;

    // Deduct points for violations
    for (const violation of violations) {
      switch (violation.severity) {
        case ViolationSeverity.CRITICAL:
          score -= 30;
          break;
        case ViolationSeverity.MODERATE:
          score -= 15;
          break;
        case ViolationSeverity.MINOR:
          score -= 5;
          break;
      }
    }

    // Ensure score doesn't go below 0
    return Math.max(0, score);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UTILITY METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Quick check - is response graceful enough?
   */
  public isGraceful(response: string, conflictType: ConflictType): boolean {
    const result = this.validate(response, conflictType);
    return result.score >= 70; // 70+ score = acceptable
  }

  /**
   * Get formatted validation report (for debugging)
   */
  public getReport(result: ValidationResult): string {
    let report = `Validation Score: ${result.score}/100\n`;
    report += `Status: ${result.isValid ? '✅ VALID' : '❌ INVALID'}\n\n`;

    if (result.violations.length > 0) {
      report += '⚠️ VIOLATIONS:\n';
      result.violations.forEach((v, i) => {
        report += `${i + 1}. [${v.severity.toUpperCase()}] ${v.type}\n`;
        report += `   Evidence: "${v.evidence}"\n`;
        if (v.suggestion) {
          report += `   Fix: ${v.suggestion}\n`;
        }
      });
    }

    if (result.passedChecks.length > 0) {
      report += '\n✅ PASSED CHECKS:\n';
      result.passedChecks.forEach((check) => {
        report += `- ${check}\n`;
      });
    }

    return report;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const responseValidator = new ResponseValidatorService();