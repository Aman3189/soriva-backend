/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SEARCH V2 - MAIN ORCHESTRATOR
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Binary Architecture:
 *
 * LOW_RISK  → Simple Search (Gemini Grounding)
 * HIGH_RISK → Strict Search (Gemini + Brave + Disclaimer)
 *
 * Backward compatible with V1 response format.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { RiskClassifier, type RiskClassification } from './risk-classifier';
import { SimpleSearchService, type SimpleSearchResult } from './simple-search';
import StrictSearchService, { type StrictSearchResult } from './strict-search';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES (V1 Compatible)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface SearchOptions {
  userLocation?: string;
  location?: string;
  language?: 'en' | 'hi' | 'hinglish';
  enableWebFetch?: boolean;
  maxContentChars?: number;
}

// V1 Compatible Response (for chat.service.ts)
export interface SearchResult {
  // V1 fields (backward compatibility)
  fact: string;
  source: 'gemini' | 'brave' | 'webfetch' | 'snippet' | 'none';
  domain: string;
  resultsFound: number;
  totalTimeMs: number;
  promptTokens: number;
  bestUrl: string | null;
  topTitles: string;
  
  // V2 fields (new)
  success: boolean;
  answer: string;
  sources: Array<{
    title: string;
    url: string;
    domain: string;
  }>;
  pipeline: 'simple' | 'strict';
  risk: RiskClassification;
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
  disclaimer?: string;
  error?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN SEARCH FUNCTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function search(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult> {
  const startTime = Date.now();
  const location = options.userLocation || options.location;
  const language = options.language || 'en';

  // Step 1: Classify risk
  const risk = RiskClassifier.classifyDetailed(query);

  console.log(`🔍 [SorivaV2] Query: "${query.slice(0, 50)}..."`);
  console.log(`⚡ [SorivaV2] Risk: ${risk.level} | Matched: ${risk.matchedKeyword || 'none'}`);

  // Step 2: Route to appropriate pipeline
  if (risk.level === 'HIGH_RISK') {
    return handleStrictSearch(query, risk, startTime);
  }

  return handleSimpleSearch(query, risk, { location, language }, startTime);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SIMPLE PIPELINE (LOW RISK)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function handleSimpleSearch(
  query: string,
  risk: RiskClassification,
  options: { location?: string; language?: string },
  startTime: number
): Promise<SearchResult> {
  console.log(`🟢 [SorivaV2] Pipeline: SIMPLE`);

  const result = await SimpleSearchService.search(query, {
    location: options.location,
    language: options.language as 'en' | 'hi' | 'hinglish',
  });

  const timeMs = Date.now() - startTime;

  return mapToV1Response(result, risk, 'simple', timeMs);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STRICT PIPELINE (HIGH RISK)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function handleStrictSearch(
  query: string,
  risk: RiskClassification,
  startTime: number
): Promise<SearchResult> {
  console.log(`🔴 [SorivaV2] Pipeline: STRICT`);

  const category = risk.category === 'general' ? 'default' : risk.category;
  const result = await StrictSearchService.search(query, category);

  const timeMs = Date.now() - startTime;

  return mapToV1Response(result, risk, 'strict', timeMs, result.confidence, result.disclaimer);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// V1 RESPONSE MAPPER (Backward Compatibility)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function mapToV1Response(
  result: SimpleSearchResult | StrictSearchResult,
  risk: RiskClassification,
  pipeline: 'simple' | 'strict',
  timeMs: number,
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW',
  disclaimer?: string
): SearchResult {
  
  const sources = result.sources || [];
  const firstSource = sources[0];

  return {
    // V1 fields
    fact: result.answer || '',
    source: result.success ? 'gemini' : 'none',
    domain: risk.category,
    resultsFound: sources.length,
    totalTimeMs: timeMs,
    promptTokens: 0, // V2 doesn't track this separately
    bestUrl: firstSource?.url || null,
    topTitles: sources.map(s => s.title).join(' | '),

    // V2 fields
    success: result.success,
    answer: result.answer || '',
    sources,
    pipeline,
    risk,
    confidence,
    disclaimer,
    error: result.error,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SorivaSearchV2 = {
  search,
  classifyRisk: RiskClassifier.classifyDetailed,
  isHighRisk: RiskClassifier.isHighRisk,
};

// Also export as SorivaSearch for backward compatibility
export const SorivaSearch = SorivaSearchV2;

// Re-export types
export type { RiskClassification } from './risk-classifier';
export type { SimpleSearchResult } from './simple-search';
export type { StrictSearchResult } from './strict-search';

export default SorivaSearchV2;