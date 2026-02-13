export type QueryType = 'REALTIME' | 'GENERAL' | 'LOCAL' | 'CODING';
export type Provider = 'mistral-search' | 'gemini' | 'devstral';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildRegexList(patterns: string[]): RegExp[] {
  return patterns.map(p =>
    new RegExp(`\\b${escapeRegex(p)}\\b`, 'i')
  );
}

// ─────────────────────────────────────────────────────────────
// PATTERN LISTS
// ─────────────────────────────────────────────────────────────

const CODING_REGEX = buildRegexList([
  'python','javascript','typescript','java','rust','golang','cpp','c\\+\\+',
  'html','css','sql','php','ruby','swift','kotlin',
  'react','nextjs','next\\.js','vue','angular','node','express','django',
  'flask','fastapi','spring','laravel','tailwind','prisma',
  'function','error','bug','debug','script','api','endpoint',
  'frontend','backend','database','schema','migration',
  'git','deploy','docker','localhost','npm','yarn','pip',
  'implement','refactor','optimize','algorithm',
  '\\.js','\\.ts','\\.py','\\.java','\\.html','\\.css','\\.json','\\.sql'
]);

const REALTIME_REGEX = buildRegexList([
  'today','latest','current','now','live','recent','breaking',
  'aaj','abhi','taza','is waqt',
  'news','update','incident','accident','election','result',
  'match','score','ipl','world cup','cricket','football',
  'price','rate','stock','bitcoin','crypto','gold',
  'weather','temperature','forecast'
]);

const LOCAL_REGEX = buildRegexList([
  'near me','nearby','around me','closest',
  'mere paas','nazdeek','aas paas',
  'restaurant','hotel','hospital','atm','petrol pump',
  'gym','salon','mall','cinema','theatre',
  'best in','top in','famous in',
  'places to visit'
]);

// ─────────────────────────────────────────────────────────────
// DETECTION
// ─────────────────────────────────────────────────────────────

export function detectQueryType(query: string): QueryType {
  const q = query.toLowerCase().trim();

  if (CODING_REGEX.some(r => r.test(q))) {
    return 'CODING';
  }

  if (REALTIME_REGEX.some(r => r.test(q))) {
    return 'REALTIME';
  }

  if (LOCAL_REGEX.some(r => r.test(q))) {
    return 'LOCAL';
  }

  return 'GENERAL';
}

export function getProvider(type: QueryType): Provider {
  switch (type) {
    case 'REALTIME': return 'mistral-search';
    case 'CODING':   return 'devstral';
    case 'LOCAL':
    case 'GENERAL':
    default:         return 'gemini';
  }
}

export interface QueryClassification {
  type: QueryType;
  provider: Provider;
}

export function classifyQuery(query: string): QueryClassification {
  const type = detectQueryType(query);
  return { type, provider: getProvider(type) };
}

export const QueryTypeDetector = {
  detect: detectQueryType,
  classify: classifyQuery,
  getProvider
};