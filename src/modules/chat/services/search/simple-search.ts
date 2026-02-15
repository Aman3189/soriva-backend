/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SEARCH V2 - SIMPLE SEARCH (Production)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Routing:
 * - REALTIME → Mistral Agent + Web Search (real search)
 * - GENERAL  → Gemini + Grounding
 * - LOCAL    → Gemini + Grounding
 * - CODING   → Devstral
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { QueryTypeDetector, type QueryType, type Provider } from './query-type-detector';

// ────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────

export interface SearchSource {
  title: string;
  url: string;
  domain: string;
}

export interface SimpleSearchResult {
  success: boolean;
  answer: string;
  sources: SearchSource[];
  query: string;
  queryType: QueryType;
  provider: Provider;
  timeMs: number;
  error?: string;
}

export interface SimpleSearchOptions {
  location?: string;
  language?: 'en' | 'hi' | 'hinglish';
}

// ────────────────────────────────────────────────────────────────
// CONFIG
// ────────────────────────────────────────────────────────────────

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY!;

const GEMINI_MODEL = 'gemini-2.0-flash';
const DEVSTRAL_MODEL = 'devstral-medium-latest';

// Mistral Agent with web_search tool
const MISTRAL_AGENT_ID = 'ag_019c584421b6705e8fa38aa887b23919';

const TIMEOUT_MS = 20000;

// ────────────────────────────────────────────────────────────────
// MAIN
// ────────────────────────────────────────────────────────────────

export async function simpleSearch(
  query: string,
  options: SimpleSearchOptions = {}
): Promise<SimpleSearchResult> {
  const startTime = Date.now();
  const { location, language = 'hinglish' } = options;

  const { type, provider } = QueryTypeDetector.classify(query);

  console.log(`🔍 [SimpleSearch] Type: ${type} | Provider: ${provider}`);

  try {
    if (provider === 'mistral-search') {
      return await searchMistral(query, type, startTime);
    }

    if (provider === 'devstral') {
      return await searchDevstral(query, type, startTime);
    }

    return await searchGemini(query, type, location, language, startTime);
  } catch (error: any) {
    console.error(`❌ [SimpleSearch] ${provider} failed:`, error.message);

    // Fallback to Gemini
    if (provider !== 'gemini') {
      console.log(`🔄 [SimpleSearch] Falling back to Gemini`);
      try {
        return await searchGemini(query, type, location, language, startTime);
      } catch {}
    }

    return {
      success: false,
      answer: '',
      sources: [],
      query,
      queryType: type,
      provider,
      timeMs: Date.now() - startTime,
      error: error?.message || 'Search failed',
    };
  }
}

// ────────────────────────────────────────────────────────────────
// GEMINI (General / Local)
// ────────────────────────────────────────────────────────────────

async function searchGemini(
  query: string,
  type: QueryType,
  location: string | undefined,
  language: string,
  startTime: number
): Promise<SimpleSearchResult> {
  if (!GEMINI_API_KEY) throw new Error('Gemini key missing');

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    tools: [{ googleSearch: {} } as any],
  });

  const prompt = buildGeminiPrompt(query, language, location);

  const result = await withTimeout(model.generateContent(prompt), TIMEOUT_MS);

  return {
    success: true,
    answer: result.response.text(),
    sources: extractGeminiSources(result.response),
    query,
    queryType: type,
    provider: 'gemini',
    timeMs: Date.now() - startTime,
  };
}

// ────────────────────────────────────────────────────────────────
// MISTRAL AGENT + WEB SEARCH (Realtime)
// ────────────────────────────────────────────────────────────────

async function searchMistral(
  query: string,
  type: QueryType,
  startTime: number
): Promise<SimpleSearchResult> {
  if (!MISTRAL_API_KEY) throw new Error('Mistral key missing');

  console.log(`🔍 [Mistral] Using Agent: ${MISTRAL_AGENT_ID}`);

  const response = await withTimeout(
    fetch('https://api.mistral.ai/v1/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        agent_id: MISTRAL_AGENT_ID,
        inputs: query,
      }),
    }),
    TIMEOUT_MS
  );

  if (!response.ok) {
    throw new Error(`Mistral Agent error: ${response.status}`);
  }

  const data = await response.json();

  // Extract answer and sources from outputs
  const { answer, sources } = extractMistralResponse(data);

  console.log(`✅ [Mistral] Answer: ${answer.slice(0, 100)}... | Sources: ${sources.length}`);

  return {
    success: true,
    answer,
    sources,
    query,
    queryType: type,
    provider: 'mistral-search',
    timeMs: Date.now() - startTime,
  };
}

function extractMistralResponse(data: any): { answer: string; sources: SearchSource[] } {
  const outputs = data.outputs || [];
  let answer = '';
  const sources: SearchSource[] = [];
  const seenUrls = new Set<string>();

  for (const output of outputs) {
    if (output.type === 'message.output' && output.content) {
      for (const content of output.content) {
        // Extract text
        if (content.type === 'text') {
          answer += content.text;
        }

        // Extract sources from tool_reference
        if (content.type === 'tool_reference' && content.url) {
          if (!seenUrls.has(content.url)) {
            seenUrls.add(content.url);
            sources.push({
              title: content.title || '',
              url: content.url,
              domain: extractDomain(content.url),
            });
          }
        }
      }
    }
  }

  return { answer: answer.trim(), sources };
}

// ────────────────────────────────────────────────────────────────
// DEVSTRAL (Coding)
// ────────────────────────────────────────────────────────────────

async function searchDevstral(
  query: string,
  type: QueryType,
  startTime: number
): Promise<SimpleSearchResult> {
  if (!MISTRAL_API_KEY) throw new Error('Mistral key missing');

  console.log(`💻 [Devstral] Coding query`);

  const response = await withTimeout(
    fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEVSTRAL_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an expert programmer. Provide clean, correct, production-ready code with clear explanations.',
          },
          { role: 'user', content: query },
        ],
        temperature: 0.2,
        max_tokens: 4096,
      }),
    }),
    TIMEOUT_MS
  );

  if (!response.ok) {
    throw new Error(`Devstral error: ${response.status}`);
  }

  const data = await response.json();
  const answer = data.choices?.[0]?.message?.content || '';

  console.log(`✅ [Devstral] Response length: ${answer.length}`);

  return {
    success: true,
    answer,
    sources: [],
    query,
    queryType: type,
    provider: 'devstral',
    timeMs: Date.now() - startTime,
  };
}

// ────────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────────

function buildGeminiPrompt(query: string, language: string, location?: string): string {
  const loc = location ? `User location: ${location}.` : '';
  const lang =
    language === 'hi'
      ? 'Respond in Hindi.'
      : language === 'hinglish'
        ? 'Respond in Hinglish.'
        : 'Respond in English.';

  return `${loc}\n${lang}\n\nUse web search.\n\nQuery: ${query}`;
}

function extractGeminiSources(response: any): SearchSource[] {
  const sources: SearchSource[] = [];
  const seen = new Set<string>();

  const chunks =
    response?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

  for (const chunk of chunks) {
    const uri = chunk?.web?.uri;
    const title = chunk?.web?.title || uri;

    if (!uri || seen.has(uri)) continue;

    try {
      sources.push({
        title,
        url: uri,
        domain: extractDomain(uri),
      });
      seen.add(uri);
    } catch {}
  }

  return sources.slice(0, 3);
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return '';
  }
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), ms)
    ),
  ]);
}

// ────────────────────────────────────────────────────────────────
// EXPORT
// ────────────────────────────────────────────────────────────────

export const SimpleSearchService = {
  search: simpleSearch,
};

export default SimpleSearchService;