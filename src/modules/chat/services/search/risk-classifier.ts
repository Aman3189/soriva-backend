/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SEARCH V2 - RISK CLASSIFIER
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Binary classification: LOW_RISK or HIGH_RISK
 * 
 * LOW_RISK  → Simple pipeline (80% queries)
 * HIGH_RISK → Strict pipeline (10-15% queries)
 * 
 * Created: February 2026
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

export type RiskLevel = 'LOW_RISK' | 'HIGH_RISK';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HIGH RISK PATTERNS (Strict Mode Triggers)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const HIGH_RISK_KEYWORDS = {
  // Health / Medical
  health: [
    'dose', 'dosage', 'medicine', 'tablet', 'capsule', 'injection', 'vaccine',
    'symptoms', 'disease', 'diagnosis', 'treatment', 'surgery', 'operation',
    'doctor', 'hospital', 'clinic', 'prescription', 'side effect', 'overdose',
    'drug interaction', 'contraindication', 'pregnant', 'pregnancy',
    // Hinglish
    'dawai', 'dawa', 'goli', 'bimari', 'bimaari', 'ilaj', 'ilaaj',
    'doctor sahab', 'aspatal', 'aushadhi', 'davai', 'teeka',
  ],

  // Finance / Investment
  finance: [
    'investment', 'invest', 'loan', 'emi', 'interest rate', 'tax', 'gst',
    'income tax', 'itr', 'mutual fund', 'stock', 'share market', 'trading',
    'insurance', 'lic', 'policy', 'premium', 'claim', 'refund',
    'bank account', 'fixed deposit', 'ppf', 'epf', 'pf withdrawal',
    'credit score', 'cibil', 'bankruptcy', 'debt', 'npa',
    // Hinglish
    'nivesh', 'paisa lagana', 'bima', 'beema', 'karza', 'karz', 'byaj', 'byaaj',
    'tax bharana', 'return file', 'mutual fund mein', 'share kharidna',
  ],

  // Legal
  legal: [
    'court', 'judge', 'lawyer', 'advocate', 'bail', 'arrest',
    'police complaint', 'case file', 'hearing', 'verdict', 'sentence',
    'section', 'ipc', 'crpc', 'bns', 'bnss', 'legal notice',
    'property dispute', 'divorce', 'custody', 'alimony', 'will', 'inheritance',
    'consumer court', 'cyber crime', 'defamation', 'cheating case',
    // Hinglish  
    'adalat', 'vakil', 'vakeel', 'kanoon', 'qanoon', 'zamanat', 'jamanat',
    'thana', 'police station', 'mukadma', 'muqadma', 'peshi', 'faisla',
  ],

  // Government / Official Documents
  government: [
    'visa', 'passport', 'oci', 'citizenship', 'immigration', 'deportation',
    'aadhar', 'aadhaar', 'pan card', 'voter id', 'driving license',
    'birth certificate', 'death certificate', 'domicile', 'caste certificate',
    'government scheme', 'sarkari yojana', 'subsidy', 'pension', 'ration card',
    'pm kisan', 'ayushman', 'ujjwala', 'mudra loan', 'pmay', 'scholarship',
    // Hinglish
    'sarkari', 'sarkaari', 'document banwana', 'apply karna', 'form bharna',
  ],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UTILITY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchesKeyword(query: string, keyword: string): boolean {
  // Skip short keywords (< 3 chars) to avoid false positives
  if (keyword.length < 3) return false;
  
  const pattern = new RegExp(`\\b${escapeRegex(keyword)}\\b`, 'i');
  return pattern.test(query);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN CLASSIFIER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function classifyRisk(query: string): RiskLevel {
  const q = query.toLowerCase().trim();
  
  for (const keywords of Object.values(HIGH_RISK_KEYWORDS)) {
    for (const keyword of keywords) {
      if (matchesKeyword(q, keyword)) {
        return 'HIGH_RISK';
      }
    }
  }
  
  return 'LOW_RISK';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DETAILED CLASSIFICATION (For logging/debugging)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface RiskClassification {
  level: RiskLevel;
  category: 'health' | 'finance' | 'legal' | 'government' | 'general';
  matchedKeyword: string | null;
}

export function classifyRiskDetailed(query: string): RiskClassification {
  const q = query.toLowerCase().trim();
  
  // Check each category with word boundary
  for (const [category, keywords] of Object.entries(HIGH_RISK_KEYWORDS)) {
    for (const keyword of keywords) {
      if (matchesKeyword(q, keyword)) {
        return {
          level: 'HIGH_RISK',
          category: category as RiskClassification['category'],
          matchedKeyword: keyword,
        };
      }
    }
  }
  
  return {
    level: 'LOW_RISK',
    category: 'general',
    matchedKeyword: null,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const RiskClassifier = {
  classify: classifyRisk,
  classifyDetailed: classifyRiskDetailed,
  isHighRisk: (query: string) => classifyRisk(query) === 'HIGH_RISK',
  isLowRisk: (query: string) => classifyRisk(query) === 'LOW_RISK',
};

export default RiskClassifier;