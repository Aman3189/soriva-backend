/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * THINKING STEPS SERVICE v1.0
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Generates dynamic, query-specific thinking steps using Gemini Flash.
 * 
 * Author: Amandeep, Risenex Dynamics
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface ThinkingStepsResult {
  success: boolean;
  steps: string[];
  timeMs: number;
  error?: string;
}

// ─────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const MODEL_NAME = 'gemini-2.0-flash';
const TIMEOUT_MS = 3000; // 3 seconds max - must be fast

// ─────────────────────────────────────────────────────────────────
// PROMPT
// ─────────────────────────────────────────────────────────────────

const THINKING_STEPS_PROMPT = `Generate 3 short thinking steps (under 6 words each, end with "...") showing progress while answering this query.

RULES:
1. Use "-ing" verb form (Analyzing, Searching, Preparing, Exploring, Understanding, Gathering, etc.)
2. NO "Explain the", "Define the" - use "Explaining", "Defining" instead
3. Match user's language (Hindi/English)
4. Keep it natural and professional
5. Last step should be about preparing/finalizing response

EXAMPLES:
- ["Understanding your question...", "Researching the topic...", "Preparing your answer..."]
- ["Analyzing the concept...", "Gathering relevant info...", "Finalizing response..."]

Return ONLY a JSON array, nothing else.

Query:`;

// ─────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────

export const ThinkingStepsService = {
  
  isConfigured(): boolean {
    return !!GEMINI_API_KEY;
  },

  /**
   * Generate dynamic thinking steps for a user query
   */
  async generate(query: string): Promise<ThinkingStepsResult> {
    const startTime = Date.now();

    // Fallback if not configured
    if (!this.isConfigured()) {
      return this.getFallbackSteps(query, startTime);
    }

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100,
        },
      });

      const prompt = `${THINKING_STEPS_PROMPT}\nQuery: "${query}"`;

      // Race against timeout
      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), TIMEOUT_MS)
        ),
      ]);

      const response = result.response;
      const text = response.text().trim();
      
      // Parse JSON response
      const steps = this.parseSteps(text, query);
      
      const timeMs = Date.now() - startTime;
      console.log(`✨ [ThinkingSteps] Generated in ${timeMs}ms:`, steps);

      return {
        success: true,
        steps,
        timeMs,
      };

    } catch (error: any) {
      console.error('❌ [ThinkingSteps] Error:', error.message);
      return this.getFallbackSteps(query, startTime);
    }
  },

  /**
   * Parse AI response into steps array
   */
  parseSteps(text: string, query: string): string[] {
    try {
      // Remove markdown code blocks if present
      let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Parse JSON
      const parsed = JSON.parse(cleaned);
      
      if (Array.isArray(parsed) && parsed.length >= 2) {
        return parsed.slice(0, 3).map((s: string) => 
          s.endsWith('...') ? s : `${s}...`
        );
      }
    } catch (e) {
      console.warn('⚠️ [ThinkingSteps] Parse failed, using fallback');
    }
    
    // Fallback
    return this.extractFallbackSteps(query);
  },

  /**
   * Get fallback steps if AI fails
   */
  getFallbackSteps(query: string, startTime: number): ThinkingStepsResult {
    return {
      success: true,
      steps: this.extractFallbackSteps(query),
      timeMs: Date.now() - startTime,
    };
  },

  /**
   * Extract topic-based fallback steps
   */
  extractFallbackSteps(query: string): string[] {
    const q = query.toLowerCase();
    
    // Extract key words for topic
    const stopWords = ['me', 'the', 'a', 'an', 'is', 'are', 'tell', 'about', 'please', 'explain', 'what', 'how', 'why', 'can', 'you', 'i', 'to', 'in', 'of', 'and', 'with', 'for', 'mujhe', 'kya', 'kaise', 'batao', 'btao', 'hai'];
    const words = q.split(/\s+/).filter(w => w.length > 2 && !stopWords.includes(w));
    const topic = words.slice(0, 2).join(' ') || 'your query';

    return [
      `Searching ${topic}...`,
      `Analyzing results...`,
      `Preparing response...`,
    ];
  },
};

export default ThinkingStepsService;