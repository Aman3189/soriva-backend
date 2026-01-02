// src/core/ai/prompts/starter-intent-guard.ts
// ============================================================================
// SORIVA STARTER INTENT GUARD v2.0 - January 2026
// ============================================================================
// 
// 🎯 PURPOSE: Classify intent for RESPONSE STYLE, not restriction
// 
// 🔥 PHILOSOPHY: "SORIVA HAAR NAHI MANEGA"
// - Every user gets a FULL plate (just served simply)
// - Plan decides DEPTH of explanation, not DEDICATION
// - ZERO upgrade pitches - user should feel valued
// - Classify to help LLM respond BETTER, not LESS
//
// INTENT TYPES:
// - GENERAL:   Casual chat, quick questions → warm, conversational
// - TECHNICAL: Code, debugging, tech concepts → explain + short snippets
// - LEARNING:  Educational, "what is", "explain" → teach the "why"
//
// TOKEN COST: 0 (pure keyword matching)
// CPU COST: ~0ms (ultra-light)
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export type StarterIntent = 'GENERAL' | 'TECHNICAL' | 'LEARNING';

export interface StarterIntentResult {
  intent: StarterIntent;
  confidence: number;
  metadata: {
    technicalScore: number;
    learningScore: number;
    messageLength: number;
    processingTimeMs: number;
  };
}

// ============================================================================
// KEYWORD DEFINITIONS
// ============================================================================

/**
 * TECHNICAL intent keywords
 * Code, debugging, tech concepts → explain + short code snippets
 */
const TECHNICAL_KEYWORDS = [
  // Programming languages
  'javascript', 'typescript', 'python', 'java', 'rust', 'go', 'golang',
  'react', 'nextjs', 'next.js', 'vue', 'angular', 'svelte',
  'node', 'nodejs', 'express', 'fastapi', 'django', 'flask',
  'flutter', 'dart', 'swift', 'kotlin',
  
  // Technical terms
  'code', 'function', 'variable', 'array', 'object', 'class',
  'api', 'rest', 'graphql', 'endpoint', 'request', 'response',
  'database', 'sql', 'nosql', 'mongodb', 'postgres', 'prisma',
  'query', 'schema', 'migration',
  
  // Dev tools
  'git', 'github', 'npm', 'yarn', 'docker', 'kubernetes',
  'deploy', 'server', 'hosting', 'vercel', 'aws', 'cloud',
  
  // Debugging
  'error', 'bug', 'debug', 'fix', 'issue', 'problem',
  'not working', 'doesnt work', "doesn't work", 'broken',
  'exception', 'crash', 'fail',
  
  // Architecture
  'frontend', 'backend', 'fullstack', 'full stack',
  'architecture', 'design pattern', 'algorithm',
];

/**
 * LEARNING intent keywords
 * Educational queries → teach the "why", use analogies
 */
const LEARNING_KEYWORDS = [
  // Question starters
  'what is', 'what are', 'what does', 'what do',
  'how does', 'how do', 'how is', 'how are',
  'why does', 'why do', 'why is', 'why are',
  'when to', 'when should',
  
  // Explanation requests
  'explain', 'tell me about', 'describe',
  'help me understand', 'can you explain',
  'meaning of', 'definition of', 'define',
  
  // Comparison/learning
  'difference between', 'compare', 'vs',
  'pros and cons', 'advantages', 'disadvantages',
  
  // Concept words
  'concept', 'theory', 'principle', 'basics',
  'fundamentals', 'introduction', 'beginner',
  'learn', 'understand', 'study',
  
  // Hindi/Hinglish learning phrases
  'samjhao', 'batao', 'kya hai', 'kaise',
  'kyun', 'kab', 'sikho',
];

// ============================================================================
// MAIN CLASSIFIER
// ============================================================================

/**
 * Classify Starter plan message intent
 * 
 * NOT for restriction - for helping LLM respond in the right STYLE
 * 
 * @param message - User's message
 * @param _sessionMessageCount - Deprecated, kept for backward compatibility
 * @returns StarterIntentResult with intent classification
 *
 * @example
 * const result = classifyStarterIntent('What is recursion?');
 * // { intent: 'LEARNING', confidence: 75 }
 * 
 * @example
 * const result = classifyStarterIntent('Fix this React error');
 * // { intent: 'TECHNICAL', confidence: 80 }
 */
export function classifyStarterIntent(
  message: string,
  _sessionMessageCount?: number // Kept for backward compatibility, not used
): StarterIntentResult {
  const startTime = Date.now();
  const text = message.toLowerCase();
  const messageLength = message.length;

  let technicalScore = 0;
  let learningScore = 0;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TECHNICAL KEYWORD DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  for (const keyword of TECHNICAL_KEYWORDS) {
    if (text.includes(keyword)) {
      technicalScore += 2;
    }
  }

  // Code block detection (strong technical signal)
  if (text.includes('```') || text.includes('`')) {
    technicalScore += 5;
  }

  // Error patterns (technical)
  if (/error:|exception:|failed:|cannot |can't /i.test(text)) {
    technicalScore += 3;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LEARNING KEYWORD DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  for (const keyword of LEARNING_KEYWORDS) {
    if (text.includes(keyword)) {
      learningScore += 2;
    }
  }

  // Question mark boosts learning score slightly
  if (text.includes('?')) {
    learningScore += 1;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INTENT DETERMINATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const processingTime = Date.now() - startTime;

  // TECHNICAL wins if score is higher
  if (technicalScore > learningScore && technicalScore >= 2) {
    return {
      intent: 'TECHNICAL',
      confidence: Math.min(60 + technicalScore * 3, 95),
      metadata: {
        technicalScore,
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
      metadata: {
        technicalScore,
        learningScore,
        messageLength,
        processingTimeMs: processingTime,
      },
    };
  }

  // GENERAL intent (default - casual, conversational)
  return {
    intent: 'GENERAL',
    confidence: 70,
    metadata: {
      technicalScore,
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
export function getStarterIntent(message: string): StarterIntent {
  return classifyStarterIntent(message).intent;
}

/**
 * Check if technical query
 */
export function isTechnicalQuery(message: string): boolean {
  return classifyStarterIntent(message).intent === 'TECHNICAL';
}

/**
 * Check if learning query
 */
export function isLearningQuery(message: string): boolean {
  return classifyStarterIntent(message).intent === 'LEARNING';
}

/**
 * Get statistics (for debugging/admin)
 */
export function getStarterGuardStats(): {
  technicalKeywords: number;
  learningKeywords: number;
} {
  return {
    technicalKeywords: TECHNICAL_KEYWORDS.length,
    learningKeywords: LEARNING_KEYWORDS.length,
  };
}

// ============================================================================
// DEPRECATED - Kept for backward compatibility
// These functions exist but do nothing (no upgrade nudges in new philosophy)
// ============================================================================

/**
 * @deprecated No upgrade nudges in v2.0 - always returns false
 */
export function shouldNudgeUpgrade(): boolean {
  return false; // NEVER nudge upgrade
}

/**
 * @deprecated No upgrade nudges in v2.0 - returns empty string
 */
export function getUpgradeNudgeMessage(_nudgeReason?: string): string {
  return ''; // No upgrade messages
}

/**
 * @deprecated HEAVY intent removed in v2.0 - always returns false
 */
export function isHeavyIntent(_message: string): boolean {
  return false; // HEAVY concept removed
}

// ============================================================================
// EXPORTS
// ============================================================================

export default classifyStarterIntent;