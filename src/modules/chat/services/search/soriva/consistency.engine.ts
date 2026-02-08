/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA CONSISTENCY ENGINE v2.0 — THE JUDGE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Path: services/search/soriva/consistency-engine.ts
 *
 * PURPOSE:
 * Sits BETWEEN multi-provider search results and LLM.
 * Cross-verifies facts from Brave, Tavily, Google before
 * sending to LLM. Prevents hallucination by detecting
 * inconsistent or unreliable data.
 *
 * ARCHITECTURE:
 *   multiProviderSearch() → consistencyEngine.verify() → LLM
 *
 * TIERED SYSTEM:
 *   TIER 1 (NO_VERIFY)  → Simple/general queries, single provider OK
 *   TIER 2 (STANDARD)   → Factual queries, 2 providers + tiebreaker
 *   TIER 3 (STRICT)     → High-stakes (health/finance/legal), all 3 parallel
 *
 * FEATURES:
 *   ✅ Tiered verification (cost-balanced)
 *   ✅ Majority voting (2/3 agree = verified)
 *   ✅ Trust-weighted scoring (Google 0.6, Tavily 0.25, Brave 0.15)
 *   ✅ Fact extraction & clustering
 *   ✅ Conflict detection & anomaly scoring
 *   ✅ Zero-hallucination fallback mode
 *
 * v2.0 CHANGES (Feb 2026):
 *   ✅ NUMERIC TOLERANCE: Rating 7.8 vs 7.9 = same (0.2 tolerance)
 *   ✅ PRICE TOLERANCE: ₹72,400 vs ₹72,500 = same (2% or ₹100)
 *   ✅ DATE NORMALIZATION: "15 Jan 2026" = "2026-01-15" = "Jan 15, 2026"
 *   ✅ RELATIVE DATES: "today", "tomorrow", "kal" support
 *   ✅ Tolerance-based clustering for numeric fact groups
 *   ✅ Hinglish relative date support (aaj, kal)
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { SearchResultItem } from '../core/data';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type VerificationTier = 'NO_VERIFY' | 'STANDARD' | 'STRICT';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type Provider = 'google-cse' | 'brave';

export interface ProviderResult {
  provider: Provider;
  results: SearchResultItem[];
  answer?: string;
  timeMs: number;
  facts: ExtractedFact[];
  domain?: string;  // ✅ v2.1: Added for domain-aware verification
}

export interface ExtractedFact {
  value: string;          // The extracted data point ("7.8/10", "₹72,500", "India won")
  type: FactType;         // What kind of fact
  source: Provider;       // Which provider gave this
  confidence: number;     // 0-1 how confident we are in extraction
  raw: string;            // Original text snippet this was extracted from
}

export type FactType =
  | 'RATING'        // 7.8/10, 4.5 stars
  | 'PRICE'         // ₹72,500, $999
  | 'SCORE'         // India 280/4, 3-1
  | 'DATE'          // 15 Jan 2026, tomorrow
  | 'NAME'          // Person name, place name
  | 'NUMBER'        // Generic number (GDP, population)
  | 'STATUS'        // Open/Closed, Active/Inactive
  | 'GENERAL';      // Non-numeric fact

export interface ConsistencyResult {
  tier: VerificationTier;
  confidence: ConfidenceLevel;
  confidenceScore: number;        // 0.0 to 1.0
  verifiedFact: string;           // Best fact to send to LLM
  agreement: AgreementDetail;
  providerResults: ProviderResult[];
  llmInstruction: string;         // Rule for LLM based on confidence
  totalTimeMs: number;
  providersUsed: number;
}

export interface AgreementDetail {
  level: 'UNANIMOUS' | 'MAJORITY' | 'SPLIT' | 'SINGLE';
  agreeing: Provider[];
  disagreeing: Provider[];
  conflictDescription?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TRUST WEIGHTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const TRUST_WEIGHTS: Record<Provider, number> = {
  'google-cse': 0.60,
  'brave': 0.40,
};

const DOMAIN_TRUST_OVERRIDES: Record<string, Partial<Record<Provider, number>>> = {
  finance:       { 'google-cse': 0.70, brave: 0.30 },
  health:        { 'google-cse': 0.70, brave: 0.30 },
  entertainment: { 'google-cse': 0.65, brave: 0.35 },
  sports:        { 'google-cse': 0.60, brave: 0.40 },
  news:          { 'google-cse': 0.70, brave: 0.30 },
  tech:          { brave: 0.50, 'google-cse': 0.50 },
  weather:       { 'google-cse': 0.70, brave: 0.30 },
  festival:      { 'google-cse': 0.70, brave: 0.30 },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TIER CLASSIFICATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// TIER 3: High-stakes domains — full 3-provider verification
const TIER3_DOMAINS = new Set([
  'health', 'finance', 'legal', 'government',
]);

const TIER3_KEYWORDS = /\b(medicine|dosage|tablet|dawai|ilaj|treatment|disease|bimari|symptom|diagnosis|surgery|doctor|hospital|clinic|pharmacy|drug|side\s*effects?|blood\s*pressure|diabetes|cancer|heart|kidney|liver|injection|vaccine|antibiotic|painkiller|sensex|nifty|stock|share\s*price|mutual\s*fund|sip|income\s*tax|gst|tax\s*slab|emi|loan|interest\s*rate|fd\s*rate|rd\s*rate|inflation|gdp|fiscal\s*deficit|budget|insurance|premium|claim|pension|epf|ppf|nps|court|advocate|lawyer|fir|bail|ipc|crpc|section|act\s+\d+|amendment|constitution|judgment|verdict|visa|passport|immigration|asylum|oci|pr\s+card|green\s+card|sarkari|government|scheme|yojana|subsidy|ration\s*card|aadhar|pan\s*card|driving\s*license|birth\s*certificate|death\s*certificate)\b/i;

// TIER 2: Factual queries needing verification
const TIER2_KEYWORDS = /\b(price|rate|cost|kitna|kitne|bhav|daam|kimat|rating|score|imdb|review|result|winner|jita|jeeta|kon\s*jita|who\s*won|rank|ranking|population|gdp|salary|marks|percentage|cutoff|admit\s*card|merit\s*list|date|kab|when|release\s*date|launch|temperature|weather|mausam|forecast|fastest|tallest|highest|largest|longest|record|world\s*record|how\s*many|how\s*much|total|net\s*worth|market\s*cap|revenue|profit|loss|vs|comparison|compare|better|best|worst|top\s*\d+)\b/i;

/**
 * Determine verification tier based on domain + query content
 */
function classifyTier(domain: string, query: string): VerificationTier {
    console.log(`[classifyTier] domain="${domain}" query="${query}"`);
  console.log(`[classifyTier] TIER3_DOMAINS hit: ${TIER3_DOMAINS.has(domain)}`);
  console.log(`[classifyTier] TIER3_KEYWORDS hit: ${TIER3_KEYWORDS.test(query)}`);
  console.log(`[classifyTier] manual test: metformin=${/\bmetformin\b/i.test(query)} side_effect=${/\bside\s*effects?\b/i.test(query)} tablet=${/\btablet\b/i.test(query)}`);
  // TIER 3: High-stakes — always full verification
  if (TIER3_DOMAINS.has(domain)) return 'STRICT';
  if (TIER3_KEYWORDS.test(query)) return 'STRICT';

  // TIER 2: Factual queries — 2 providers + tiebreaker
  if (TIER2_KEYWORDS.test(query)) return 'STANDARD';

  // TIER 1: Everything else — single provider is fine
  return 'NO_VERIFY';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FACT EXTRACTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Extract structured facts from search results + answer text.
 * These facts are what we compare across providers.
 */
function extractFacts(
  results: SearchResultItem[],
  answer: string | undefined,
  provider: Provider
): ExtractedFact[] {
  const facts: ExtractedFact[] = [];
  
  // Combine all text from results + answer
  const texts: string[] = [];
  if (answer && answer.length > 10) texts.push(answer);
  for (const r of results.slice(0, 5)) {
    if (r.title) texts.push(r.title);
    if (r.description) texts.push(r.description);
  }
  const combined = texts.join(' ');

  // ── RATING EXTRACTION ──
  // "7.8/10", "8.2 out of 10", "⭐ 7.5"
  const ratingPatterns = [
    /(\d+\.?\d*)\s*\/\s*10/g,
    /(\d+\.?\d*)\s*out\s*of\s*10/gi,
    /⭐\s*(\d+\.?\d*)/g,
    /(?:rating|imdb|score)[:\s]+(\d+\.?\d*)/gi,
  ];
  for (const pattern of ratingPatterns) {
    let match;
    while ((match = pattern.exec(combined)) !== null) {
      const val = parseFloat(match[1]);
      if (val >= 1.0 && val <= 10.0) {
        facts.push({
          value: `${val}/10`,
          type: 'RATING',
          source: provider,
          confidence: match[0].includes('/10') ? 0.95 : 0.80,
          raw: combined.substring(Math.max(0, match.index - 30), match.index + match[0].length + 30),
        });
      }
    }
  }

  // ── PRICE EXTRACTION ──
  // "₹72,500", "Rs. 1,299", "$999", "1.5 lakh", "2 crore"
  const pricePatterns = [
    /₹\s*([\d,]+\.?\d*)/g,
    /Rs\.?\s*([\d,]+\.?\d*)/gi,
    /\$\s*([\d,]+\.?\d*)/g,
    /([\d,]+\.?\d*)\s*(lakh|crore|thousand|million|billion)/gi,
    /(?:price|cost|rate|bhav|daam|kimat)[:\s]+₹?\s*([\d,]+\.?\d*)/gi,
  ];
  for (const pattern of pricePatterns) {
    let match;
    while ((match = pattern.exec(combined)) !== null) {
      const rawVal = match[1] || match[0];
      facts.push({
        value: match[0].trim(),
        type: 'PRICE',
        source: provider,
        confidence: 0.85,
        raw: combined.substring(Math.max(0, match.index - 20), match.index + match[0].length + 20),
      });
    }
  }

  // ── SCORE EXTRACTION ──
  // "India 280/4", "3-1", "won by 5 wickets"
  const scorePatterns = [
    /(\d+)\s*[-–\/]\s*(\d+)/g,  // 3-1, 280/4
    /(?:won|beat|defeated|lost)\s+(?:by\s+)?(\d+)/gi,
    /(?:jita|jeeta|haara|tied|draw)\s+(\d+)?/gi,
  ];
  for (const pattern of scorePatterns) {
    let match;
    while ((match = pattern.exec(combined)) !== null) {
      facts.push({
        value: match[0].trim(),
        type: 'SCORE',
        source: provider,
        confidence: 0.80,
        raw: combined.substring(Math.max(0, match.index - 30), match.index + match[0].length + 30),
      });
    }
  }

  // ── NUMBER EXTRACTION ──
  // Generic numbers with context (GDP, population, percentage)
  const numberPatterns = [
    /(\d+\.?\d*)\s*%/g,
    /(\d+\.?\d*)\s*(billion|million|trillion|crore|lakh|thousand)\b/gi,
  ];
  for (const pattern of numberPatterns) {
    let match;
    while ((match = pattern.exec(combined)) !== null) {
      facts.push({
        value: match[0].trim(),
        type: 'NUMBER',
        source: provider,
        confidence: 0.75,
        raw: combined.substring(Math.max(0, match.index - 30), match.index + match[0].length + 30),
      });
    }
  }

  // ── DATE EXTRACTION ──
  const datePatterns = [
    /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{4})/gi,
    /(\d{4})-(\d{2})-(\d{2})/g,
  ];
  for (const pattern of datePatterns) {
    let match;
    while ((match = pattern.exec(combined)) !== null) {
      facts.push({
        value: match[0].trim(),
        type: 'DATE',
        source: provider,
        confidence: 0.85,
        raw: combined.substring(Math.max(0, match.index - 20), match.index + match[0].length + 20),
      });
    }
  }

  return facts;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FACT COMPARISON & MAJORITY VOTING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface FactCluster {
  type: FactType;
  values: Array<{ value: string; provider: Provider; confidence: number }>;
  consensus: string | null;       // The agreed-upon value (if any)
  agreementRatio: number;         // 0.0 to 1.0
  trustScore: number;             // Weighted trust score
}

/**
 * Compare facts across providers and find consensus.
 * Groups by FactType, then checks if values match.
 * 
 * v2.0 CHANGES:
 * ✅ Tolerance-based comparison for RATING, PRICE, NUMBER types
 * ✅ "7.8" and "7.9" are now considered "close enough" for RATING
 * ✅ Date values normalized before comparison
 */
function clusterFacts(
  allFacts: ExtractedFact[],
  domain: string
): FactCluster[] {
  // Group facts by type
  const grouped = new Map<FactType, ExtractedFact[]>();
  for (const fact of allFacts) {
    if (!grouped.has(fact.type)) grouped.set(fact.type, []);
    grouped.get(fact.type)!.push(fact);
  }

  const clusters: FactCluster[] = [];
  const weights = { ...TRUST_WEIGHTS, ...(DOMAIN_TRUST_OVERRIDES[domain] || {}) };

  for (const [type, facts] of grouped) {
    const values = facts.map(f => ({
      value: normalizeFact(f.value, type),
      originalValue: f.value,
      provider: f.source,
      confidence: f.confidence,
    }));

    // Count unique providers
    const uniqueProviders = new Set(values.map(v => v.provider));
    if (uniqueProviders.size < 2) {
      // Only one provider has this fact — can't vote
      clusters.push({
        type,
        values: values.map(v => ({ value: v.value, provider: v.provider, confidence: v.confidence })),
        consensus: values[0]?.value || null,
        agreementRatio: 0.5, // Single source = 50% confidence
        trustScore: values[0] ? weights[values[0].provider] : 0,
      });
      continue;
    }

    // For numeric types, use tolerance-based grouping
    const isNumericType = type === 'RATING' || type === 'PRICE' || type === 'NUMBER';
    
    if (isNumericType) {
      // Tolerance-based clustering for numeric values
      const numericValues = values.map(v => ({
        ...v,
        numericValue: parseFloat(v.value) || 0,
      })).filter(v => !isNaN(v.numericValue));
      
      if (numericValues.length >= 2) {
        // Group values that are "close enough"
        const toleranceGroups: Array<{
          representative: number;
          members: typeof numericValues;
        }> = [];
        
        for (const val of numericValues) {
          let foundGroup = false;
          for (const group of toleranceGroups) {
            if (areNumericValuesClose(val.numericValue, group.representative, type)) {
              group.members.push(val);
              // Update representative to average
              const sum = group.members.reduce((s, m) => s + m.numericValue, 0);
              group.representative = sum / group.members.length;
              foundGroup = true;
              break;
            }
          }
          if (!foundGroup) {
            toleranceGroups.push({
              representative: val.numericValue,
              members: [val],
            });
          }
        }
        
        // Find best group by trust-weighted score
        let bestGroup = toleranceGroups[0];
        let bestScore = 0;
        let bestProviderCount = 0;
        
        for (const group of toleranceGroups) {
          const score = group.members.reduce((sum, m) => sum + weights[m.provider] * m.confidence, 0);
          const providerCount = new Set(group.members.map(m => m.provider)).size;
          
          if (providerCount > bestProviderCount || 
              (providerCount === bestProviderCount && score > bestScore)) {
            bestGroup = group;
            bestScore = score;
            bestProviderCount = providerCount;
          }
        }
        
        const totalProviders = uniqueProviders.size;
        const agreementRatio = bestProviderCount / totalProviders;
        
        // Use representative value for consensus
        let consensusValue: string;
        if (type === 'RATING') {
          consensusValue = bestGroup.representative.toFixed(1);
        } else if (type === 'PRICE') {
          consensusValue = Math.round(bestGroup.representative).toString();
        } else {
          consensusValue = bestGroup.representative.toString();
        }
        
        clusters.push({
          type,
          values: values.map(v => ({ value: v.value, provider: v.provider, confidence: v.confidence })),
          consensus: consensusValue,
          agreementRatio,
          trustScore: bestScore,
        });
        continue;
      }
    }
    
    // Non-numeric types: use exact string matching (existing logic)
    const valueGroups = new Map<string, Array<{ provider: Provider; confidence: number }>>();
    for (const v of values) {
      if (!valueGroups.has(v.value)) valueGroups.set(v.value, []);
      valueGroups.get(v.value)!.push({ provider: v.provider, confidence: v.confidence });
    }

    // Find the value with highest trust-weighted score
    let bestValue = '';
    let bestScore = 0;
    let bestProviderCount = 0;

    for (const [value, providers] of valueGroups) {
      const score = providers.reduce((sum, p) => sum + weights[p.provider] * p.confidence, 0);
      const providerCount = new Set(providers.map(p => p.provider)).size;

      if (providerCount > bestProviderCount || 
          (providerCount === bestProviderCount && score > bestScore)) {
        bestValue = value;
        bestScore = score;
        bestProviderCount = providerCount;
      }
    }

    const totalProviders = uniqueProviders.size;
    const agreementRatio = bestProviderCount / totalProviders;

    clusters.push({
      type,
      values: values.map(v => ({ value: v.value, provider: v.provider, confidence: v.confidence })),
      consensus: bestValue || null,
      agreementRatio,
      trustScore: bestScore,
    });
  }

  return clusters;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATE NORMALIZATION (v2.0)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MONTH_MAP: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

/**
 * Normalize various date formats to YYYY-MM-DD for comparison.
 * Handles:
 * - "15 Jan 2026", "Jan 15, 2026", "15 January 2026"
 * - "2026-01-15", "01/15/2026", "15/01/2026"
 * - "tomorrow", "yesterday", "today" (relative to current date)
 */
function normalizeDate(value: string): string {
  const trimmed = value.trim().toLowerCase();
  const now = new Date();
  
  // Handle relative dates
  if (trimmed === 'today' || trimmed === 'aaj') {
    return formatDateYMD(now);
  }
  if (trimmed === 'tomorrow' || trimmed === 'kal' || trimmed === 'agle din') {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDateYMD(tomorrow);
  }
  if (trimmed === 'yesterday' || trimmed === 'kal raat' || trimmed === 'pichle din') {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return formatDateYMD(yesterday);
  }
  
  // Pattern 1: ISO format "2026-01-15"
  const isoMatch = value.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }
  
  // Pattern 2: "15 Jan 2026" or "15 January 2026"
  const dmyMatch = value.match(/(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\w*\s+(\d{4})/i);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = (MONTH_MAP[dmyMatch[2].toLowerCase().substring(0, 3)] + 1).toString().padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }
  
  // Pattern 3: "Jan 15, 2026" or "January 15 2026"
  const mdyMatch = value.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\w*\s+(\d{1,2}),?\s+(\d{4})/i);
  if (mdyMatch) {
    const month = (MONTH_MAP[mdyMatch[1].toLowerCase().substring(0, 3)] + 1).toString().padStart(2, '0');
    const day = mdyMatch[2].padStart(2, '0');
    const year = mdyMatch[3];
    return `${year}-${month}-${day}`;
  }
  
  // Pattern 4: "01/15/2026" (MM/DD/YYYY US format)
  const usDateMatch = value.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (usDateMatch) {
    // Assume MM/DD/YYYY if first num <= 12
    const first = parseInt(usDateMatch[1], 10);
    const second = parseInt(usDateMatch[2], 10);
    if (first <= 12) {
      return `${usDateMatch[3]}-${usDateMatch[1].padStart(2, '0')}-${usDateMatch[2].padStart(2, '0')}`;
    } else {
      // DD/MM/YYYY format
      return `${usDateMatch[3]}-${usDateMatch[2].padStart(2, '0')}-${usDateMatch[1].padStart(2, '0')}`;
    }
  }
  
  // Pattern 5: "15-01-2026" (DD-MM-YYYY)
  const ddmmyyyyMatch = value.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
  if (ddmmyyyyMatch) {
    const first = parseInt(ddmmyyyyMatch[1], 10);
    if (first > 12) {
      // DD-MM-YYYY
      return `${ddmmyyyyMatch[3]}-${ddmmyyyyMatch[2].padStart(2, '0')}-${ddmmyyyyMatch[1].padStart(2, '0')}`;
    } else {
      // Assume MM-DD-YYYY
      return `${ddmmyyyyMatch[3]}-${ddmmyyyyMatch[1].padStart(2, '0')}-${ddmmyyyyMatch[2].padStart(2, '0')}`;
    }
  }
  
  // Couldn't parse — return lowercase trimmed
  return trimmed;
}

function formatDateYMD(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NUMERIC TOLERANCE CONFIG (v2.0)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const TOLERANCE_CONFIG = {
  RATING: {
    absolute: 0.2,      // 7.8 and 8.0 considered equal
    percentage: 0.03,   // 3% tolerance
  },
  SCORE: {
    absolute: 0,        // Scores must match exactly (3-1 ≠ 3-2)
    percentage: 0,
  },
  PRICE: {
    absolute: 100,      // ₹100 tolerance for small prices
    percentage: 0.02,   // 2% tolerance for larger amounts
  },
  NUMBER: {
    absolute: 0,
    percentage: 0.05,   // 5% tolerance for generic numbers
  },
};

/**
 * Check if two numeric values are "close enough" based on type-specific tolerance.
 * Returns true if they should be considered equal.
 */
function areNumericValuesClose(val1: number, val2: number, type: FactType): boolean {
  if (isNaN(val1) || isNaN(val2)) return false;
  
  const config = TOLERANCE_CONFIG[type as keyof typeof TOLERANCE_CONFIG];
  if (!config) return val1 === val2;
  
  const diff = Math.abs(val1 - val2);
  const maxVal = Math.max(Math.abs(val1), Math.abs(val2), 1); // Avoid division by zero
  
  // Check absolute tolerance first (for small values)
  if (diff <= config.absolute) return true;
  
  // Check percentage tolerance (for larger values)
  const percentageDiff = diff / maxVal;
  if (percentageDiff <= config.percentage) return true;
  
  return false;
}

/**
 * Normalize fact values for comparison.
 * "7.8/10" and "7.8 out of 10" should match.
 * "₹72,500" and "Rs 72500" should match.
 * 
 * v2.0 CHANGES:
 * ✅ Enhanced date normalization (multiple formats → YYYY-MM-DD)
 * ✅ Numeric values stored for tolerance comparison
 */
function normalizeFact(value: string, type: FactType): string {
  switch (type) {
    case 'RATING': {
      // Extract just the number: "7.8/10" → "7.8"
      const match = value.match(/(\d+\.?\d*)/);
      return match ? parseFloat(match[1]).toFixed(1) : value;
    }
    case 'PRICE': {
      // Remove currency symbols, commas: "₹72,500" → "72500"
      const cleaned = value.replace(/[₹$,Rs.:\s]/gi, '');
      const match = cleaned.match(/(\d+\.?\d*)/);
      if (!match) return value;
      // Handle lakh/crore
      if (/lakh/i.test(value)) return (parseFloat(match[1]) * 100000).toString();
      if (/crore/i.test(value)) return (parseFloat(match[1]) * 10000000).toString();
      if (/thousand/i.test(value) || /hazar/i.test(value)) return (parseFloat(match[1]) * 1000).toString();
      return match[1];
    }
    case 'SCORE': {
      // "3-1" and "3–1" should match
      return value.replace(/[–—]/g, '-').replace(/\s/g, '');
    }
    case 'NUMBER': {
      const match = value.match(/(\d+\.?\d*)/);
      if (!match) return value;
      if (/billion/i.test(value)) return (parseFloat(match[1]) * 1e9).toString();
      if (/million/i.test(value)) return (parseFloat(match[1]) * 1e6).toString();
      if (/trillion/i.test(value)) return (parseFloat(match[1]) * 1e12).toString();
      if (/crore/i.test(value)) return (parseFloat(match[1]) * 1e7).toString();
      if (/lakh/i.test(value)) return (parseFloat(match[1]) * 1e5).toString();
      if (/thousand/i.test(value) || /hazar/i.test(value)) return (parseFloat(match[1]) * 1e3).toString();
      return match[1];
    }
    case 'DATE': {
      // v2.0: Enhanced date normalization
      return normalizeDate(value);
    }
    default:
      return value.toLowerCase().trim();
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIDENCE CALCULATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ConfidenceCalculation {
  score: number;            // 0.0 to 1.0
  level: ConfidenceLevel;   // HIGH, MEDIUM, LOW
  reasoning: string;
}

/**
 * Calculate overall confidence from fact clusters.
 * Uses trust weights + agreement ratio + fact count.
 */
function calculateConfidence(
  clusters: FactCluster[],
  providersUsed: number,
  tier: VerificationTier
): ConfidenceCalculation {
  if (clusters.length === 0) {
    // No structured facts extracted — rely on raw text
    return {
      score: providersUsed >= 2 ? 0.5 : 0.3,
      level: 'LOW',
      reasoning: 'No structured facts found in search results',
    };
  }

  // Weighted average of all cluster agreement ratios
  let totalWeight = 0;
  let weightedAgreement = 0;
  let unanimousCount = 0;
  let conflictCount = 0;

  for (const cluster of clusters) {
    const weight = cluster.type === 'PRICE' || cluster.type === 'RATING' || cluster.type === 'SCORE'
      ? 2.0   // Critical facts weighted more
      : 1.0;
    
    totalWeight += weight;
    weightedAgreement += cluster.agreementRatio * weight;

    if (cluster.agreementRatio >= 0.99) unanimousCount++;
    if (cluster.agreementRatio < 0.5) conflictCount++;
  }

  let score = totalWeight > 0 ? weightedAgreement / totalWeight : 0.3;

  // Bonus for unanimous agreement
  if (unanimousCount === clusters.length && providersUsed >= 2) {
    score = Math.min(1.0, score + 0.15);
  }

  // Penalty for conflicts
  if (conflictCount > 0) {
    score = Math.max(0.0, score - (conflictCount * 0.15));
  }

  // Provider count bonus
  if (providersUsed >= 3) score = Math.min(1.0, score + 0.05);
  if (providersUsed === 1) score = Math.max(0.0, score - 0.1);

  // Tier-based threshold adjustment
  // STRICT tier requires higher confidence to pass
  if (tier === 'STRICT') {
    score = Math.max(0.0, score - 0.05); // Slightly harder to pass
  }

  // Determine level
  let level: ConfidenceLevel;
  if (score >= 0.7) level = 'HIGH';
  else if (score >= 0.4) level = 'MEDIUM';
  else level = 'LOW';

  const reasoning = buildConfidenceReasoning(clusters, unanimousCount, conflictCount, providersUsed);

  return { score, level, reasoning };
}

function buildConfidenceReasoning(
  clusters: FactCluster[],
  unanimousCount: number,
  conflictCount: number,
  providersUsed: number
): string {
  const parts: string[] = [];
  parts.push(`${providersUsed} provider(s) used`);
  parts.push(`${clusters.length} fact type(s) extracted`);
  if (unanimousCount > 0) parts.push(`${unanimousCount} unanimous`);
  if (conflictCount > 0) parts.push(`${conflictCount} conflict(s)`);
  return parts.join(', ');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LLM INSTRUCTION BUILDER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Build the instruction string that tells LLM how to handle the data.
 * Based on confidence level:
 *   HIGH   → Normal answer, trust the data
 *   MEDIUM → Answer with caution, mention uncertainty
 *   LOW    → Zero-hallucination mode — refuse to state as fact
 */
function buildLLMInstruction(
  confidence: ConfidenceCalculation,
  tier: VerificationTier,
  agreement: AgreementDetail
): string {
  // TIER 1: No verification — standard behavior
  if (tier === 'NO_VERIFY') {
    return '';
  }

  // HIGH confidence — data is reliable
  if (confidence.level === 'HIGH') {
    return `[VERIFIED ✅ confidence=${(confidence.score * 100).toFixed(0)}%] Data cross-verified from ${agreement.agreeing.length} sources. Answer confidently using this data.`;
  }

  // MEDIUM confidence — proceed with caution
  if (confidence.level === 'MEDIUM') {
    let instruction = `[CAUTION ⚠️ confidence=${(confidence.score * 100).toFixed(0)}%] Data partially verified.`;
    if (agreement.conflictDescription) {
      instruction += ` ${agreement.conflictDescription}`;
    }
    instruction += ` Answer the question but indicate approximate values where data varies across sources. Do NOT present conflicting data as certain fact.`;
    return instruction;
  }

  // LOW confidence — ZERO HALLUCINATION MODE
  let instruction = `[UNVERIFIED ❌ confidence=${(confidence.score * 100).toFixed(0)}%] Data inconsistent across sources.`;
  if (agreement.conflictDescription) {
    instruction += ` ${agreement.conflictDescription}`;
  }

  if (tier === 'STRICT') {
    // High-stakes + low confidence = absolute refusal to guess
    instruction += ` CRITICAL RULE: This is a ${tier}-tier query (health/finance/legal). You MUST NOT state any number, date, name, or fact as certain. Say: "Is topic ka real-time data abhi verified nahi ho pa raha, please official sources check karo." Provide ONLY the source URLs if available.`;
  } else {
    instruction += ` RULE: Do NOT answer with specific numbers or facts. Say: "Mujhe exact data confirm nahi ho pa raha different sources se." Share what IS consistent and flag what is NOT.`;
  }

  return instruction;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VERIFIED FACT ASSEMBLY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Build the best possible "verifiedFact" string from provider results.
 * Uses trust-weighted scoring to pick the most reliable content.
 */
function assembleVerifiedFact(
  providerResults: ProviderResult[],
  clusters: FactCluster[],
  domain: string
): string {
  if (providerResults.length === 0) return 'No results found.';

  const weights = { ...TRUST_WEIGHTS, ...(DOMAIN_TRUST_OVERRIDES[domain] || {}) };

  // Score each provider's full content by trust weight
  const scored = providerResults
    .filter(pr => pr.results.length > 0 || (pr.answer && pr.answer.length > 20))
    .map(pr => ({
      provider: pr.provider,
      score: weights[pr.provider],
      answer: pr.answer || '',
      topResults: pr.results.slice(0, 3),
    }))
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return 'No results found.';

  // Use highest-trust provider's content as base
  const primary = scored[0];
  let fact = '';

  // Add consensus facts as a verification header
  const verifiedFacts: string[] = [];
  for (const cluster of clusters) {
    if (cluster.consensus && cluster.agreementRatio >= 0.66) {
      verifiedFacts.push(`${cluster.type}: ${cluster.consensus}`);
    }
  }

  if (verifiedFacts.length > 0) {
    fact += `[CROSS-VERIFIED DATA]\n${verifiedFacts.join('\n')}\n\n`;
  }

  // Add primary provider's content
  if (primary.answer && primary.answer.length > 30) {
    fact += primary.answer;
  } else {
    const snippets = primary.topResults
      .map(r => `${r.title}\n${r.description}`)
      .join('\n\n');
    fact += snippets;
  }

  // Add supplementary data from other providers (non-duplicate)
  for (let i = 1; i < scored.length && i < 3; i++) {
    const secondary = scored[i];
    if (secondary.answer && secondary.answer.length > 30) {
      // Only add if meaningfully different from primary
      const primaryLower = fact.toLowerCase();
      const secondaryLower = secondary.answer.toLowerCase();
      
      // Simple overlap check — if less than 50% words overlap, it's new info
      const secondaryWords = new Set(secondaryLower.split(/\s+/));
      const primaryWords = new Set(primaryLower.split(/\s+/));
      let overlap = 0;
      for (const w of secondaryWords) {
        if (primaryWords.has(w)) overlap++;
      }
      const overlapRatio = overlap / secondaryWords.size;

      if (overlapRatio < 0.5) {
        fact += `\n\n[Additional source: ${secondary.provider}]\n${secondary.answer}`;
      }
    }
  }

  // Add source URLs
  const urls = providerResults
    .flatMap(pr => pr.results.slice(0, 2))
    .filter(r => r.url)
    .map(r => r.url)
    .slice(0, 3);
  
  if (urls.length > 0) {
    fact += `\n\nSources: ${urls.join(' | ')}`;
  }

  return fact.trim();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AGREEMENT DETAIL BUILDER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function buildAgreement(
  clusters: FactCluster[],
  providerResults: ProviderResult[]
): AgreementDetail {
  const allProviders = providerResults.map(pr => pr.provider);

  if (clusters.length === 0) {
    return {
      level: allProviders.length === 1 ? 'SINGLE' : 'SPLIT',
      agreeing: allProviders,
      disagreeing: [],
    };
  }

  // Check critical fact clusters (RATING, PRICE, SCORE)
  const criticalClusters = clusters.filter(c =>
    c.type === 'RATING' || c.type === 'PRICE' || c.type === 'SCORE' || c.type === 'NUMBER'
  );

  if (criticalClusters.length === 0) {
    // No critical facts — assume general agreement
    return {
      level: allProviders.length >= 2 ? 'MAJORITY' : 'SINGLE',
      agreeing: allProviders,
      disagreeing: [],
    };
  }

  // Check agreement across critical clusters
  let totalAgreement = 0;
  let totalClusters = 0;
  const conflicts: string[] = [];

  for (const cluster of criticalClusters) {
    totalClusters++;
    if (cluster.agreementRatio >= 0.66) {
      totalAgreement++;
    } else {
      // Build conflict description
      const uniqueValues = [...new Set(cluster.values.map(v => `${v.value} (${v.provider})`))];
      conflicts.push(`${cluster.type}: ${uniqueValues.join(' vs ')}`);
    }
  }

  const overallRatio = totalClusters > 0 ? totalAgreement / totalClusters : 0;

  // Determine agreeing/disagreeing providers
  const agreeingSet = new Set<Provider>();
  const disagreeingSet = new Set<Provider>();

  for (const cluster of criticalClusters) {
    if (cluster.consensus) {
      for (const v of cluster.values) {
        if (normalizeFact(v.value, cluster.type) === cluster.consensus) {
          agreeingSet.add(v.provider);
        } else {
          disagreeingSet.add(v.provider);
        }
      }
    }
  }

  let level: AgreementDetail['level'];
  if (overallRatio >= 0.99) level = 'UNANIMOUS';
  else if (overallRatio >= 0.5) level = 'MAJORITY';
  else if (agreeingSet.size > 0) level = 'SPLIT';
  else level = 'SINGLE';

  return {
    level,
    agreeing: [...agreeingSet],
    disagreeing: [...disagreeingSet],
    conflictDescription: conflicts.length > 0
      ? `Conflicts: ${conflicts.join('; ')}`
      : undefined,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN EXPORT: ConsistencyEngine
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const ConsistencyEngine = {
  /**
   * Classify verification tier for a query.
   * Called by multiProviderSearch to determine how many providers to use.
   */
  classifyTier,

  /**
   * Extract structured facts from a single provider's results.
   * Called per-provider after each search completes.
   */
  extractFacts,

  /**
   * Main verification method.
   * Takes results from multiple providers, cross-verifies, returns verdict.
   *
   * @param providerResults - Array of results from each provider
   * @param domain - Detected query domain (health, finance, etc.)
   * @param query - Original user query
   * @param tier - Verification tier (classified earlier)
   * @returns ConsistencyResult with verified fact + confidence + LLM instruction
   */
  verify(
    providerResults: ProviderResult[],
    domain: string,
    query: string,
    tier: VerificationTier
  ): ConsistencyResult {
    const startTime = Date.now();
    const providersUsed = providerResults.length;

    console.log(`\n🔒 [ConsistencyEngine] Verifying ${providersUsed} provider(s) | Tier: ${tier} | Domain: ${domain}`);

    // TIER 1: No verification — pass through single provider
    if (tier === 'NO_VERIFY' && providersUsed === 1) {
      const pr = providerResults[0];
      const fact = pr.answer && pr.answer.length > 30
        ? pr.answer
        : pr.results.slice(0, 3).map(r => `${r.title}\n${r.description}`).join('\n\n');

      console.log(`   ✅ TIER 1 pass-through (${pr.provider})`);

      return {
        tier,
        confidence: 'MEDIUM',
        confidenceScore: 0.6,
        verifiedFact: fact,
        agreement: {
          level: 'SINGLE',
          agreeing: [pr.provider],
          disagreeing: [],
        },
        providerResults,
        llmInstruction: '',
        totalTimeMs: Date.now() - startTime,
        providersUsed,
      };
    }

    // TIER 2 & 3: Extract facts, cluster, vote, calculate confidence
    const allFacts: ExtractedFact[] = [];
    for (const pr of providerResults) {
      const facts = extractFacts(pr.results, pr.answer, pr.provider);
      pr.facts = facts;
      allFacts.push(...facts);
      console.log(`   📊 ${pr.provider}: ${facts.length} facts extracted (${facts.map(f => f.type).join(', ') || 'none'})`);
    }

    // Cluster and vote
    const clusters = clusterFacts(allFacts, domain);
    for (const cluster of clusters) {
      console.log(`   🗳️ ${cluster.type}: consensus="${cluster.consensus}" agreement=${(cluster.agreementRatio * 100).toFixed(0)}% trust=${cluster.trustScore.toFixed(2)}`);
    }

    // Calculate confidence
    const confidence = calculateConfidence(clusters, providersUsed, tier);
    console.log(`   🎯 Confidence: ${confidence.level} (${(confidence.score * 100).toFixed(0)}%) — ${confidence.reasoning}`);

    // Build agreement detail
    const agreement = buildAgreement(clusters, providerResults);
    console.log(`   🤝 Agreement: ${agreement.level} | Agreeing: [${agreement.agreeing.join(', ')}] | Disagreeing: [${agreement.disagreeing.join(', ')}]`);

    // Assemble the best verified fact
    const verifiedFact = assembleVerifiedFact(providerResults, clusters, domain);

    // Build LLM instruction based on confidence
    const llmInstruction = buildLLMInstruction(confidence, tier, agreement);
    if (llmInstruction) {
      console.log(`   📋 LLM Rule: ${llmInstruction.substring(0, 80)}...`);
    }

    const totalTimeMs = Date.now() - startTime;
    console.log(`   ⏱️ Verification complete in ${totalTimeMs}ms`);

    return {
      tier,
      confidence: confidence.level,
      confidenceScore: confidence.score,
      verifiedFact,
      agreement,
      providerResults,
      llmInstruction,
      totalTimeMs,
      providersUsed,
    };
  },

  /**
   * Get trust weights (for external use/logging)
   */
  getTrustWeights(domain?: string): Record<Provider, number> {
    if (domain && DOMAIN_TRUST_OVERRIDES[domain]) {
      return { ...TRUST_WEIGHTS, ...DOMAIN_TRUST_OVERRIDES[domain] } as Record<Provider, number>;
    }
    return { ...TRUST_WEIGHTS };
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // v2.0 UTILITY EXPORTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Normalize a date string to YYYY-MM-DD format.
   * Handles multiple formats including relative dates.
   */
  normalizeDate,

  /**
   * Check if two numeric values are "close enough" for comparison.
   * Uses type-specific tolerance (RATING: 0.2, PRICE: 2%, etc.)
   */
  areNumericValuesClose,

  /**
   * Get tolerance configuration for a fact type.
   */
  getToleranceConfig(type: FactType): { absolute: number; percentage: number } | null {
    return TOLERANCE_CONFIG[type as keyof typeof TOLERANCE_CONFIG] || null;
  },
};

export default ConsistencyEngine;