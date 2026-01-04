// src/core/ai/prompts/plus-intent-classifier.ts
// ============================================================================
// SORIVA PLUS INTENT CLASSIFIER v1.0 - January 2026
// ============================================================================
// 
// 🎯 PURPOSE: Classify intent for RESPONSE STYLE + NUDGE TYPE
// 
// 🔥 PHILOSOPHY: "SORIVA EXCELLENCE"
// - Every user gets a FULL plate (just served simply)
// - Plan decides DEPTH of explanation, not DEDICATION
// - ZERO upgrade pitches - user should feel valued
// - Classify to help LLM respond BETTER, not LESS
// - Single contextual nudge based on user's need
//
// INTENT TYPES:
// - EVERYDAY:  Casual chat, quick questions → warm, conversational
// - WORK:      Professional tasks → actionable, structured
// - LEARNING:  Educational, "what is", "explain" → teach the "why"
// - CREATIVE:  Writing, brainstorming → collaborative partner
//
// NUDGE TYPES:
// - SIMPLIFY:  User confused/overwhelmed → "Want me to simplify this?"
// - DECIDE:    User needs decision help → "Want me to decide this for you?"
// - ACTION:    User needs next steps → "Want clear next steps?"
// - null:      No nudge needed
//
// TOKEN COST: 0 (pure keyword matching)
// CPU COST: ~0ms (ultra-light)
// ============================================================================

import { PlusIntent } from './plus-delta';

// ============================================================================
// TYPES
// ============================================================================

// Nudge types for contextual single-line nudge
export type NudgeType = 'SIMPLIFY' | 'DECIDE' | 'ACTION' | null;

export interface PlusIntentResult {
  intent: PlusIntent;
  confidence: number;
  nudgeType: NudgeType;
  metadata: {
    workScore: number;
    creativeScore: number;
    learningScore: number;
    messageLength: number;
    processingTimeMs: number;
  };
}

// ============================================================================
// INTENT DETECTION KEYWORDS
// ============================================================================

/**
 * WORK intent keywords
 * Professional tasks → actionable, structured advice
 */
const WORK_KEYWORDS = [
  'email', 'meeting', 'presentation', 'report', 'client', 'boss',
  'deadline', 'project', 'proposal', 'strategy', 'business',
  'professional', 'work', 'office', 'team', 'manager',
  'resume', 'interview', 'job', 'career', 'salary',
  'slack', 'excel', 'powerpoint', 'docs', 'spreadsheet',
];

/**
 * CREATIVE intent keywords
 * Writing, brainstorming → collaborative partner
 */
const CREATIVE_KEYWORDS = [
  'write', 'story', 'poem', 'creative', 'idea', 'brainstorm',
  'design', 'content', 'blog', 'article', 'script', 'caption',
  'name', 'tagline', 'slogan', 'brand', 'logo',
  'fiction', 'character', 'plot', 'narrative',
  'social media', 'instagram', 'twitter', 'post',
];

/**
 * LEARNING intent keywords
 * Educational queries → teach the "why", use analogies
 */
const LEARNING_KEYWORDS = [
  'explain', 'what is', 'how does', 'why', 'understand',
  'learn', 'teach', 'concept', 'meaning', 'difference',
  'study', 'exam', 'course', 'tutorial', 'beginner',
  'samjhao', 'batao', 'sikho', 'kaise', 'kyun',
];

// ============================================================================
// NUDGE DETECTION KEYWORDS
// ============================================================================

/**
 * SIMPLIFY nudge - user is confused/overwhelmed
 * Shows: "Want me to simplify this?"
 */
const SIMPLIFY_KEYWORDS = [
  'confused', 'confusing', 'overwhelming', 'overwhelmed',
  'too much', 'complicated', 'complex', 'dont understand',
  "don't understand", 'not sure', 'lost', 'stuck',
  'hard to understand', 'difficult to', 'cant figure',
  "can't figure", 'makes no sense', 'unclear',
  // Hindi/Hinglish
  'samajh nahi', 'pata nahi', 'confused hu', 'clear nahi',
  'mushkil', 'difficult', 'समझ नहीं',
];

/**
 * DECIDE nudge - user needs decision help
 * Shows: "Want me to decide this for you?"
 */
const DECIDE_KEYWORDS = [
  'should i', 'should we', 'is it better', 'which one',
  'or should', 'what would you', 'recommend', 'suggestion',
  'choose between', 'decide', 'decision', 'dilemma',
  'better option', 'best choice', 'what do you think',
  'worth it', 'good idea', 'bad idea',
  // Hindi/Hinglish
  'kya karu', 'kaun sa', 'konsa', 'sahi rahega',
  'better hai', 'theek rahega', 'karna chahiye',
];

/**
 * ACTION nudge - user needs next steps
 * Shows: "Want clear next steps?"
 */
const ACTION_KEYWORDS = [
  'how do i', 'how to', 'next step', 'what should i do',
  'where do i start', 'get started', 'begin', 'first step',
  'grow', 'scale', 'improve', 'increase', 'achieve',
  'plan', 'roadmap', 'strategy', 'way forward',
  'practical', 'actionable', 'steps to',
  // Hindi/Hinglish
  'kaise karu', 'shuru karu', 'aage kya', 'kya karna hai',
  'plan batao', 'steps batao',
];

// ============================================================================
// NUDGE TYPE DETECTION
// ============================================================================

/**
 * Detect nudge type from message
 * Priority: SIMPLIFY > DECIDE > ACTION
 */
function detectNudgeType(text: string): NudgeType {
  const lowerText = text.toLowerCase();

  // Check SIMPLIFY (confusion/overwhelm) - highest priority
  for (const keyword of SIMPLIFY_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      return 'SIMPLIFY';
    }
  }

  // Check DECIDE (decision needed)
  for (const keyword of DECIDE_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      return 'DECIDE';
    }
  }

  // Check ACTION (next steps needed)
  for (const keyword of ACTION_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      return 'ACTION';
    }
  }

  return null;
}

// ============================================================================
// MAIN CLASSIFIER
// ============================================================================

/**
 * Classify PLUS user intent + nudge type
 * More nuanced than STARTER - recognizes work and creative contexts
 * 
 * @param message - User's message
 * @returns PlusIntentResult with intent classification + nudgeType
 * 
 * @example
 * const result = classifyPlusIntent('Help me write a blog post');
 * // { intent: 'CREATIVE', confidence: 75, nudgeType: null }
 * 
 * @example
 * const result = classifyPlusIntent("I'm confused about this report");
 * // { intent: 'WORK', confidence: 80, nudgeType: 'SIMPLIFY' }
 */
export function classifyPlusIntent(message: string): PlusIntentResult {
  const startTime = Date.now();
  const text = message.toLowerCase();
  const messageLength = message.length;

  let workScore = 0;
  let creativeScore = 0;
  let learningScore = 0;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // WORK KEYWORD DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  for (const keyword of WORK_KEYWORDS) {
    if (text.includes(keyword)) {
      workScore += 2;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CREATIVE KEYWORD DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  for (const keyword of CREATIVE_KEYWORDS) {
    if (text.includes(keyword)) {
      creativeScore += 2;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LEARNING KEYWORD DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  for (const keyword of LEARNING_KEYWORDS) {
    if (text.includes(keyword)) {
      learningScore += 2;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // NUDGE TYPE DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const nudgeType = detectNudgeType(text);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INTENT DETERMINATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const processingTime = Date.now() - startTime;

  // WORK wins if highest
  if (workScore > creativeScore && workScore > learningScore && workScore >= 2) {
    return {
      intent: 'WORK',
      confidence: Math.min(60 + workScore * 3, 95),
      nudgeType,
      metadata: {
        workScore,
        creativeScore,
        learningScore,
        messageLength,
        processingTimeMs: processingTime,
      },
    };
  }

  // CREATIVE wins if highest
  if (creativeScore > workScore && creativeScore > learningScore && creativeScore >= 2) {
    return {
      intent: 'CREATIVE',
      confidence: Math.min(60 + creativeScore * 3, 90),
      nudgeType,
      metadata: {
        workScore,
        creativeScore,
        learningScore,
        messageLength,
        processingTimeMs: processingTime,
      },
    };
  }

  // LEARNING intent
  if (learningScore >= 2) {
    return {
      intent: 'LEARNING',
      confidence: Math.min(60 + learningScore * 4, 90),
      nudgeType,
      metadata: {
        workScore,
        creativeScore,
        learningScore,
        messageLength,
        processingTimeMs: processingTime,
      },
    };
  }

  // EVERYDAY intent (default)
  return {
    intent: 'EVERYDAY',
    confidence: 70,
    nudgeType,
    metadata: {
      workScore,
      creativeScore,
      learningScore,
      messageLength,
      processingTimeMs: processingTime,
    },
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Quick intent check
 */
export function getPlusIntent(message: string): PlusIntent {
  return classifyPlusIntent(message).intent;
}

/**
 * Quick nudge type check
 */
export function getPlusNudgeType(message: string): NudgeType {
  return classifyPlusIntent(message).nudgeType;
}

/**
 * Check if nudge should be shown
 */
export function shouldShowNudge(message: string): boolean {
  return classifyPlusIntent(message).nudgeType !== null;
}

/**
 * Get nudge text based on nudge type
 */
export function getNudgeText(nudgeType: NudgeType): string {
  switch (nudgeType) {
    case 'SIMPLIFY':
      return 'Want me to simplify this?';
    case 'DECIDE':
      return 'Want me to decide this for you?';
    case 'ACTION':
      return 'Want clear next steps?';
    default:
      return '';
  }
}

/**
 * Get statistics (for debugging/admin)
 */
export function getPlusClassifierStats(): {
  workKeywords: number;
  creativeKeywords: number;
  learningKeywords: number;
  simplifyKeywords: number;
  decideKeywords: number;
  actionKeywords: number;
} {
  return {
    workKeywords: WORK_KEYWORDS.length,
    creativeKeywords: CREATIVE_KEYWORDS.length,
    learningKeywords: LEARNING_KEYWORDS.length,
    simplifyKeywords: SIMPLIFY_KEYWORDS.length,
    decideKeywords: DECIDE_KEYWORDS.length,
    actionKeywords: ACTION_KEYWORDS.length,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default classifyPlusIntent;
