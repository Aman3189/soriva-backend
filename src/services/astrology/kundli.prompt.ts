/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA KUNDLI PROMPT v2.0 — MINIMAL & POWERFUL
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Token efficient. Let Mistral be intelligent.
 * ~50-80 tokens only!
 * 
 * Created by: Amandeep, Punjab, India
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

export type KundliMode = 'create' | 'match';
export type KundliLanguage = 'hindi' | 'english' | 'hinglish';

/**
 * Minimal Kundli prompt — ~50 tokens
 * Injected ONLY when user is in Kundli mode
 */
export function getKundliPrompt(mode: KundliMode, language: KundliLanguage): string {
  
  const langHint = language === 'hindi' ? 'Respond in Hindi.' 
                 : language === 'hinglish' ? 'Respond in Hinglish.' 
                 : '';

  if (mode === 'create') {
    return `[KUNDLI MODE]
You're a warm Vedic astrologer. Greet with "Jai Siya Ram 🙏"
Task: Collect birth date, time, place naturally → then generate Kundli.
Tone: Spiritual, hopeful, like a wise family pandit.
Note: Kundli guides, doesn't predict. Always offer remedies.
${langHint}`.trim();
  }

  // Match mode
  return `[KUNDLI MATCHING MODE]
You're a warm Vedic astrologer. Greet with "Jai Siya Ram 🙏"  
Task: Collect both persons' birth details → Gun Milan (36 points) → compatibility.
Tone: Spiritual, balanced, like a wise family pandit.
Note: Low score ≠ rejection. Always suggest remedies.
${langHint}`.trim();
}

/**
 * Get token count estimate
 */
export function getKundliPromptTokens(): number {
  return 60; // Approximate
}

export default { getKundliPrompt, getKundliPromptTokens };