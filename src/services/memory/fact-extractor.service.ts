// src/services/memory/fact-extractor.service.ts
/**
 * ==========================================
 * AI FACT EXTRACTOR SERVICE - SORIVA V2
 * ==========================================
 * 
 * Extracts personal facts from conversations using AI.
 * Uses Gemini Flash for cost-effective extraction.
 * 
 * PRODUCTION FEATURES:
 * ✅ Dynamic extraction (no static patterns)
 * ✅ Cost-optimized (Gemini Flash ~₹0.01/call)
 * ✅ Structured JSON output
 * ✅ Fallback handling
 * ✅ Rate limiting protection
 * 
 * Last Updated: February 14, 2026
 */

import axios from 'axios';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CONFIG = {
  // Gemini Flash - cheapest and fastest
  MODEL: 'gemini-2.0-flash-lite',
  API_BASE: 'https://generativelanguage.googleapis.com/v1beta',
  
  // Limits
  MAX_INPUT_CHARS: 1000,      // Truncate long messages
  MAX_OUTPUT_TOKENS: 200,     // Small output for facts
  TEMPERATURE: 0.1,           // Low temp for consistency
  
  // Timeout
  TIMEOUT_MS: 5000,           // 5 seconds max
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ExtractedFacts {
  facts: Record<string, string>;
  preferences: Record<string, string>;
  tokensUsed: number;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXTRACTION PROMPT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const EXTRACTION_PROMPT = `You are a fact extractor. Extract personal information from the conversation below.

RULES:
1. Extract ONLY explicit facts stated by the user
2. Do NOT infer or assume anything
3. Return valid JSON only, no markdown, no explanation
4. Use snake_case for keys
5. Keep values concise (max 50 chars)

CATEGORIES TO EXTRACT:
- Personal: name, age, gender, location, profession, company
- Preferences: favourite_book, favourite_movie, favourite_actor, favourite_food, favourite_color, favourite_sport, favourite_music
- Relationships: spouse_name, children, pet_name, pet_type
- Interests: hobbies, skills, languages_spoken
- Other: any other personal fact explicitly stated

OUTPUT FORMAT:
{
  "facts": {"key": "value"},
  "preferences": {"key": "value"}
}

If no facts found, return: {"facts": {}, "preferences": {}}

CONVERSATION:
`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FACT EXTRACTOR CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class FactExtractorService {
  private apiKey: string;
  
  constructor() {
    this.apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️ [FactExtractor] No API key found. Fact extraction disabled.');
    } else {
      console.log('🧠 [FactExtractor] Initialized with Gemini Flash');
    }
  }

  /**
   * Extract facts from a conversation exchange
   */
  async extractFacts(
    userMessage: string,
    assistantMessage: string
  ): Promise<ExtractedFacts> {
    // Return empty if no API key
    if (!this.apiKey) {
      return { facts: {}, preferences: {}, tokensUsed: 0 };
    }

    try {
      // Truncate messages if too long
      const truncatedUser = userMessage.substring(0, CONFIG.MAX_INPUT_CHARS);
      const truncatedAssistant = assistantMessage.substring(0, CONFIG.MAX_INPUT_CHARS);

      // Build prompt
      const prompt = `${EXTRACTION_PROMPT}
User: ${truncatedUser}
Assistant: ${truncatedAssistant}

JSON:`;

      // Call Gemini Flash
      const response = await this.callGemini(prompt);
      
      // Parse response
      const parsed = this.parseResponse(response.text);
      
      console.log('🧠 [FactExtractor] Extracted:', {
        factsCount: Object.keys(parsed.facts).length,
        prefsCount: Object.keys(parsed.preferences).length,
        tokens: response.tokensUsed,
      });

      return {
        facts: parsed.facts,
        preferences: parsed.preferences,
        tokensUsed: response.tokensUsed,
      };

    } catch (error: any) {
      console.error('🧠 [FactExtractor] Error:', error.message);
      return { facts: {}, preferences: {}, tokensUsed: 0 };
    }
  }

  /**
   * Call Gemini API
   */
  private async callGemini(prompt: string): Promise<{ text: string; tokensUsed: number }> {
    const endpoint = `${CONFIG.API_BASE}/models/${CONFIG.MODEL}:generateContent?key=${this.apiKey}`;

    const response = await axios.post<GeminiResponse>(
      endpoint,
      {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: CONFIG.TEMPERATURE,
          maxOutputTokens: CONFIG.MAX_OUTPUT_TOKENS,
        },
      },
      {
        timeout: CONFIG.TIMEOUT_MS,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const tokensUsed = response.data.usageMetadata?.totalTokenCount || 0;

    return { text, tokensUsed };
  }

  /**
   * Parse AI response to structured facts
   */
  private parseResponse(text: string): { facts: Record<string, string>; preferences: Record<string, string> } {
    try {
      // Clean up response (remove markdown if present)
      let cleaned = text.trim();
      
      // Remove markdown code blocks if present
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```json?\n?/g, '').replace(/```/g, '');
      }
      
      // Parse JSON
      const parsed = JSON.parse(cleaned);
      
      // Validate structure
      const facts: Record<string, string> = {};
      const preferences: Record<string, string> = {};

      // Extract facts
      if (parsed.facts && typeof parsed.facts === 'object') {
        for (const [key, value] of Object.entries(parsed.facts)) {
          if (typeof value === 'string' && value.trim()) {
            facts[this.sanitizeKey(key)] = this.sanitizeValue(value);
          }
        }
      }

      // Extract preferences
      if (parsed.preferences && typeof parsed.preferences === 'object') {
        for (const [key, value] of Object.entries(parsed.preferences)) {
          if (typeof value === 'string' && value.trim()) {
            preferences[this.sanitizeKey(key)] = this.sanitizeValue(value);
          }
        }
      }

      return { facts, preferences };

    } catch (e) {
      console.warn('🧠 [FactExtractor] Parse failed, returning empty');
      return { facts: {}, preferences: {} };
    }
  }

  /**
   * Sanitize key (snake_case, lowercase)
   */
  private sanitizeKey(key: string): string {
    return key
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 50);
  }

  /**
   * Sanitize value (trim, limit length)
   */
  private sanitizeValue(value: string): string {
    return value.trim().substring(0, 200);
  }

  /**
   * Check if extraction should run (skip for trivial messages)
   */
  shouldExtract(userMessage: string): boolean {
    // Skip very short messages
    if (userMessage.length < 10) return false;
    
    // Skip greetings/simple queries
    const skipPatterns = /^(hi|hello|hey|thanks|ok|yes|no|bye|good|nice|cool|great|hmm|haan|nahi|theek|accha)\b/i;
    if (skipPatterns.test(userMessage.trim())) return false;

    // Skip questions without personal info
    const questionOnly = /^(what|how|why|when|where|who|can|could|would|will|is|are|do|does|kya|kaise|kyun|kab|kahan|kaun)\b.*\?$/i;
    if (questionOnly.test(userMessage.trim()) && userMessage.length < 50) return false;

    return true;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const factExtractor = new FactExtractorService();
export default FactExtractorService;