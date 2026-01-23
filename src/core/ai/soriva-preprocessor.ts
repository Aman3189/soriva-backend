/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA PREPROCESSOR v1.0 - BRAHMASTRA ENGINE 🔱
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Risenex Dynamics Pvt. Ltd.
 * Created: January 2026
 * 
 * PURPOSE:
 * - Heavy input processing via Mistral (sasta)
 * - Query root extraction (subject, source, intent)
 * - Web search decision & execution
 * - Mini instruction build for Output LLM
 * - Prompt Token Pool deduction
 * 
 * PHILOSOPHY:
 * - LLMs are already trained, we just give direction
 * - No hardcoding, no examples - pure dynamic intelligence
 * - Extract ROOT meaning, not surface keywords
 * 
 * FLOW:
 * User Query → Mistral Processing → Mini Instruction → Output LLM
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { MistralProvider } from './providers/mistral.provider';
import { 
  ProviderConfig, 
  MessageRole,
  Providers,
  Models,
} from './providers/base/types';
import { braveSearchService } from '../../modules/chat/services/search/brave-search.service';
import { sorivaIntelligence } from './soriva-intelligence';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface PreprocessorInput {
  message: string;
  userId: string;
  userName?: string;
  planType: 'STARTER' | 'LITE' | 'PLUS' | 'PRO' | 'APEX' | 'SOVEREIGN';
  userLocation?: string;
  history?: Array<{ role: string; content: string }>;
}

export interface QueryRoot {
  subject: string;
  sourceHint: string | null;
  location: string | null;
  intent: string;
}

export interface PreprocessorOutput {
  miniInstruction: string;
  fetchedData: string | null;
  
  responseGuidance: {
    tone: 'warm_respectful' | 'professional' | 'casual';
    useUserName: boolean;
    userName: string | null;
    proactiveHint: string | null;
    language: 'hinglish' | 'english';
  };
  
  routing: {
    intent: string;
    complexity: 'simple' | 'medium' | 'complex';
    requiresSearch: boolean;
    sourcePreference: string | null;
  };
  
  tokensUsed: number;
  processingTimeMs: number;
  
  safety: {
    level: string;
    blocked: boolean;
    blockReason?: string;
  };
}

// ═══════════════════════════════════════════════════════════════
// QUERY ANALYSIS PROMPT - DIRECTION ONLY, NO EXAMPLES
// ═══════════════════════════════════════════════════════════════

const QUERY_ANALYSIS_PROMPT = `You are Soriva's Brain. Understand the ROOT of any user query.

OUTPUT: JSON only.
{
  "subject": "main topic/entity user asking about",
  "sourceHint": "specific platform if user mentioned (IMDB/Zomato/Amazon/Cricbuzz etc), else null",
  "location": "location if mentioned, else null",
  "intent": "core intent: rating/price/location/info/review/booking/comparison/greeting/help/other",
  "needsWebSearch": true/false,
  "searchQuery": "optimized search query if needed, else null",
  "proactiveHint": "natural next help to offer, else null"
}

RULES:
- Understand MEANING, not keywords
- sourceHint = ONLY when user explicitly names a platform
- proactiveHint = Related helpful action
- Be intelligent, be dynamic

Query:`;

// ═══════════════════════════════════════════════════════════════
// MINI INSTRUCTION BUILDER
// ═══════════════════════════════════════════════════════════════

function buildMiniInstruction(
  userName: string | null,
  queryRoot: QueryRoot,
  fetchedData: string | null,
  proactiveHint: string | null,
  language: 'hinglish' | 'english'
): string {
  const nameStr = userName || 'Friend';
  const langStr = language === 'hinglish' 
    ? 'Hinglish (Roman script, female tone: karungi/bataungi)' 
    : 'English (female tone)';
  
  let instruction = `User: ${nameStr}
Lang: ${langStr}
Tone: Warm, respectful, helpful (not overwhelming)
Task: ${queryRoot.intent} about "${queryRoot.subject}"`;

  if (fetchedData) {
    instruction += `\n\nData:\n${fetchedData}`;
  }

  if (proactiveHint) {
    instruction += `\n\nProactive: Offer ${proactiveHint} naturally`;
  }

  return instruction;
}

// ═══════════════════════════════════════════════════════════════
// DYNAMIC URL SELECTION
// ═══════════════════════════════════════════════════════════════

function selectBestUrl(
  searchResults: Array<{ url: string; title: string; description: string }>,
  sourceHint: string | null,
  subject: string
): string | null {
  if (!searchResults || searchResults.length === 0) return null;

  if (sourceHint) {
    const hint = sourceHint.toLowerCase();
    
    const scored = searchResults.map((result, index) => {
      let score = 0;
      const url = result.url.toLowerCase();
      const title = result.title.toLowerCase();
      
      if (url.includes(hint)) score += 100;
      if (title.includes(hint)) score += 50;
      
      const subjectWords = subject.toLowerCase().split(' ');
      for (const word of subjectWords) {
        if (word.length > 2 && title.includes(word)) score += 20;
      }
      
      score += Math.max(0, 10 - index * 2);
      
      return { result, score };
    });

    scored.sort((a, b) => b.score - a.score);
    
    console.log('[Preprocessor] 🎯 URL Selection:');
    scored.slice(0, 3).forEach(s => {
      console.log(`  Score ${s.score}: ${s.result.url.slice(0, 60)}`);
    });

    return scored[0].result.url;
  }

  return searchResults[0].url;
}

// ═══════════════════════════════════════════════════════════════
// MAIN PREPROCESSOR CLASS
// ═══════════════════════════════════════════════════════════════

class SorivaPreprocessor {
  private static instance: SorivaPreprocessor;
  private mistralProvider: MistralProvider;

  private constructor() {
  const config: ProviderConfig = {
    provider: Providers.MISTRAL,
    apiKey: process.env.MISTRAL_API_KEY || '',
    model: Models.MISTRAL_LARGE_3,
  };
  this.mistralProvider = new MistralProvider(config);
  console.log('[Preprocessor] 🔱 Brahmastra Engine v1.0 initialized');
}

  static getInstance(): SorivaPreprocessor {
    if (!SorivaPreprocessor.instance) {
      SorivaPreprocessor.instance = new SorivaPreprocessor();
    }
    return SorivaPreprocessor.instance;
  }

  async process(input: PreprocessorInput): Promise<PreprocessorOutput> {
    const startTime = Date.now();
    let tokensUsed = 0;

    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔱 BRAHMASTRA PREPROCESSOR');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📝 Query: "${input.message}"`);
    console.log(`👤 User: ${input.userName || 'Unknown'}`);
    console.log(`💳 Plan: ${input.planType}`);

    // ═══════════════════════════════════════════════════════════
    // STEP 1: Safety Check (Rule-based, 0 tokens)
    // ═══════════════════════════════════════════════════════════
    
    const safetyResult = sorivaIntelligence.process({
      message: input.message,
      userId: input.userId,
      userName: input.userName,
      planType: input.planType as any,
      history: input.history,
    });

    if (safetyResult.blocked) {
      console.log('[Preprocessor] ⛔ Blocked');
      return this.buildBlockedResponse(safetyResult, startTime);
    }

    // ═══════════════════════════════════════════════════════════
    // STEP 2: Query ROOT Extraction (Mistral)
    // ═══════════════════════════════════════════════════════════
    
    console.log('[Preprocessor] 🧠 Extracting query ROOT...');
    
    const prompt = `${QUERY_ANALYSIS_PROMPT} "${input.message}"${input.userLocation ? ` (User location: ${input.userLocation})` : ''}`;
    
    let queryRoot: QueryRoot & { needsWebSearch: boolean; searchQuery: string | null; proactiveHint: string | null };
    
    try {
      const response = await this.mistralProvider.chat({
        model: Models.MISTRAL_LARGE_3,
        messages: [{ role: MessageRole.USER, content: prompt }],
        temperature: 0.1,
        maxTokens: 250,
        });

      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        queryRoot = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON');
      }

      tokensUsed += response.usage?.totalTokens || 150;
      
      console.log('[Preprocessor] ✅ ROOT:', {
        subject: queryRoot.subject,
        sourceHint: queryRoot.sourceHint,
        intent: queryRoot.intent,
        needsSearch: queryRoot.needsWebSearch,
      });

    } catch (error: any) {
      console.error('[Preprocessor] ❌ Analysis failed:', error.message);
      queryRoot = {
        subject: input.message.slice(0, 50),
        sourceHint: null,
        location: input.userLocation || null,
        intent: 'info',
        needsWebSearch: false,
        searchQuery: null,
        proactiveHint: null,
      };
    }

    // ═══════════════════════════════════════════════════════════
    // STEP 3: Web Search (if needed)
    // ═══════════════════════════════════════════════════════════
    
    let fetchedData: string | null = null;
    
    if (queryRoot.needsWebSearch && queryRoot.searchQuery) {
      console.log('[Preprocessor] 🔍 Searching:', queryRoot.searchQuery);
      
      try {
        const searchResult = await braveSearchService.smartSearchWithFetch(
          queryRoot.searchQuery,
          input.userLocation,
          true
        );

        if (searchResult.fact && searchResult.fact.length > 0) {
          fetchedData = searchResult.fact;
          tokensUsed += searchResult.totalPromptTokens;
          console.log('[Preprocessor] ✅ Data fetched');
        }
      } catch (error: any) {
        console.error('[Preprocessor] ❌ Search failed:', error.message);
      }
    }

    // ═══════════════════════════════════════════════════════════
    // STEP 4: Build Mini Instruction
    // ═══════════════════════════════════════════════════════════
    
    const language: 'hinglish' | 'english' = 
      safetyResult.language === 'en' ? 'english' : 'hinglish';

    const miniInstruction = buildMiniInstruction(
      input.userName || null,
      queryRoot,
      fetchedData,
      queryRoot.proactiveHint,
      language
    );

    const processingTime = Date.now() - startTime;

    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ BRAHMASTRA COMPLETE');
    console.log(`⏱️  Time: ${processingTime}ms | 🎯 Tokens: ${tokensUsed}`);
    console.log('═══════════════════════════════════════════════════════');

    return {
      miniInstruction,
      fetchedData,
      
      responseGuidance: {
        tone: 'warm_respectful',
        useUserName: !!input.userName,
        userName: input.userName || null,
        proactiveHint: queryRoot.proactiveHint,
        language,
      },
      
      routing: {
        intent: queryRoot.intent,
        complexity: safetyResult.complexity,
        requiresSearch: queryRoot.needsWebSearch,
        sourcePreference: queryRoot.sourceHint,
      },
      
      tokensUsed,
      processingTimeMs: processingTime,
      
      safety: {
        level: safetyResult.safety,
        blocked: false,
      },
    };
  }

  private buildBlockedResponse(safetyResult: any, startTime: number): PreprocessorOutput {
    return {
      miniInstruction: '',
      fetchedData: null,
      responseGuidance: {
        tone: 'warm_respectful',
        useUserName: false,
        userName: null,
        proactiveHint: null,
        language: 'hinglish',
      },
      routing: {
        intent: 'blocked',
        complexity: 'simple',
        requiresSearch: false,
        sourcePreference: null,
      },
      tokensUsed: 0,
      processingTimeMs: Date.now() - startTime,
      safety: {
        level: safetyResult.safety,
        blocked: true,
        blockReason: safetyResult.blockReason,
      },
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export const sorivaPreprocessor = SorivaPreprocessor.getInstance();
export { selectBestUrl };