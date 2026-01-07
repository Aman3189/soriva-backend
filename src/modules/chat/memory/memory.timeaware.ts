/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA MEMORY - TIME AWARE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep Singh, Punjab, India
 * Company: Risenex Dynamics Pvt. Ltd.
 * Date: January 2026
 * Purpose: Time-aware features + Dynamic identity mirroring
 *
 * Features:
 * - Late night care (12 AM - 5 AM)
 * - Early morning detection (5 AM - 6 AM)
 * - Dynamic mirroring (Bhai/Yaar/Dear/Name based on identity)
 * - Time slot detection
 * - Style hints for LLM (not hardcoded messages)
 *
 * Architecture Rules:
 * - Server DECIDES care level, LLM EXPRESSES it
 * - NO hardcoded greetings (dynamic mirroring)
 * - Identity-aware term selection
 * - Consistent term within same response cycle
 * - LLM gets STYLE hints, decides exact words
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { TimeAwareHints, UserIdentity } from './memory.types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const TIME_SLOTS = {
  LATE_NIGHT: { start: 0, end: 5 },    // 12 AM - 5 AM
  EARLY_MORNING: { start: 5, end: 7 }, // 5 AM - 7 AM
  MORNING: { start: 7, end: 12 },      // 7 AM - 12 PM
  AFTERNOON: { start: 12, end: 17 },   // 12 PM - 5 PM
  EVENING: { start: 17, end: 21 },     // 5 PM - 9 PM
  NIGHT: { start: 21, end: 24 },       // 9 PM - 12 AM
} as const;

// Dynamic terms based on identity (NO hardcoded greetings)
const MIRROR_TERMS = {
  male: ['Bhai', 'Yaar', 'Dost'],
  female: ['Yaar', 'Dear'],
  neutral: ['Yaar', 'Friend'],
} as const;

// Cache for consistent mirror terms within response cycle
const MIRROR_TERM_CACHE: Map<string, { term: string; timestamp: number }> = new Map();
const MIRROR_TERM_CACHE_TTL = 60 * 1000; // 60 seconds - covers entire response cycle

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Get time-aware hints for LLM
 * Includes late night care + dynamic mirroring
 */
export function getTimeAwareHints(userIdentity?: UserIdentity, userId?: string): TimeAwareHints {
  const hour = new Date().getHours();
  const timeSlot = detectTimeSlot(hour);
  
  // Explicit parentheses for operator precedence
  const isLateNight =
    timeSlot === 'late_night' ||
    (timeSlot === 'night' && hour >= 23);

  // Get dynamic mirror term based on identity (cached for consistency)
  const mirrorTerm = getMirroredTerm(userIdentity, userId);

  // Determine care hint (server decides)
  let careHint: TimeAwareHints['careHint'] = 'none';

  if (hour >= 0 && hour < 4) {
    careHint = 'health_concern'; // Deep night - genuine concern
  } else if (hour >= 4 && hour < 6) {
    careHint = 'gentle_reminder'; // Very early - light reminder
  } else if (hour >= 23) {
    careHint = 'gentle_reminder'; // Late night starting
  }

  return {
    isLateNight,
    timeSlot,
    careHint,
    mirrorTerm,
  };
}

/**
 * Get safe late night care hints for LLM
 * Server decides care level, LLM expresses naturally
 */
export function getLateNightCareHints(userIdentity?: UserIdentity, userId?: string): {
  shouldShowCare: boolean;
  careLevel: 'none' | 'light' | 'moderate' | 'genuine';
  mirrorTerm: string;
  timeContext: string;
} {
  const hour = new Date().getHours();
  const mirrorTerm = getMirroredTerm(userIdentity, userId);

  // SERVER DECIDES care level
  let shouldShowCare = false;
  let careLevel: 'none' | 'light' | 'moderate' | 'genuine' = 'none';
  let timeContext = '';

  if (hour >= 0 && hour < 3) {
    // 12 AM - 3 AM: Genuine concern
    shouldShowCare = true;
    careLevel = 'genuine';
    timeContext = 'very late night';
  } else if (hour >= 3 && hour < 5) {
    // 3 AM - 5 AM: Moderate concern
    shouldShowCare = true;
    careLevel = 'moderate';
    timeContext = 'extremely late';
  } else if (hour >= 5 && hour < 6) {
    // 5 AM - 6 AM: Light (early bird or no sleep?)
    shouldShowCare = true;
    careLevel = 'light';
    timeContext = 'very early morning';
  } else if (hour >= 23) {
    // 11 PM - 12 AM: Light reminder
    shouldShowCare = true;
    careLevel = 'light';
    timeContext = 'late night';
  }

  return {
    shouldShowCare,
    careLevel,
    mirrorTerm,
    timeContext,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DYNAMIC MIRRORING (Identity-based term selection)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Get mirrored term based on user's identity
 * NO hardcoded greetings - dynamic selection
 * CACHED for consistency within same response cycle
 * 
 * @param userIdentity - User identity info
 * @param userId - User ID for caching (optional but recommended)
 */
export function getMirroredTerm(userIdentity?: UserIdentity, userId?: string): string {
  // Generate cache key
  const cacheKey = generateMirrorCacheKey(userIdentity, userId);

  // Check cache for consistency within response cycle
  const cached = MIRROR_TERM_CACHE.get(cacheKey);
  if (cached) {
    const age = Date.now() - cached.timestamp;
    if (age < MIRROR_TERM_CACHE_TTL) {
      return cached.term; // Return consistent term
    }
    // Expired - remove from cache
    MIRROR_TERM_CACHE.delete(cacheKey);
  }

  // Generate new term
  const term = generateMirrorTerm(userIdentity);

  // Cache the term for consistency
  MIRROR_TERM_CACHE.set(cacheKey, {
    term,
    timestamp: Date.now(),
  });

  // Cleanup old cache entries periodically
  cleanupMirrorCache();

  return term;
}

/**
 * Generate mirror term (internal - called once per cache cycle)
 * @internal
 */
function generateMirrorTerm(userIdentity?: UserIdentity): string {
  // If we have user's name, sometimes use it directly
  const firstName = userIdentity?.name?.split(' ')[0];

  // Determine gender category
  const gender = userIdentity?.gender?.toLowerCase();

  if (gender === 'male') {
    // Male: Bhai, Yaar, Dost (or name)
    // FIX: Explicit string[] type to allow pushing firstName
    const terms: string[] = [...MIRROR_TERMS.male];
    if (firstName) terms.push(firstName);
    return pickRandom(terms);
  }

  if (gender === 'female') {
    // Female: Yaar, Dear (or name) - NEVER "Bhai"
    // FIX: Explicit string[] type to allow pushing firstName
    const terms: string[] = [...MIRROR_TERMS.female];
    if (firstName) terms.push(firstName);
    return pickRandom(terms);
  }

  // Unknown gender: Safe neutral terms (or name if available)
  if (firstName) {
    // Prefer name for unknown gender
    return pickRandom([firstName, 'Yaar']);
  }

  return pickRandom([...MIRROR_TERMS.neutral]);
}

/**
 * Generate cache key for mirror term
 * @internal
 */
function generateMirrorCacheKey(userIdentity?: UserIdentity, userId?: string): string {
  if (userId) {
    return `mirror:${userId}`;
  }

  // Fallback: Use identity properties as key
  const name = userIdentity?.name || 'unknown';
  const gender = userIdentity?.gender || 'unknown';
  return `mirror:${name}:${gender}`;
}

/**
 * Cleanup expired cache entries
 * @internal
 */
function cleanupMirrorCache(): void {
  const now = Date.now();
  
  // Only cleanup if cache is getting large
  if (MIRROR_TERM_CACHE.size < 100) return;

  for (const [key, value] of MIRROR_TERM_CACHE.entries()) {
    if (now - value.timestamp > MIRROR_TERM_CACHE_TTL) {
      MIRROR_TERM_CACHE.delete(key);
    }
  }
}

/**
 * Clear mirror term cache for a user
 * Call when you want a fresh term in next cycle
 */
export function clearMirrorTermCache(userId?: string, userIdentity?: UserIdentity): void {
  const cacheKey = generateMirrorCacheKey(userIdentity, userId);
  MIRROR_TERM_CACHE.delete(cacheKey);
}

/**
 * Get all possible mirror terms for a user
 * Useful for prompt building
 */
export function getAllMirrorTerms(userIdentity?: UserIdentity): string[] {
  const firstName = userIdentity?.name?.split(' ')[0];
  const gender = userIdentity?.gender?.toLowerCase();

  let terms: string[] = [];

  if (gender === 'male') {
    terms = [...MIRROR_TERMS.male];
  } else if (gender === 'female') {
    terms = [...MIRROR_TERMS.female];
  } else {
    terms = [...MIRROR_TERMS.neutral];
  }

  if (firstName) {
    terms.push(firstName);
  }

  return terms;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TIME DETECTION HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Detect current time slot
 */
export function detectTimeSlot(hour?: number): TimeAwareHints['timeSlot'] {
  const currentHour = hour ?? new Date().getHours();

  if (currentHour >= TIME_SLOTS.LATE_NIGHT.start && currentHour < TIME_SLOTS.LATE_NIGHT.end) {
    return 'late_night';
  }
  if (currentHour >= TIME_SLOTS.EARLY_MORNING.start && currentHour < TIME_SLOTS.MORNING.start) {
    return 'morning'; // Early morning counts as morning
  }
  if (currentHour >= TIME_SLOTS.MORNING.start && currentHour < TIME_SLOTS.AFTERNOON.start) {
    return 'morning';
  }
  if (currentHour >= TIME_SLOTS.AFTERNOON.start && currentHour < TIME_SLOTS.EVENING.start) {
    return 'afternoon';
  }
  if (currentHour >= TIME_SLOTS.EVENING.start && currentHour < TIME_SLOTS.NIGHT.start) {
    return 'evening';
  }
  return 'night';
}

/**
 * Check if current time is late night (care needed)
 */
export function isLateNightTime(hour?: number): boolean {
  const currentHour = hour ?? new Date().getHours();
  return currentHour >= 0 && currentHour < 5;
}

/**
 * Check if current time is very early morning
 */
export function isEarlyMorning(hour?: number): boolean {
  const currentHour = hour ?? new Date().getHours();
  return currentHour >= 5 && currentHour < 7;
}

/**
 * Get greeting appropriate for time of day
 * Returns hint, not actual greeting (LLM decides expression)
 */
export function getTimeBasedGreetingHint(hour?: number): string {
  const currentHour = hour ?? new Date().getHours();

  if (currentHour >= 5 && currentHour < 12) return 'morning_greeting';
  if (currentHour >= 12 && currentHour < 17) return 'afternoon_greeting';
  if (currentHour >= 17 && currentHour < 21) return 'evening_greeting';
  if (currentHour >= 21 || currentHour < 5) return 'night_greeting';

  return 'neutral_greeting';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STYLE HINTS GENERATORS (For LLM - Dynamic with mirrorTerm)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Get style examples for light care level
 * @internal Used by buildTimeAwarePrompt
 */
function getLightCareStyleHints(mirrorTerm: string): string {
  return `
**Light Care Style (casual acknowledgment):**
- "${mirrorTerm}, kaafi raat ho gayi! 😄"
- "Late night session? Nice dedication!"
- "Arre ${mirrorTerm}, abhi tak jaag rahe ho?"
- Keep it casual, don't lecture
- A simple acknowledgment is enough`;
}

/**
 * Get style examples for moderate care level
 * @internal Used by buildTimeAwarePrompt
 */
function getModerateCareStyleHints(mirrorTerm: string): string {
  return `
**Moderate Care Style (friendly concern):**
- "${mirrorTerm}, thoda rest bhi kar lo"
- "Bohot late ho gaya, sab theek ${mirrorTerm}?"
- "${mirrorTerm}, kaam important hai but health bhi!"
- Show you noticed + gentle suggestion
- Don't be preachy, be a friend`;
}

/**
 * Get style examples for genuine care level
 * @internal Used by buildTimeAwarePrompt
 */
function getGenuineCareStyleHints(mirrorTerm: string): string {
  return `
**Genuine Care Style (real concern):**
- "${mirrorTerm}, health bohot important hai yaar, sau ja please 🙏"
- "Itni raat ko ${mirrorTerm}? Please apna khayal rakho"
- "${mirrorTerm}, kal baat karte hain, abhi rest karo"
- "Main samajh sakta/sakti hoon kaam hai, but ${mirrorTerm} please thoda rest"
- Express genuine concern like a close friend would
- Health first, work can wait tone`;
}

/**
 * Get style examples for early morning
 * @internal Used by buildTimeAwarePrompt
 */
function getEarlyMorningStyleHints(mirrorTerm: string): string {
  return `
**Early Morning Style (curious + light):**
- "${mirrorTerm}, itni jaldi? Early bird ho ya raat bhar jaage?"
- "5 baj gaye ${mirrorTerm}! Soye nahi kya? 😅"
- "Good morning ${mirrorTerm}! Ya good night bolun? 🤔"
- Be curious, not judgmental
- Could be early riser or no sleep - ask naturally`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROMPT BUILDER (Safe for LLM)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Build time-aware prompt section for LLM
 * Includes dynamic style hints based on care level
 * NO hardcoded messages - LLM decides exact words
 */
export function buildTimeAwarePrompt(
  hints: ReturnType<typeof getLateNightCareHints>,
  userIdentity?: UserIdentity
): string {
  if (!hints.shouldShowCare) {
    return '';
  }

  const availableTerms = getAllMirrorTerms(userIdentity);
  const { mirrorTerm, careLevel, timeContext } = hints;

  // Get style hints based on care level
  let styleHints = '';
  let careDescription = '';

  switch (careLevel) {
    case 'light':
      styleHints = getLightCareStyleHints(mirrorTerm);
      careDescription = 'a gentle, casual acknowledgment of the time';
      break;
    case 'moderate':
      styleHints = getModerateCareStyleHints(mirrorTerm);
      careDescription = 'friendly concern about their rest/sleep';
      break;
    case 'genuine':
      styleHints = getGenuineCareStyleHints(mirrorTerm);
      careDescription = 'genuine care for their health and wellbeing';
      break;
    default:
      return '';
  }

  // Check if early morning (different style)
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 6) {
    styleHints = getEarlyMorningStyleHints(mirrorTerm);
    careDescription = 'curious and light - early riser or no sleep?';
  }

  return `
## TIME-AWARE CARE (Optional - Use Naturally)

**Current context:** ${timeContext}
**Care level:** ${careLevel}
**Care approach:** ${careDescription}

**Address user as:** ${mirrorTerm}
**Alternative terms:** ${availableTerms.join(', ')}

${styleHints}

**Important Guidelines:**
- Express care NATURALLY within your response
- Don't make it the main focus unless user seems tired
- Match your concern to the ${careLevel} level
- Never lecture or be preachy
- Feel like a friend who noticed, not a bot warning
- If user is energetic/engaged, just acknowledge briefly

**Skip care message if:**
- User is clearly in urgent work mode
- User already mentioned they know it's late
- It would interrupt an important technical discussion
- User seems energetic and engaged (not tired)
- Adding care would feel forced or awkward

**Remember:** You're a caring friend, not sleep police! 
The goal is to show you care, not to make them feel guilty. 😊
`.trim();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UTILITY FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Pick random item from array
 */
function pickRandom<T>(arr: readonly T[] | T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get user's timezone offset (for future use)
 * Currently uses server time
 */
export function getUserLocalHour(timezoneOffset?: number): number {
  if (timezoneOffset === undefined) {
    return new Date().getHours();
  }

  const utc = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
  const userTime = new Date(utc + timezoneOffset * 60000);
  return userTime.getHours();
}