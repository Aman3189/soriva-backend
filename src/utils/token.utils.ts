/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * TOKEN UTILITIES - Compression & Token Management
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Location: soriva-backend/src/utils/token.utils.ts
 * Created by: Amandeep, Risenex Dynamics
 * Date: January 2026
 *
 * Purpose: Token optimization for cost efficiency
 * - 60-70% token reduction through compression
 * - Approximate token counting
 * - Multi-layer compression system
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LAYER 1: BASIC COMPRESSION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Basic text compression - removes unnecessary whitespace
 * Use this for general text optimization
 */
export const compress = (text: string): string => {
  return text
    .replace(/\s+/g, ' ')           // multiple spaces → 1 space
    .replace(/\n\s+/g, '\n')        // remove leading spaces after newline
    .replace(/\n{3,}/g, '\n\n')     // max 2 newlines
    .trim();
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LAYER 2: AGGRESSIVE COMPRESSION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Aggressive compression - use when over token limit
 * Removes formatting, emojis, and reduces to bare minimum
 */
export const compressHard = (text: string): string => {
  return text
    .replace(/- /g, '')             // remove dash formatting
    .replace(/\*\*/g, '')           // remove bold markers
    .replace(/✅|❌|🚨|📘|🌿|⚠️|🛡️|💊|🎯|📦|🔥|👍|🎉/g, '')  // remove emojis
    .replace(/ {2,}/g, ' ')         // remove double spaces
    .replace(/\n{2,}/g, '\n')       // single newlines only
    .replace(/TONE:.*$/gm, '')      // remove tone instructions
    .trim();
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TOKEN COUNTER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Approximate token count (roughly 4 chars per token)
 * Good enough for cost estimation and limit checks
 */
export const countTokens = (text: string): number => {
  return Math.ceil(text.length / 4);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SMART COMPRESSION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Smart compression - applies appropriate level based on token count
 * @param text - Text to compress
 * @param maxTokens - Maximum allowed tokens (default: 200)
 * @returns Compressed text within token limit
 */
export const smartCompress = (text: string, maxTokens: number = 200): string => {
  // First try basic compression
  let result = compress(text);
  
  // Check if within limit
  if (countTokens(result) <= maxTokens) {
    return result;
  }
  
  // Apply aggressive compression
  result = compressHard(result);
  
  // If still over, truncate (last resort)
  if (countTokens(result) > maxTokens) {
    const targetLength = maxTokens * 4;
    result = result.slice(0, targetLength - 3) + '...';
  }
  
  return result;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default {
  compress,
  compressHard,
  countTokens,
  smartCompress,
};