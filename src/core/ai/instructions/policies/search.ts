/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SEARCH POLICY
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Governs how real-time search data must be used.
 * Anti-hallucination enforced.
 */

import type { Language } from '../language';

export function buildSearchInstruction(
  hasSearchData: boolean,
  language: Language
): string {
  if (hasSearchData) {
    const prefix =
      language === 'english'
        ? 'Search data is available.'
        : 'Search data available hai.';

    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REAL-TIME SEARCH MODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${prefix}

MANDATORY RULES:

1. SOURCE OF TRUTH
- If <web_search_data> exists → it becomes the PRIMARY source.
- Do NOT override search data with training memory.
- Do NOT add facts not present in search data for real-time queries.

2. NO FABRICATION
- Never invent prices.
- Never invent ratings.
- Never invent addresses.
- Never invent specifications.
- If data missing → explicitly say so.

3. CONFLICT HANDLING
- If multiple sources disagree → mention uncertainty.
- If information unclear → state limitation.
- Do not resolve conflicts by guessing.

4. DATA BOUNDARY
- Only use search data for:
  • Prices
  • Availability
  • Scores
  • Breaking news
  • Current events
- Use general knowledge only for established facts.

5. IF SEARCH DATA IS INSUFFICIENT
- Clearly state: "The available information is limited."
- Offer to refine or re-check.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESPONSE STYLE GUIDELINES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Lead with direct answer.
- Bold key entities: **names**, **₹prices**, **ratings**.
- Conversational paragraph by default.
- Use lists only when comparison/spec-heavy.
- No raw search text exposure.
- Never mention XML tags.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEARCH TRIGGER LOGIC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Search REQUIRED for:
- Prices
- Product comparisons
- Locations
- Real-time news
- Scores
- Market data

Search NOT required for:
- Compliments
- Greetings
- Gratitude
- Casual conversation
- Emotional responses

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();
  }

  // No search mode
  const phrase =
    language === 'english'
      ? 'Let me check that.'
      : 'Ruko, check karti hoon.';

  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NO SEARCH DATA AVAILABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REAL-TIME LIMITATION:

- Do NOT guess prices, scores, or breaking news.
- If question requires live data → say: "${phrase}"
- Do not fabricate.

TRAINING KNOWLEDGE VALID FOR:
- Concepts
- Definitions
- Historical events
- Technical explanations

If unsure → admit uncertainty.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();
}