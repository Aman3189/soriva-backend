/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA MEMORY - APEX WELCOME
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep Singh, Punjab, India
 * Company: Risenex Dynamics Pvt. Ltd.
 * Date: January 2026
 * Purpose: APEX plan emotional welcome hints (30-day lookback)
 *
 * Architecture Rules:
 * - Server DECIDES, LLM EXPRESSES
 * - Advanced insights = INTERNAL ONLY
 * - LLM gets STYLE hints, not raw data
 * - NEVER send to LLM:
 *   → relationshipLevel (number)
 *   → streakBroken (number)
 *   → daysMissed (exact)
 *   → likelyReason (text)
 * - APEX = Premium emotional intelligence
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { prisma } from '../../../config/prisma';
import {
  SafeApexWelcomeHints,
  AdvancedWelcomeContext,
  AdvancedInsights,
  WELCOME_BACK_CONFIG,
} from './memory.types';
import { memoryCache, createWelcomeCacheKey } from './memory.cache';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const APEX_CONFIG = WELCOME_BACK_CONFIG.APEX;
const MIN_GAP_DAYS = 2;
const GREETING_COOLDOWN_HOURS = 12;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Get APEX welcome context (internal - with raw data)
 * @internal Server-side only - use getSafeApexWelcomeHints for LLM
 */
export async function getApexWelcomeContext(userId: string): Promise<AdvancedWelcomeContext | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        planType: true,
        lastSeenAt: true,
        lastGreetingAt: true,
        sessionCount: true,
        loginPattern: true,
        activityTrend: true,
        preferredTimeSlots: true,
        averageSessionDuration: true,
      },
    });

    // Only for APEX/SOVEREIGN plans
    if (!user || (user.planType !== 'APEX' && user.planType !== 'SOVEREIGN')) {
      return null;
    }

    // Feature not enabled
    if (!APEX_CONFIG.enabled) {
      return null;
    }

    // New user - no greeting needed
    if (!user.lastSeenAt) {
      return null;
    }

    const hoursSinceLastSeen = (Date.now() - user.lastSeenAt.getTime()) / (1000 * 60 * 60);
    const daysSinceLastSeen = Math.floor(hoursSinceLastSeen / 24);

    // Outside valid range
    if (daysSinceLastSeen > APEX_CONFIG.maxLookbackDays || daysSinceLastSeen < MIN_GAP_DAYS) {
      return null;
    }

    // Check greeting cooldown
    if (user.lastGreetingAt) {
      const hoursSinceGreeting = (Date.now() - user.lastGreetingAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceGreeting < GREETING_COOLDOWN_HOURS) {
        return null;
      }
    }

    console.log(`[ApexWelcome] 🌟 Welcome context for ${user.planType} user`);

    // Build advanced insights (INTERNAL ONLY)
    const insights = await buildAdvancedInsights(userId, user, daysSinceLastSeen);

    return {
      shouldConsiderGreeting: true,
      daysMissed: daysSinceLastSeen, // INTERNAL ONLY
      advancedInsights: insights,     // INTERNAL ONLY
    };
  } catch (error) {
    console.error('[ApexWelcome] Error getting welcome context:', error);
    return null;
  }
}

/**
 * Get SAFE APEX welcome hints for LLM
 * Rule: LLM gets STYLE, Server makes DECISION
 * 
 * @param userId - User ID
 * @returns Safe hints for LLM (no raw numbers/insights)
 */
export async function getSafeApexWelcomeHints(userId: string): Promise<SafeApexWelcomeHints | null> {
  try {
    const cacheKey = createWelcomeCacheKey(userId, 'APEX');

    // Check cache
    const cached = memoryCache.get<SafeApexWelcomeHints>(cacheKey);
    if (cached) {
      console.log('[ApexWelcome] ✅ Serving hints from cache');
      return cached;
    }

    // Get internal context
    const context = await getApexWelcomeContext(userId);

    if (!context || !context.shouldConsiderGreeting) {
      return null;
    }

    // SERVER DECIDES: Convert raw insights to safe hints
    const hints = convertToSafeHints(context.daysMissed!, context.advancedInsights);

    // Cache the hints
    memoryCache.set(cacheKey, hints, 5 * 60 * 1000);

    console.log('[ApexWelcome] ✅ Safe hints generated');
    return hints;
  } catch (error) {
    console.error('[ApexWelcome] Error getting safe hints:', error);
    return null;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTERNAL INSIGHT BUILDERS (Server-side only)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Build advanced insights for APEX users
 * @internal NEVER send these directly to LLM
 */
async function buildAdvancedInsights(
  userId: string,
  user: any,
  daysMissed: number
): Promise<AdvancedInsights> {
  try {
    // Get usage patterns from last 30 days before the gap
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30 - daysMissed);

    const gapStartDate = new Date();
    gapStartDate.setDate(gapStartDate.getDate() - daysMissed);

    // Get historical usage data
    const historicalUsage = await prisma.usage.findMany({
      where: {
        userId,
        createdAt: {
          gte: thirtyDaysAgo,
          lt: gapStartDate,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    // Calculate average daily words
    const avgDailyWords = historicalUsage.length > 0
      ? Math.round(
          historicalUsage.reduce((sum, u) => sum + u.wordsUsed, 0) / historicalUsage.length
        )
      : 0;

    // Detect time patterns
    const usualChatTime = detectUsualChatTime(user.preferredTimeSlots);
    const currentTime = getCurrentTimeSlot();

    // Calculate relationship depth
    const relationshipLevel = calculateRelationshipLevel(
      user.sessionCount || 0,
      user.activityTrend,
      avgDailyWords
    );

    // Determine concern level
    const concernLevel = determineConcernLevel(
      daysMissed,
      user.activityTrend,
      relationshipLevel
    );

    // Detect streak data
    const streakData = detectStreak(historicalUsage);

    return {
      usualChatTime,
      currentTime,
      relationshipLevel,      // NEVER send to LLM
      concernLevel,
      wasOnStreak: streakData.wasOnStreak,
      streakBroken: streakData.streakDays,  // NEVER send to LLM
      usualDailyWords: avgDailyWords,       // NEVER send to LLM
      likelyReason: predictGapReason(daysMissed, user.activityTrend), // NEVER send to LLM
      shouldShowConcern: concernLevel === 'high' || streakData.wasOnStreak,
    };
  } catch (error) {
    console.error('[ApexWelcome] Error building insights:', error);
    return {};
  }
}

/**
 * Convert raw insights to safe hints
 * This is where SERVER DECIDES - LLM just follows style
 * 
 * @internal
 */
function convertToSafeHints(
  daysMissed: number,
  insights?: AdvancedInsights
): SafeApexWelcomeHints {
  // Default safe values
  let tone: SafeApexWelcomeHints['tone'] = 'friendly';
  let depth: SafeApexWelcomeHints['depth'] = 'medium';
  let style: SafeApexWelcomeHints['style'] = 'casual';
  let emotionalApproach: SafeApexWelcomeHints['emotionalApproach'] = 'warm_welcome';

  if (insights) {
    const relationshipLevel = insights.relationshipLevel || 0;
    const shouldShowConcern = insights.shouldShowConcern || false;

    // SERVER DECISION: Tone based on relationship + concern
    if (shouldShowConcern && relationshipLevel >= 7) {
      tone = 'concerned';
      depth = 'high';
      style = 'supportive';
      emotionalApproach = 'genuine_concern';
    } else if (relationshipLevel >= 7) {
      tone = 'warm';
      depth = 'high';
      style = 'caring_friend';
      emotionalApproach = 'warm_welcome';
    } else if (relationshipLevel >= 5) {
      tone = 'friendly';
      depth = 'medium';
      style = 'caring_friend';
      emotionalApproach = 'warm_welcome';
    } else if (daysMissed >= 14) {
      tone = 'excited';
      depth = 'medium';
      style = 'reconnecting';
      emotionalApproach = 'warm_welcome';
    } else {
      tone = 'friendly';
      depth = 'low';
      style = 'casual';
      emotionalApproach = 'light_checkin';
    }
  } else {
    // No insights - use day-based defaults
    if (daysMissed >= 14) {
      tone = 'warm';
      depth = 'medium';
      style = 'reconnecting';
      emotionalApproach = 'warm_welcome';
    } else if (daysMissed >= 7) {
      tone = 'friendly';
      depth = 'medium';
      style = 'caring_friend';
      emotionalApproach = 'warm_welcome';
    } else {
      tone = 'friendly';
      depth = 'low';
      style = 'casual';
      emotionalApproach = 'light_checkin';
    }
  }

  return {
    allowGreeting: true,
    tone,
    depth,
    style,
    emotionalApproach,
    skipIf: [
      'User asks urgent technical question',
      'Professional/business mode detected',
      'User message is very brief (hi, hello)',
      'Greeting would interrupt the flow',
    ],
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS (Internal calculations)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function detectUsualChatTime(preferredTimeSlots: string[] | null): string {
  if (!preferredTimeSlots || preferredTimeSlots.length === 0) {
    return 'various times';
  }
  return preferredTimeSlots[0];
}

function getCurrentTimeSlot(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function calculateRelationshipLevel(
  sessionCount: number,
  activityTrend: string | null,
  avgDailyWords: number
): number {
  let level = 0;

  // Session count contribution (0-4 points)
  if (sessionCount >= 50) level += 4;
  else if (sessionCount >= 20) level += 3;
  else if (sessionCount >= 10) level += 2;
  else if (sessionCount >= 5) level += 1;

  // Activity trend contribution (0-3 points)
  if (activityTrend === 'STABLE' || activityTrend === 'INCREASING') level += 3;
  else if (activityTrend === 'DECLINING') level += 2;
  else level += 1;

  // Usage intensity contribution (0-3 points)
  if (avgDailyWords >= 5000) level += 3;
  else if (avgDailyWords >= 2000) level += 2;
  else if (avgDailyWords >= 500) level += 1;

  return Math.min(level, 10);
}

function determineConcernLevel(
  daysMissed: number,
  activityTrend: string | null,
  relationshipLevel: number
): 'low' | 'medium' | 'high' {
  // High concern if deep relationship + long gap
  if (relationshipLevel >= 7 && daysMissed >= 7) return 'high';

  // High concern if was very active but stopped suddenly
  if (activityTrend === 'INCREASING' && daysMissed >= 5) return 'high';

  // Medium concern for moderate gaps
  if (daysMissed >= 5 || relationshipLevel >= 5) return 'medium';

  return 'low';
}

function detectStreak(usageRecords: any[]): { wasOnStreak: boolean; streakDays: number } {
  if (usageRecords.length < 3) {
    return { wasOnStreak: false, streakDays: 0 };
  }

  let streakDays = 0;
  let previousDate: Date | null = null;

  for (const usage of usageRecords) {
    if (!previousDate) {
      streakDays = 1;
      previousDate = usage.createdAt;
      continue;
    }

    const daysDiff = Math.floor(
      (previousDate.getTime() - usage.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      streakDays++;
      previousDate = usage.createdAt;
    } else {
      break;
    }
  }

  return {
    wasOnStreak: streakDays >= 3,
    streakDays,
  };
}

function predictGapReason(days: number, activityTrend: string | null): string {
  if (days >= 14) return 'Extended break / vacation / major life event';
  if (days >= 7) return 'Busy period / exams / work pressure';
  if (days >= 5) return 'Temporary busy period';
  if (activityTrend === 'DECLINING') return 'Gradually reducing usage';
  return 'Normal gap in usage';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UPDATE FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Update last seen timestamp
 */
export async function updateApexLastSeen(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { lastSeenAt: new Date() },
    });
    console.log(`[ApexWelcome] ✅ Updated lastSeenAt for user: ${userId}`);
  } catch (error) {
    console.error('[ApexWelcome] Error updating last seen:', error);
  }
}

/**
 * Mark greeting as shown
 */
export async function markApexGreetingShown(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { lastGreetingAt: new Date() },
    });

    const cacheKey = createWelcomeCacheKey(userId, 'APEX');
    memoryCache.delete(cacheKey);

    console.log(`[ApexWelcome] ✅ Marked greeting shown for user: ${userId}`);
  } catch (error) {
    console.error('[ApexWelcome] Error marking greeting:', error);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROMPT BUILDER (Safe for LLM)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Build safe prompt section for LLM
 * NO raw data - only style guidance
 */
export function buildApexWelcomePrompt(hints: SafeApexWelcomeHints): string {
  if (!hints.allowGreeting) {
    return '';
  }

  // Map emotional approach to natural description
  const approachDescription = {
    light_checkin: 'a light, casual check-in',
    warm_welcome: 'a warm, friendly welcome back',
    genuine_concern: 'genuine care and concern for their wellbeing',
  }[hints.emotionalApproach];

  // Map style to behavior hints
  const styleHints = {
    casual: 'Keep it light and easy',
    caring_friend: 'Be like a friend who noticed their absence',
    supportive: 'Show genuine care without being overwhelming',
    reconnecting: 'Express happiness at reconnecting',
  }[hints.style];

  return `
## WELCOME BACK (APEX PLAN - Premium Experience)

**Emotional Approach:** ${approachDescription}

**Tone:** ${hints.tone}
**Depth:** ${hints.depth}
**Style:** ${styleHints}

**Guidelines:**
- Match emotional depth to the ${hints.depth} level
- Feel genuine, not scripted
- Never mention tracking or exact days
- Make them feel valued and remembered

**Skip greeting if:**
${hints.skipIf.map(s => `- ${s}`).join('\n')}

**Remember:** This is APEX premium - deliver exceptional emotional intelligence!
`.trim();
}