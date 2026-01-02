// src/core/ai/prompts/plus-delta.ts
// ============================================================================
// SORIVA PLUS DELTA v1.1 — Everyday Companion
// ============================================================================
//
// 🎯 PHILOSOPHY: "12th Class Teacher" + "Everyday Companion"
// - Not a hi-fi mentor on a pedestal
// - A reliable companion you can't imagine your day without
// - Teaches properly, grows with you, always there
//
// 🔥 SORIVA PRINCIPLES:
// - "HAAR NAHI MANEGA" - Never refuse, never give up
// - Complete answers with real depth
// - Makes user FEEL smarter, not dependent
// - ZERO upgrade pitches - this is their trusted companion
//
// 💡 USER FEELING:
// - "Iske bina din adhoora hai"
// - "Ye actually samajhta hai mujhe"
// - "Isse poochna easy hai, judgement nahi milta"
//
// TOKEN COST: ~120 tokens per delta
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export type PlusIntent = 'EVERYDAY' | 'WORK' | 'LEARNING' | 'CREATIVE';

// ============================================================================
// CORE PROMPT
// ============================================================================

const PLUS_CORE = `You are an everyday companion - reliable, warm, genuinely helpful.

Your Approach:
- Give complete, thoughtful answers (not surface-level)
- Be conversational, not robotic
- Remember: user chose YOU as their daily companion
- Treat every question as worth your full attention

Rules:
- Never rush, never dismiss
- Explain with clarity AND depth
- Be honest, even when it's hard
- Never mention other plans or upgrades
- End conversations feeling connected, not transactional`;

// ============================================================================
// INTENT-SPECIFIC HINTS
// ============================================================================

const INTENT_HINTS: Record<PlusIntent, string> = {
  EVERYDAY: `This is casual conversation with a trusted companion.
Be warm, natural, human.
Share thoughts genuinely.
It's okay to be a little playful.
End with: openness for more chat.`,

  WORK: `User trusts you with their professional life.
Give actionable, practical advice.
Be thorough but respect their time.
Prefer structure, bullets, and clear next steps.
End with: "Need me to go deeper on any part?"`,

  LEARNING: `Be the teacher everyone deserves.
Explain the "why" before the "how".
Use relatable examples from real life.
Build their confidence, not dependency.
End with: invite curiosity naturally.`,

  CREATIVE: `Be a creative partner, not just a tool.
Brainstorm WITH them, not FOR them.
Offer options, let them choose direction.
Encourage their instincts.
End with: energy to keep creating.`,
};

// ============================================================================
// COMPANION TOUCHES - Rotating for freshness
// Same philosophy, less repetition
// ============================================================================

const PLUS_COMPANION_TOUCHES = [
  `You're being someone's trusted companion for the day. Make it count.`,
  `Be present, thoughtful, and human in your responses.`,
  `This conversation matters to the user. Treat it with care.`,
];

// ============================================================================
// HASH FUNCTION - Deterministic selection
// ============================================================================

/**
 * Generate consistent hash from message
 * Same input → Same output (always)
 */
function generateHash(message: string): number {
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Select companion touch deterministically
 * Consistent, debuggable, reproducible
 */
function selectCompanionTouch(message: string): string {
  const hash = generateHash(message);
  return PLUS_COMPANION_TOUCHES[hash % PLUS_COMPANION_TOUCHES.length];
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Get complete delta prompt for PLUS plan
 * Combines: CORE + Intent Hint + Deterministic Companion Touch
 * 
 * @param intent - Classified intent type
 * @param message - User message (for deterministic touch selection)
 * @returns Complete delta prompt string (~120 tokens)
 */
export function getPlusDelta(intent: PlusIntent = 'EVERYDAY', message: string = ''): string {
  const touch = message ? selectCompanionTouch(message) : PLUS_COMPANION_TOUCHES[0];
  return `${PLUS_CORE}\n\n${INTENT_HINTS[intent]}\n\n${touch}`;
}

/**
 * Get max response tokens for intent
 * PLUS gets generous limits - companion doesn't cut you off
 */
export function getMaxResponseTokens(intent: PlusIntent = 'EVERYDAY'): number {
  const caps: Record<PlusIntent, number> = {
    EVERYDAY: 800,   // Casual but complete
    WORK: 1200,      // Professional needs space
    LEARNING: 1000,  // Teaching needs room
    CREATIVE: 1000,  // Creativity needs freedom
  };
  return caps[intent];
}

/**
 * Get token estimate for delta prompt
 */
export function getPlusDeltaTokenEstimate(): number {
  return 120;
}

// ============================================================================
// INTENT CLASSIFIER
// ============================================================================

/**
 * Classify PLUS user intent
 * More nuanced than STARTER - recognizes work and creative contexts
 */
export function classifyPlusIntent(message: string): PlusIntent {
  const msg = message.toLowerCase();

  // WORK indicators
  const workKeywords = [
    'email', 'meeting', 'presentation', 'report', 'client', 'boss',
    'deadline', 'project', 'proposal', 'strategy', 'business',
    'professional', 'work', 'office', 'team', 'manager',
    'resume', 'interview', 'job', 'career', 'salary',
    'slack', 'excel', 'powerpoint', 'docs', 'spreadsheet',
  ];

  // CREATIVE indicators
  const creativeKeywords = [
    'write', 'story', 'poem', 'creative', 'idea', 'brainstorm',
    'design', 'content', 'blog', 'article', 'script', 'caption',
    'name', 'tagline', 'slogan', 'brand', 'logo',
    'fiction', 'character', 'plot', 'narrative',
    'social media', 'instagram', 'twitter', 'post',
  ];

  // LEARNING indicators
  const learningKeywords = [
    'explain', 'what is', 'how does', 'why', 'understand',
    'learn', 'teach', 'concept', 'meaning', 'difference',
    'study', 'exam', 'course', 'tutorial', 'beginner',
    'samjhao', 'batao', 'sikho', 'kaise', 'kyun',
  ];

  // Check in priority order
  if (workKeywords.some(k => msg.includes(k))) return 'WORK';
  if (creativeKeywords.some(k => msg.includes(k))) return 'CREATIVE';
  if (learningKeywords.some(k => msg.includes(k))) return 'LEARNING';
  
  return 'EVERYDAY';
}

// ============================================================================
// EXPORTS
// ============================================================================

export { PLUS_CORE, INTENT_HINTS, PLUS_COMPANION_TOUCHES };
export default getPlusDelta;