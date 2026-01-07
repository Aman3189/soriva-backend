/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA MEMORY - PRO WELCOME
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep Singh, Punjab, India
 * Company: Risenex Dynamics Pvt. Ltd.
 * Date: January 2026
 * Purpose: PRO plan welcome back hints (5-day lookback)
 *
 * Architecture Rules:
 * - Server DECIDES, LLM EXPRESSES
 * - LLM gets STYLE hints, not raw data
 * - NEVER send exact daysMissed to LLM
 * - PRO = Simple, friendly greeting hints
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { prisma } from '../../../config/prisma';
import {
  SafeProWelcomeHints,
  WelcomeBackContext,
  WELCOME_BACK_CONFIG,
} from './memory.types';
import { memoryCache, createWelcomeCacheKey } from './memory.cache';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PRO_CONFIG = WELCOME_BACK_CONFIG.PRO;
const MIN_GAP_DAYS = 2;  // Minimum days before considering greeting
const GREETING_COOLDOWN_HOURS = 12; // Don't spam greetings

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTERNAL TYPES (Server-side only)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ProWelcomeInternalData {
  daysMissed: number;
  lastSeenAt: Date;
  lastGreetingAt: Date | null;
  hoursSinceGreeting: number | null;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Get PRO welcome context (internal - with raw data)
 * @internal Server-side only - use getSafeProWelcomeHints for LLM
 */
export async function getProWelcomeContext(userId: string): Promise<WelcomeBackContext | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        planType: true,
        lastSeenAt: true,
        lastGreetingAt: true,
      },
    });

    // Only for PRO plan
    if (!user || user.planType !== 'PRO') {
      return null;
    }

    // Feature not enabled for this plan
    if (!PRO_CONFIG.enabled) {
      return null;
    }

    // New user - no greeting needed
    if (!user.lastSeenAt) {
      return null;
    }

    const hoursSinceLastSeen = (Date.now() - user.lastSeenAt.getTime()) / (1000 * 60 * 60);
    const daysSinceLastSeen = Math.floor(hoursSinceLastSeen / 24);

    // Outside valid range
    if (daysSinceLastSeen > PRO_CONFIG.maxLookbackDays || daysSinceLastSeen < MIN_GAP_DAYS) {
      return null;
    }

    // Check greeting cooldown
    if (user.lastGreetingAt) {
      const hoursSinceGreeting = (Date.now() - user.lastGreetingAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceGreeting < GREETING_COOLDOWN_HOURS) {
        return null; // Don't spam greetings
      }
    }

    console.log(`[ProWelcome] 👋 Welcome context for PRO user`);

    return {
      shouldConsiderGreeting: true,
      daysMissed: daysSinceLastSeen, // INTERNAL ONLY - don't send to LLM
    };
  } catch (error) {
    console.error('[ProWelcome] Error getting welcome context:', error);
    return null;
  }
}

/**
 * Get SAFE PRO welcome hints for LLM
 * Rule: LLM gets STYLE, Server makes DECISION
 * 
 * @param userId - User ID
 * @returns Safe hints for LLM (no raw numbers)
 */
export async function getSafeProWelcomeHints(userId: string): Promise<SafeProWelcomeHints | null> {
  try {
    const cacheKey = createWelcomeCacheKey(userId, 'PRO');

    // Check cache
    const cached = memoryCache.get<SafeProWelcomeHints>(cacheKey);
    if (cached) {
      console.log('[ProWelcome] ✅ Serving hints from cache');
      return cached;
    }

    // Get internal context
    const context = await getProWelcomeContext(userId);

    if (!context || !context.shouldConsiderGreeting) {
      return null;
    }

    // SERVER DECIDES: Convert raw data to safe hints
    const hints = convertToSafeHints(context.daysMissed!);

    // Cache the hints (short TTL - 5 minutes)
    memoryCache.set(cacheKey, hints, 5 * 60 * 1000);

    console.log('[ProWelcome] ✅ Safe hints generated');
    return hints;
  } catch (error) {
    console.error('[ProWelcome] Error getting safe hints:', error);
    return null;
  }
}

/**
 * Convert raw days to safe hints
 * This is where SERVER DECIDES - LLM just follows style
 * 
 * @internal
 */
function convertToSafeHints(daysMissed: number): SafeProWelcomeHints {
  // SERVER DECISION: Determine hint category (no exact numbers to LLM)
  let hint: SafeProWelcomeHints['hint'];
  let tone: SafeProWelcomeHints['tone'];

  if (daysMissed <= 2) {
    hint = 'short_gap';
    tone = 'light';
  } else if (daysMissed <= 4) {
    hint = 'few_days';
    tone = 'friendly';
  } else {
    hint = 'week_gap';
    tone = 'friendly';
  }

  return {
    allowGreeting: true,
    tone,
    hint,
    skipIf: [
      'User asks direct technical question',
      'User seems in hurry or professional mode',
      'User message is very brief (hi, hello)',
      'Greeting would feel forced',
    ],
  };
}

/**
 * Update last seen timestamp
 * Call after every message
 */
export async function updateProLastSeen(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { lastSeenAt: new Date() },
    });
    console.log(`[ProWelcome] ✅ Updated lastSeenAt for user: ${userId}`);
  } catch (error) {
    console.error('[ProWelcome] Error updating last seen:', error);
  }
}

/**
 * Mark greeting as shown (prevent spam)
 * Call after greeting is displayed
 */
export async function markProGreetingShown(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { lastGreetingAt: new Date() },
    });

    // Clear cache to refresh hints
    const cacheKey = createWelcomeCacheKey(userId, 'PRO');
    memoryCache.delete(cacheKey);

    console.log(`[ProWelcome] ✅ Marked greeting shown for user: ${userId}`);
  } catch (error) {
    console.error('[ProWelcome] Error marking greeting:', error);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROMPT BUILDER (Safe for LLM)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Build safe prompt section for LLM
 * NO raw data - only style guidance
 */
export function buildProWelcomePrompt(hints: SafeProWelcomeHints): string {
  if (!hints.allowGreeting) {
    return '';
  }

  // Map hint to natural language (no numbers!)
  const gapDescription = {
    short_gap: 'a brief gap',
    few_days: 'a few days',
    week_gap: 'some time',
  }[hints.hint];

  return `
## WELCOME BACK SUGGESTION (PRO PLAN - Optional)

**Context:** User returning after ${gapDescription}.

**Tone:** ${hints.tone}

**Your CHOICE - Use judgment:**
- You MAY greet naturally if it fits the conversation
- You MAY skip if greeting would feel forced
- Keep it simple, casual, friendly

**Style hints:**
- Light, natural acknowledgment
- No exact day mentions ("5 days ago")
- Feel like a friend noticing, not tracking

**Skip greeting if:**
${hints.skipIf.map(s => `- ${s}`).join('\n')}

**Remember:** This is a SUGGESTION. Prioritize natural conversation flow!
`.trim();
}