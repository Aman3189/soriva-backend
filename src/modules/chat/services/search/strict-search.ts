/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SEARCH V2 - STRICT SEARCH (HIGH RISK PIPELINE)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * HIGH RISK → Health | Finance | Legal | Government
 *
 * Flow:
 * 1. Gemini (Grounded) → Primary Answer
 * 2. Brave → Source Verification Only
 * 3. Domain Agreement Score
 * 4. Confidence + Disclaimer
 *
 * Stable. Minimal. Production Ready.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface SearchSource {
  title: string;
  url: string;
  domain: string;
  provider: 'gemini' | 'brave';
}

export interface AgreementResult {
  score: number;
  level: 'STRONG' | 'PARTIAL' | 'WEAK' | 'CONFLICT';
}

export interface StrictSearchResult {
  success: boolean;
  answer: string;
  sources: SearchSource[];
  confidence: ConfidenceLevel;
  agreement: AgreementResult;
  disclaimer?: string;
  timeMs: number;
  error?: string;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const BRAVE_API_KEY = process.env.BRAVE_API_KEY || '';
const MODEL = 'gemini-2.0-flash';
const TIMEOUT_MS = 20000;

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DISCLAIMERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const DISCLAIMERS = {
  health: '⚠️ This is not medical advice. Consult a qualified doctor.',
  finance: '⚠️ This is not financial advice. Consult a certified advisor.',
  legal: '⚠️ This is not legal advice. Consult a qualified lawyer.',
  government: '⚠️ For official information, verify from government websites.',
  default: '⚠️ Please verify this information from official sources.'
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN FUNCTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export async function strictSearch(
  query: string,
  category: 'health' | 'finance' | 'legal' | 'government' | 'default' = 'default'
): Promise<StrictSearchResult> {

  const startTime = Date.now();
  const cleanQuery = sanitize(query);

  if (!GEMINI_API_KEY) {
    return fail(startTime, 'Gemini API key missing');
  }

  try {
    const [gemini, brave] = await Promise.all([
      searchGemini(cleanQuery),
      searchBrave(cleanQuery)
    ]);

    if (!gemini.success) {
      return fail(startTime, 'Primary provider failed');
    }

    const agreement = calculateAgreement(gemini.sources, brave.sources);
    const confidence = determineConfidence(agreement);

    const mergedSources = mergeSources(
      gemini.sources,
      brave.sources,
      4
    );

    const disclaimer = shouldAddDisclaimer(category, confidence)
      ? DISCLAIMERS[category] || DISCLAIMERS.default
      : undefined;

    return {
      success: true,
      answer: disclaimer ? `${gemini.answer}\n\n${disclaimer}` : gemini.answer,
      sources: mergedSources,
      confidence,
      agreement,
      disclaimer,
      timeMs: Date.now() - startTime
    };

  } catch (err: any) {
    return fail(startTime, err.message);
  }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   GEMINI (PRIMARY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

async function searchGemini(query: string) {

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  const model = genAI.getGenerativeModel({
    model: MODEL,
    tools: [{ googleSearch: {} }] as any
  });

  const result = await Promise.race([
    model.generateContent(buildPrompt(query)),
    timeout(TIMEOUT_MS)
  ]);

  const response = result.response;
  const answer = response.text();
  const sources = extractGeminiSources(response);

  return {
    success: answer.length > 50,
    answer,
    sources
  };
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BRAVE (SOURCE VERIFICATION ONLY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

async function searchBrave(query: string) {

  if (!BRAVE_API_KEY) {
    return { success: false, sources: [] };
  }

  try {
    const url = new URL('https://api.search.brave.com/res/v1/web/search');
    url.searchParams.set('q', query);
    url.searchParams.set('count', '5');

    const res = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        'X-Subscription-Token': BRAVE_API_KEY
      },
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });

    if (!res.ok) throw new Error('Brave error');

    const data = await res.json();
    const sources: SearchSource[] = [];

    for (const r of data.web?.results || []) {
      if (!r.url) continue;
      sources.push({
        title: r.title || '',
        url: r.url,
        domain: extractDomain(r.url),
        provider: 'brave'
      });
    }

    return { success: sources.length > 0, sources };

  } catch {
    return { success: false, sources: [] };
  }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   AGREEMENT (DOMAIN OVERLAP ONLY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function calculateAgreement(
  gemini: SearchSource[],
  brave: SearchSource[]
): AgreementResult {

  const gDomains = new Set(gemini.map(s => s.domain));
  const bDomains = new Set(brave.map(s => s.domain));

  let overlap = 0;
  for (const d of gDomains) {
    if (bDomains.has(d)) overlap++;
  }

  const total = new Set([...gDomains, ...bDomains]).size;
  const score = total ? overlap / total : 0;

  let level: AgreementResult['level'];
  if (score >= 0.7) level = 'STRONG';
  else if (score >= 0.4) level = 'PARTIAL';
  else if (score >= 0.2) level = 'WEAK';
  else level = 'CONFLICT';

  return { score, level };
}

function determineConfidence(a: AgreementResult): ConfidenceLevel {
  if (a.level === 'STRONG') return 'HIGH';
  if (a.level === 'PARTIAL') return 'MEDIUM';
  return 'LOW';
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   UTILITIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function shouldAddDisclaimer(category: string, confidence: ConfidenceLevel) {
  if (['health', 'finance', 'legal'].includes(category)) return true;
  if (confidence === 'LOW') return true;
  return false;
}

function mergeSources(
  g: SearchSource[],
  b: SearchSource[],
  max: number
) {
  const seen = new Set<string>();
  const merged: SearchSource[] = [];

  for (const s of [...g, ...b]) {
    if (!seen.has(s.url) && merged.length < max) {
      seen.add(s.url);
      merged.push(s);
    }
  }
  return merged;
}

function extractGeminiSources(response: any): SearchSource[] {
  const sources: SearchSource[] = [];
  const chunks =
    response?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

  for (const c of chunks) {
    const uri = c?.web?.uri;
    if (!uri) continue;
    sources.push({
      title: c.web.title || uri,
      url: uri,
      domain: extractDomain(uri),
      provider: 'gemini'
    });
  }

  return sources;
}

function buildPrompt(query: string) {
  return `
You MUST use web search tool.

STRICT RULES:
- This is a high-risk query.
- Only answer using verified web results.
- Do not guess.
- Include specific names, dates, numbers.
- If conflicting information exists, mention it.

Query:
${query}
`;
}

function extractDomain(url: string) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'unknown';
  }
}

function sanitize(q: string) {
  return q.replace(/^"+|"+$/g, '').trim();
}

function timeout(ms: number) {
  return new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), ms)
  );
}

function fail(start: number, error: string): StrictSearchResult {
  return {
    success: false,
    answer: '',
    sources: [],
    confidence: 'LOW',
    agreement: { score: 0, level: 'CONFLICT' },
    timeMs: Date.now() - start,
    error
  };
}

export default { search: strictSearch };