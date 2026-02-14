/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA CHAT SERVICE v3.0 - LEAN PROMPT EDITION
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * TOKEN OPTIMIZATION v3.0 (February 14, 2026):
 * 
 * PROBLEM: 9360 char system prompts (2300+ tokens) caused by:
 * - Multiple blocks stacking (delta + intelligence + location + welcome + time + style)
 * - Search context always 1200 chars
 * - Style block always added
 * - Date/time always added
 * - Welcome section always for PRO/APEX
 * 
 * SOLUTION: Selective injection based on query complexity
 * 
 * PROMPT TIERS:
 * - MICRO (greetings/ack): ~100 chars (~25 tokens)
 * - MINI (search queries): ~300 chars + search data (~75 tokens + search)
 * - LIGHT (simple queries): ~500 chars (~125 tokens)
 * - FULL (complex queries): ~800 chars (~200 tokens)
 * 
 * SAVINGS: 70-85% token reduction on system prompts
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ═══════════════════════════════════════════════════════════════
// LEAN PROMPT BUILDER v3.0
// ═══════════════════════════════════════════════════════════════

export type PromptTier = 'MICRO' | 'MINI' | 'LIGHT' | 'FULL';

interface LeanPromptConfig {
  tier: PromptTier;
  userName?: string;
  language: 'english' | 'hinglish' | 'hindi';
  searchData?: string;
  location?: string;
  dateTime?: string;
  planType?: string;
}

/**
 * 🎯 LEAN PROMPT BUILDER v3.0
 * 
 * Generates minimal system prompts based on query complexity.
 * Replaces the old stacking approach that caused 9360 char prompts.
 */
export function buildLeanSystemPrompt(config: LeanPromptConfig): string {
  const { tier, userName, language, searchData, location, dateTime, planType } = config;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MICRO TIER (~100 chars) - Greetings, acknowledgments
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (tier === 'MICRO') {
    const greeting = language === 'hinglish' || language === 'hindi'
      ? `Tum Soriva ho, Risenex ki AI.${userName ? ` User: ${userName}.` : ''} Friendly raho. Gaali pe calm boundary set karo.`
      : `You are Soriva, AI by Risenex.${userName ? ` User: ${userName}.` : ''} Be friendly. If insulted, stay calm and set boundary.`;
    return greeting;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MINI TIER (~300 chars + search) - Search queries
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (tier === 'MINI') {
    const base = language === 'hinglish' || language === 'hindi'
      ? `Tum Soriva ho. SIRF neeche ke data se jawab do. Jo nahi mile, bolo "exact info nahi mili".`
      : `You are Soriva. Answer ONLY from data below. If not found, say "exact info not available".`;
    
    if (searchData) {
      return `${base}\n\n<data>\n${searchData}\n</data>`;
    }
    return base;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LIGHT TIER (~500 chars) - Simple questions
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (tier === 'LIGHT') {
    const identity = language === 'hinglish' || language === 'hindi'
      ? `Tum Soriva ho, Risenex Dynamics (India) ki female AI assistant.`
      : `You are Soriva, female AI assistant by Risenex Dynamics (India).`;
    
    const rules = language === 'hinglish' || language === 'hindi'
      ? `Helpful, concise, accurate raho. Facts mat banao. KABHI BHI raw JSON, code blocks, ya technical data user ko mat dikhao - sirf human-readable text mein jawab do. Agar user gaali ya insult kare, calmly boundary set karo aur help offer karo.`
      : `Be helpful, concise, accurate. Never invent facts. NEVER show raw JSON, code blocks, or technical data to user - always respond in human-readable text only. If user insults you, stay calm, set a polite boundary, and continue offering help.`;
    
    const langRule = language === 'hinglish'
      ? `User Hinglish mein hai, tum bhi Hinglish mein reply karo.`
      : language === 'hindi'
      ? `User Hindi mein hai, Hindi mein reply karo.`
      : '';
    
    let prompt = `${identity}\n${rules}`;
    if (langRule) prompt += `\n${langRule}`;
    if (userName) prompt += `\nUser: ${userName}`;
    if (dateTime) prompt += `\n${dateTime}`;
    
    return prompt;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FULL TIER (~800 chars) - Complex/technical queries
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const identity = language === 'hinglish' || language === 'hindi'
    ? `Tum Soriva ho, Risenex Dynamics (India) ki female AI assistant.`
    : `You are Soriva, female AI assistant by Risenex Dynamics (India).`;
  
  const rules = `RULES:
- Be helpful, accurate, thorough
- Never claim to be other AI
- Never invent facts or data
- If uncertain, acknowledge
- NEVER output raw JSON, internal data structures, or visualization configs to user
- ALWAYS respond in natural human-readable language
- If user insults you, stay calm, set a polite boundary, and continue offering help`;

  const langRule = language === 'hinglish'
    ? `LANGUAGE: User Hinglish mein hai. Hinglish mein reply karo. Female verbs: karti hoon, batati hoon.`
    : language === 'hindi'
    ? `LANGUAGE: Hindi mein reply karo.`
    : '';

  let prompt = `${identity}\n\n${rules}`;
  if (langRule) prompt += `\n\n${langRule}`;
  if (userName) prompt += `\n\nUser: ${userName}`;
  if (location) prompt += `\nLocation: ${location}`;
  if (dateTime) prompt += `\n${dateTime}`;
  
  // Plan-specific warmth (minimal)
  if (planType === 'APEX' || planType === 'SOVEREIGN') {
    prompt += `\n\nPREMIUM USER: Extra helpful and thorough.`;
  }

  return prompt;
}

/**
 * 🎯 DETERMINE PROMPT TIER
 * 
 * Classifies query to select appropriate prompt tier.
 */
export function getPromptTier(
  isGreeting: boolean,
  isSearchQuery: boolean,
  complexity: 'SIMPLE' | 'MEDIUM' | 'HIGH'
): PromptTier {
  if (isGreeting) return 'MICRO';
  if (isSearchQuery) return 'MINI';
  if (complexity === 'SIMPLE') return 'LIGHT';
  if (complexity === 'MEDIUM') return 'LIGHT';
  return 'FULL';
}

/**
 * 🎯 LEAN SEARCH CONTEXT BUILDER
 * 
 * Builds minimal search context (max 800 chars instead of 1200)
 */
export function buildLeanSearchContext(
  searchFact: string,
  isNumberQuery: boolean = false
): string {
  // Clean and truncate
  const cleaned = searchFact
    .replace(/\s+/g, ' ')
    .replace(/Source:\s*https?:\/\/\S+/gi, '')
    .trim();
  
  // Shorter limit for efficiency
  const MAX_CHARS = 800;
  const trimmed = cleaned.substring(0, MAX_CHARS);
  
  // Quality warning only if needed
  const hasNumber = /\d+(\.\d+)?\s*\/\s*10|\d+%|\₹\d+|Rs\.?\s*\d+|\$\d+/.test(trimmed);
  const needsWarning = isNumberQuery && !hasNumber;
  
  let context = trimmed;
  if (needsWarning) {
    context = `⚠ Data may be incomplete.\n${context}`;
  }
  
  return context;
}

/**
 * 🎯 LEAN HISTORY SELECTOR
 * 
 * Selects minimal history based on query type.
 */
export function selectLeanHistory(
  fullHistory: Array<{ role: string; content: string }>,
  isSearchQuery: boolean,
  isFollowUp: boolean
): Array<{ role: string; content: string }> {
  // Search queries: minimal history (last 2 exchanges max)
  if (isSearchQuery && !isFollowUp) {
    return fullHistory.slice(-4); // Last 2 exchanges
  }
  
  // Follow-up or general: last 4 exchanges
  if (isSearchQuery && isFollowUp) {
    return fullHistory.slice(-8);
  }
  
  // General queries: last 6 exchanges
  return fullHistory.slice(-12);
}

/**
 * 🎯 DETECT FOLLOW-UP QUERY
 */
export function isFollowUpQuery(message: string): boolean {
  const followUpPatterns = /\b(aur|and|also|iske|uske|iska|uska|more|detail|explain|elaborate|phir|then|next|aage|continue|batao|btao)\b/i;
  return followUpPatterns.test(message);
}

// ═══════════════════════════════════════════════════════════════
// INTEGRATION EXAMPLE
// ═══════════════════════════════════════════════════════════════
// 
// Replace this section in chat.service.ts:
//
// OLD (lines 1186-1206):
// ```
// if (orchestratorResult?.searchNeeded) {
//   deltaPrompt = buildSearchDelta(true, message, locationString, detectedLanguage as any);
//   promptMode = 'MINI (search)';
// } else if (isSearchQueryFromRouter) {
//   ...
// }
// ```
//
// NEW:
// ```
// const promptTier = getPromptTier(
//   isGreeting,
//   isSearchQuery,
//   orchestratorResult?.complexity || 'SIMPLE'
// );
// 
// const leanPrompt = buildLeanSystemPrompt({
//   tier: promptTier,
//   userName: user.name || undefined,
//   language: detectedLanguage as any,
//   searchData: searchContext || undefined,
//   location: !isSearchQuery ? locationString : undefined,
//   dateTime: !isSearchQuery ? `${currentDate}, ${currentTime}` : undefined,
//   planType: user.planType,
// });
// 
// finalSystemPrompt = leanPrompt;
// ```
//
// This replaces:
// - buildSearchDelta()
// - buildGreetingDelta()
// - buildDelta()
// - Manual stacking of location, welcome, time, style blocks
//
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// EXPECTED TOKEN SAVINGS
// ═══════════════════════════════════════════════════════════════
//
// BEFORE (9360 chars = ~2300 tokens):
// - Delta prompt: 300 chars
// - Intelligence prompt: 0 chars (after orchestrator fix)
// - Location: 50 chars
// - Welcome: 100 chars
// - Time-aware: 50 chars
// - Date: 50 chars
// - Search data: 1200 chars
// - Style block: 100 chars
// - Instructions: 200 chars
// - History (8 msgs): 4000 chars
// TOTAL: ~6000-9000 chars
//
// AFTER (Lean approach):
// - MICRO tier: 100 chars (~25 tokens)
// - MINI tier: 300 + 800 search = 1100 chars (~275 tokens)
// - LIGHT tier: 500 chars (~125 tokens)
// - FULL tier: 800 chars (~200 tokens)
// - History: reduced by 50%
//
// SAVINGS: 70-85% reduction in system prompt tokens
//
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// 🛡️ JSON DUMP SANITIZER - Permanent fix for raw JSON in responses
// ═══════════════════════════════════════════════════════════════

/**
 * Removes raw JSON dumps from LLM responses
 * This catches cases where LLM accidentally outputs visualization configs,
 * internal data structures, or other technical JSON to the user.
 */
export function sanitizeJsonDumps(response: string): string {
  let cleaned = response;
  
  // Pattern 1: JSON object at start of line with technical keys
  // Matches: { "subject": "physics", "type": "custom-drag-types", ...
  const technicalJsonPattern = /^\s*\{[\s\S]*?"(?:subject|type|renderInstructions|primitives|layout|visualization)"[\s\S]*?\}$/gm;
  
  // Pattern 2: Visualization: followed by JSON
  const visualizationJsonPattern = /Visualization:\s*\n?\s*\{[\s\S]*?\}\s*$/gi;
  
  // Pattern 3: Any JSON block with renderInstructions (very specific)
  const renderInstructionsPattern = /\{[^{}]*"renderInstructions"[^{}]*\{[\s\S]*?\}\s*\}/g;
  
  // Pattern 4: Code blocks containing JSON with technical keys
  const codeBlockJsonPattern = /```(?:json)?\s*\n?\s*\{[\s\S]*?"(?:subject|type|renderInstructions|primitives)"[\s\S]*?\}\s*\n?```/gi;
  
  // Apply all patterns
  cleaned = cleaned.replace(technicalJsonPattern, '');
  cleaned = cleaned.replace(visualizationJsonPattern, '');
  cleaned = cleaned.replace(renderInstructionsPattern, '');
  cleaned = cleaned.replace(codeBlockJsonPattern, '');
  
  // Clean up leftover "Visualization:" text
  cleaned = cleaned.replace(/Visualization:\s*$/gim, '');
  
  // Clean up excessive whitespace
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
  
  // Log if we removed something
  if (cleaned.length < response.length - 50) {
    console.log('[LeanPrompt] 🛡️ Sanitized raw JSON dump from response:', {
      originalLength: response.length,
      cleanedLength: cleaned.length,
      removed: response.length - cleaned.length,
    });
  }
  
  return cleaned;
}

export default {
  buildLeanSystemPrompt,
  getPromptTier,
  buildLeanSearchContext,
  selectLeanHistory,
  isFollowUpQuery,
  sanitizeJsonDumps,
};