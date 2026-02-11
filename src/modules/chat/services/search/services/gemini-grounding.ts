/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * GEMINI GROUNDING SERVICE v1.0
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Gemini Flash 2.0 + Google Grounding (FREE search!)
 * 
 * Cost: $0.10/1M input, $0.40/1M output
 * Grounding: FREE (included with Gemini API)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface GroundingResult {
  success: boolean;
  answer: string;
  sources: GroundingSource[];
  searchQuery: string;
  timeMs: number;
  tokensUsed: {
    input: number;
    output: number;
  };
  error?: string;
}

export interface GroundingSource {
  title: string;
  url: string;
  snippet?: string;
  domain?: string;  // Clean domain name for citation badge
}

// ─────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const MODEL_NAME = 'gemini-2.0-flash';
const TIMEOUT_MS = 15000;

// ─────────────────────────────────────────────────────────────────
// GEMINI GROUNDING SERVICE
// ─────────────────────────────────────────────────────────────────

export const GeminiGroundingService = {
  
  isConfigured(): boolean {
    return !!GEMINI_API_KEY;
  },

  async search(query: string, options?: {
    location?: string;
    language?: 'hi' | 'en';
  }): Promise<GroundingResult> {
    const startTime = Date.now();
    
    if (!this.isConfigured()) {
      return {
        success: false,
        answer: '',
        sources: [],
        searchQuery: query,
        timeMs: 0,
        tokensUsed: { input: 0, output: 0 },
        error: 'Gemini API key not configured',
      };
    }

    try {
     const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        tools: [
          {
            googleSearch: {},
          } as any,
        ],
      });
        // Build prompt with location context
      const locationContext = options?.location ? `Location: ${options.location}. ` : '';
      const languageHint = options?.language === 'hi' 
        ? 'Reply in Hinglish (Hindi-English mix).' 
        : '';
      
      const prompt = `${locationContext}${languageHint}

Query: ${query}

Instructions:
- Use Google Search to find the most accurate and up-to-date information
- Provide factual answer with sources
- If asking about ratings, prices, or dates - give exact numbers
- For local queries, include specific names and addresses`;

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔍 [Gemini Grounding v1.0] SEARCH');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📝 Query: "${query}"`);
      console.log(`📍 Location: ${options?.location || 'Not specified'}`);

      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), TIMEOUT_MS)
        ),
      ]);

      const response = result.response;
      const text = response.text();
      
      // Extract grounding metadata (sources)
      const sources: GroundingSource[] = [];
      const groundingMetadata = (response as any).candidates?.[0]?.groundingMetadata;
      
      // 🔍 DEBUG: Log full grounding metadata to find actual URLs
      console.log('🔗 [Gemini Grounding] Full metadata:', JSON.stringify(groundingMetadata, null, 2));
      
      if (groundingMetadata?.groundingChunks) {
        for (const chunk of groundingMetadata.groundingChunks) {
          if (chunk.web) {
            const title = chunk.web.title || '';
            
            // Title contains actual domain (e.g., "manipalhospitals.com")
            // Use title as URL since vertexaisearch URLs are internal redirects
            const isActualDomain = /\.(com|in|org|net|co\.in)$/i.test(title);
            const finalUrl = isActualDomain ? `https://${title}` : (chunk.web.uri || '');
            
            // Extract clean domain for badge (remove .com, .in, etc.)
            const domain = title
              .replace(/\.(com|in|org|net|co\.in)$/i, '')
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '');
            
            sources.push({
              title: title,
              url: finalUrl,
              domain: domain, // e.g., "fortishealthcare", "apollohospitals"
            });
          }
        }
      }

      // Get token usage
      const usageMetadata = response.usageMetadata;
      const tokensUsed = {
        input: usageMetadata?.promptTokenCount || 0,
        output: usageMetadata?.candidatesTokenCount || 0,
      };

      const timeMs = Date.now() - startTime;
      
      console.log(`✅ [Gemini Grounding] Success in ${timeMs}ms`);
      console.log(`📊 Tokens: ${tokensUsed.input} in / ${tokensUsed.output} out`);
      console.log(`🔗 Sources: ${sources.length} found`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      return {
        success: true,
        answer: text,
        sources,
        searchQuery: query,
        timeMs,
        tokensUsed,
      };

    } catch (error: any) {
      console.error('❌ [Gemini Grounding] Error:', error.message);
      
      return {
        success: false,
        answer: '',
        sources: [],
        searchQuery: query,
        timeMs: Date.now() - startTime,
        tokensUsed: { input: 0, output: 0 },
        error: error.message,
      };
    }
  },
};