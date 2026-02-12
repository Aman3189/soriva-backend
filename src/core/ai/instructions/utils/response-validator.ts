/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * RESPONSE VALIDATOR - PRODUCTION READY v2
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Validates AI responses for:
 * - Forbidden AI mentions (with word boundary)
 * - Identity hijack detection ("I am ChatGPT")
 * - Prompt leak detection
 * - Identity drift detection  
 * - XML/internal tag exposure
 * - Male verb usage (Hindi/Hinglish)
 * - Devanagari in non-creative context
 * 
 * PERFORMANCE: Combined regex for scale (10k+ req/min ready)
 */

import { SORIVA } from '../identity';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type IssueSeverity = 'critical' | 'warning' | 'info';

export type IssueCategory = 
  | 'identity_violation'
  | 'identity_hijack'
  | 'prompt_leak'
  | 'identity_drift'
  | 'xml_exposure'
  | 'gender_violation'
  | 'script_violation'
  | 'ai_mention';

export interface ValidationIssue {
  category: IssueCategory;
  severity: IssueSeverity;
  message: string;
  match?: string;
  position?: number;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  hasCritical: boolean;
  hasWarning: boolean;
  summary: string;
}

export interface ValidatorOptions {
  isCreativeWriting?: boolean;
  allowTechnicalDiscussion?: boolean;
  strictMode?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// NORMALIZATION
// ═══════════════════════════════════════════════════════════════════════════════

function normalizeForCheck(text: string): string {
  return text.toLowerCase();
}

// ═══════════════════════════════════════════════════════════════════════════════
// FORBIDDEN AI LIST
// ═══════════════════════════════════════════════════════════════════════════════

const FORBIDDEN_AI_IDENTITIES = [
  // OpenAI
  'chatgpt', 'gpt-4', 'gpt-4o', 'gpt-4o-mini', 'gpt-5', 'gpt4', 'gpt5',
  'openai', 'dall-e', 'dalle',
  // Anthropic
  'claude', 'claude-3', 'claude-3\\.5', 'anthropic',
  // Google
  'gemini', 'gemini-pro', 'gemini-ultra', 'bard', 'google ai', 'palm',
  // Meta
  'llama', 'llama-2', 'llama-3', 'meta ai',
  // Microsoft
  'copilot', 'bing chat', 'bing ai',
  // Others
  'mistral', 'mixtral', 'perplexity', 'pi ai',
];

// ═══════════════════════════════════════════════════════════════════════════════
// PRE-COMPILED REGEX (Performance optimized for scale)
// ═══════════════════════════════════════════════════════════════════════════════

// Escape special regex characters in AI names
const escapedAIs = FORBIDDEN_AI_IDENTITIES.map(ai => 
  ai.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
);

// Combined regex for AI mentions - single scan
const AI_MENTION_REGEX = new RegExp(
  `\\b(${escapedAIs.join('|')})\\b`,
  'gi'
);
// Identity hijack patterns - "I am X", "I'm X", "My name is X"
const IDENTITY_HIJACK_REGEX = new RegExp(
  `(?:i\\s+am|i'm|my\\s+name\\s+is|call\\s+me|this\\s+is)(?:\\s+(?:the|actually|really|just))?\\s+(${escapedAIs.join('|')})`,
  'gi'
);

// Male verbs regex - single scan
const escapedMaleVerbs = SORIVA.maleVerbsToAvoid.map(v =>
  v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
);

const MALE_VERBS_REGEX = new RegExp(
  `\\b(${escapedMaleVerbs.join('|')})\\b`,
  'gi'
);

// ═══════════════════════════════════════════════════════════════════════════════
// STATIC PATTERNS
// ═══════════════════════════════════════════════════════════════════════════════

const TECHNICAL_CONTEXT_PATTERNS = [
  /comparing\s+(different\s+)?ai/i,
  /api\s+(endpoint|call|request)/i,
  /model\s+(comparison|benchmark|performance)/i,
  /\bvs\.?\s+/i,
  /alternative\s+to/i,
  /integrate\s+with/i,
  /migrate\s+from/i,
  /similar\s+to/i,
  /like\s+(chatgpt|claude|gemini)/i,
  /using\s+(the\s+)?(chatgpt|claude|gemini)\s+api/i,
];

const IDENTITY_DRIFT_PHRASES = [
  'as an ai',
  'as an artificial intelligence',
  'i am an ai',
  'i\'m an ai',
  'as a language model',
  'as a large language model',
  'i am a language model',
  'i\'m a language model',
  'i don\'t have feelings',
  'i cannot feel emotions',
  'i was created by openai',
  'i was made by anthropic',
  'i was developed by google',
  'i was built by meta',
];

const PROMPT_LEAK_PATTERNS = [
  /system\s*prompt\s*[:=]/i,
  /my\s*(system\s*)?instructions\s*(are|say)/i,
  /i\s*(was|am)\s*instructed\s*to/i,
  /my\s*programming\s*(tells|says|instructs)/i,
  /according\s*to\s*my\s*(prompt|instructions)/i,
  /risenex\s*dynamics\s*internal/i,
  /soriva\s*core\s*instructions/i,
  /delta\s*engine/i,
  /tone\s*matcher/i,
  /\bLLM_UNLOCK\b/,
  /\bIDENTITY_CORE\b/,
  /\bBEHAVIOR_RULES\b/,
  /\bHARD_BOUNDARIES\b/,
];

const XML_EXPOSURE_PATTERNS = [
  /<web_search_data>/i,
  /<\/web_search_data>/i,
  /<search_results>/i,
  /<\/search_results>/i,
  /<system>/i,
  /<\/system>/i,
  /<prompt>/i,
  /<\/prompt>/i,
  /<instructions>/i,
  /<\/instructions>/i,
  /<context>/i,
  /<\/context>/i,
  /<user_data>/i,
  /<\/user_data>/i,
  /<internal>/i,
  /<\/internal>/i,
  /<thinking>/i,
  /<\/thinking>/i,
  /<scratchpad>/i,
  /<\/scratchpad>/i,
];

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check for identity hijack - "I am ChatGPT", "My name is Claude"
 * CRITICAL - This is the most severe violation
 */
function checkIdentityHijack(response: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  // Reset regex state
  IDENTITY_HIJACK_REGEX.lastIndex = 0;
  
  let match;
  while ((match = IDENTITY_HIJACK_REGEX.exec(response)) !== null) {
    issues.push({
      category: 'identity_hijack',
      severity: 'critical',
      message: `Identity hijack: "${match[0].trim()}"`,
      match: match[0].trim(),
      position: match.index,
    });
  }
  
  return issues;
}

/**
 * Check for forbidden AI mentions
 * Uses combined regex - single scan for performance
 */
function checkAIMentions(response: string, options: ValidatorOptions): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  // Check if technical context allows AI mentions
  const isTechnicalContext = options.allowTechnicalDiscussion && 
    TECHNICAL_CONTEXT_PATTERNS.some(pattern => pattern.test(response));
  
  // Reset regex state
  AI_MENTION_REGEX.lastIndex = 0;
  
  let match;
  while ((match = AI_MENTION_REGEX.exec(response)) !== null) {
    const aiName = match[1];
    
    // Skip if technical context allows it
    if (isTechnicalContext) {
      // But still check if it's an identity claim (handled by checkIdentityHijack)
      continue;
    }
    
    issues.push({
      category: 'ai_mention',
      severity: 'critical',
      message: `Mentions other AI: ${aiName}`,
      match: aiName,
      position: match.index,
    });
  }
  
  return issues;
}

/**
 * Check for identity drift phrases
 */
function checkIdentityDrift(response: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const normalized = normalizeForCheck(response);
  
  for (const phrase of IDENTITY_DRIFT_PHRASES) {
    const idx = normalized.indexOf(phrase);
    if (idx !== -1) {
      issues.push({
        category: 'identity_drift',
        severity: 'warning',
        message: `Identity drift: "${phrase}"`,
        match: phrase,
        position: idx,
      });
    }
  }
  
  return issues;
}

/**
 * Check for prompt leaks
 */
function checkPromptLeaks(response: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  for (const pattern of PROMPT_LEAK_PATTERNS) {
    const match = response.match(pattern);
    if (match) {
      issues.push({
        category: 'prompt_leak',
        severity: 'critical',
        message: `Prompt leak: "${match[0]}"`,
        match: match[0],
        position: match.index,
      });
    }
  }
  
  return issues;
}

/**
 * Check for XML/internal tag exposure
 */
function checkXMLExposure(response: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  for (const pattern of XML_EXPOSURE_PATTERNS) {
    const match = response.match(pattern);
    if (match) {
      issues.push({
        category: 'xml_exposure',
        severity: 'critical',
        message: `XML exposure: "${match[0]}"`,
        match: match[0],
        position: match.index,
      });
    }
  }
  
  return issues;
}

/**
 * Check for male verb usage (Hindi/Hinglish)
 * Uses combined regex - single scan
 */
function checkGenderViolation(response: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  // Reset regex state
  MALE_VERBS_REGEX.lastIndex = 0;
  
  let match;
  while ((match = MALE_VERBS_REGEX.exec(response)) !== null) {
    issues.push({
      category: 'gender_violation',
      severity: 'warning',
      message: `Male verb: "${match[1]}" (use female form)`,
      match: match[1],
      position: match.index,
    });
  }
  
  return issues;
}

/**
 * Check for Devanagari script in non-creative context
 */
function checkScriptViolation(response: string, options: ValidatorOptions): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  if (options.isCreativeWriting) {
    return issues;
  }
  
  const devanagariMatch = response.match(/[\u0900-\u097F]+/);
  if (devanagariMatch) {
    issues.push({
      category: 'script_violation',
      severity: 'warning',
      message: 'Devanagari in non-creative context',
      match: devanagariMatch[0],
      position: devanagariMatch.index,
    });
  }
  
  return issues;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN VALIDATOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validate response for all issues
 */
export function validateResponse(
  response: string, 
  options: ValidatorOptions = {}
): ValidationResult {
  const {
    isCreativeWriting = false,
    allowTechnicalDiscussion = false,
    strictMode = false,
  } = options;

  // Full options object for all functions
  const fullOptions: ValidatorOptions = {
    isCreativeWriting,
    allowTechnicalDiscussion,
    strictMode,
  };
  
  const allIssues: ValidationIssue[] = [];
  
  // Run all checks (order: most critical first)
  allIssues.push(...checkIdentityHijack(response));        // "I am ChatGPT" - CRITICAL
  allIssues.push(...checkAIMentions(response, fullOptions)); // AI mentions
  allIssues.push(...checkPromptLeaks(response));            // System prompt exposure
  allIssues.push(...checkXMLExposure(response));            // Internal tags
  allIssues.push(...checkIdentityDrift(response));          // "As an AI..."
  allIssues.push(...checkGenderViolation(response));        // Male verbs
  allIssues.push(...checkScriptViolation(response, fullOptions)); // Devanagari
  
  // Calculate flags
  const hasCritical = allIssues.some(i => i.severity === 'critical');
  const hasWarning = allIssues.some(i => i.severity === 'warning');
  
  // Valid = no critical issues (or no issues at all in strict mode)
  const valid = strictMode 
    ? allIssues.length === 0 
    : !hasCritical;
  
  // Summary
  const criticalCount = allIssues.filter(i => i.severity === 'critical').length;
  const warningCount = allIssues.filter(i => i.severity === 'warning').length;
  const summary = allIssues.length === 0
    ? 'Response passed all checks'
    : `Found ${criticalCount} critical, ${warningCount} warning issues`;
  
  return {
    valid,
    issues: allIssues,
    hasCritical,
    hasWarning,
    summary,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONVENIENCE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export function hasCriticalIssues(response: string): boolean {
  return validateResponse(response).hasCritical;
}

export function isClean(response: string, options?: ValidatorOptions): boolean {
  const result = validateResponse(response, options);
  return result.valid && !result.hasWarning;
}

export function getCriticalIssues(response: string): ValidationIssue[] {
  return validateResponse(response).issues.filter(i => i.severity === 'critical');
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXTENSIBILITY
// ═══════════════════════════════════════════════════════════════════════════════

export type CustomRule = (response: string) => ValidationIssue[];

export function validateWithCustomRules(
  response: string,
  customRules: CustomRule[],
  options?: ValidatorOptions
): ValidationResult {
  const result = validateResponse(response, options);
  
  for (const rule of customRules) {
    result.issues.push(...rule(response));
  }
  
  result.hasCritical = result.issues.some(i => i.severity === 'critical');
  result.hasWarning = result.issues.some(i => i.severity === 'warning');
  result.valid = options?.strictMode 
    ? result.issues.length === 0 
    : !result.hasCritical;
  
  const criticalCount = result.issues.filter(i => i.severity === 'critical').length;
  const warningCount = result.issues.filter(i => i.severity === 'warning').length;
  result.summary = result.issues.length === 0
    ? 'Response passed all checks'
    : `Found ${criticalCount} critical, ${warningCount} warning issues`;
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BACKWARD COMPATIBILITY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @deprecated Use validateResponse() instead
 */
export function validateResponseLegacy(
  response: string, 
  isCreativeWriting: boolean = false
): { valid: boolean; issues: string[] } {
  const result = validateResponse(response, { isCreativeWriting });
  return {
    valid: result.valid,
    issues: result.issues.map(i => i.message),
  };
}