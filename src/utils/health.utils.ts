/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * HEALTH UTILITIES - Basic Safety Only
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Location: soriva-backend/src/utils/health.utils.ts
 * Created by: Amandeep, Risenex Dynamics
 * Date: January 2026
 *
 * Purpose: MINIMAL health safety for main Soriva chat
 * 
 * NOTE: Deep health logic (intent depth, nuskha handling, etc.)
 * is reserved for Soriva Health App - a separate dedicated product.
 * This file only handles basic safety checks.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type HealthSafetyLevel = 'safe' | 'caution' | 'redirect';

export interface HealthSafetyResult {
  level: HealthSafetyLevel;
  isHealthRelated: boolean;
  shouldRedirectToDoctor: boolean;
  safetyNote?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEALTH KEYWORDS (Basic Detection)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const HEALTH_KEYWORDS = new Set([
  // English
  'medicine', 'tablet', 'drug', 'pill', 'capsule', 'syrup', 'injection',
  'dosage', 'dose', 'prescription', 'antibiotic', 'painkiller',
  'disease', 'symptoms', 'diagnosis', 'treatment', 'cure', 'remedy',
  
  // Hindi/Hinglish
  'dawai', 'dawa', 'goli', 'bimari', 'ilaj', 'upchar', 'nuskha', 'nuskhe',
  'bukhar', 'sardi', 'khansi', 'dard',
]);

const EMERGENCY_PATTERNS = /\b(chest pain|seene mein dard|saans nahi|breathing problem|heart attack|behosh|unconscious|stroke|emergency)\b/i;

const MEDICINE_REQUEST_PATTERNS = /\b(kya lun|konsi medicine|tablet batao|medicine btao|dawai btao|suggest karo medicine|recommend medicine)\b/i;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Check if message is health-related
 */
export const isHealthRelated = (message: string): boolean => {
  const lower = message.toLowerCase();
  return Array.from(HEALTH_KEYWORDS).some(keyword => lower.includes(keyword));
};

/**
 * Check if message is emergency
 */
export const isEmergency = (message: string): boolean => {
  return EMERGENCY_PATTERNS.test(message);
};

/**
 * Check if user is asking for specific medicine recommendation
 */
export const isMedicineRequest = (message: string): boolean => {
  return MEDICINE_REQUEST_PATTERNS.test(message);
};

/**
 * Basic health safety check for main Soriva chat
 * Returns simple guidance - no deep health logic
 */
export const checkHealthSafety = (message: string): HealthSafetyResult => {
  const lower = message.toLowerCase();
  
  // Emergency - immediate redirect
  if (isEmergency(message)) {
    return {
      level: 'redirect',
      isHealthRelated: true,
      shouldRedirectToDoctor: true,
      safetyNote: 'Emergency detected - advise immediate medical attention',
    };
  }
  
  // Medicine request - redirect to doctor
  if (isMedicineRequest(message)) {
    return {
      level: 'redirect',
      isHealthRelated: true,
      shouldRedirectToDoctor: true,
      safetyNote: 'Medicine request - redirect to doctor without naming medicines',
    };
  }
  
  // General health query - caution
  if (isHealthRelated(message)) {
    return {
      level: 'caution',
      isHealthRelated: true,
      shouldRedirectToDoctor: false,
      safetyNote: 'Health topic - provide general info, suggest doctor for specifics',
    };
  }
  
  // Not health related
  return {
    level: 'safe',
    isHealthRelated: false,
    shouldRedirectToDoctor: false,
  };
};

/**
 * Get basic health safety instruction for system prompt
 * Minimal - just ensures no medicine names are given
 */
export const getHealthSafetyInstruction = (safetyResult: HealthSafetyResult): string => {
  if (!safetyResult.isHealthRelated) {
    return '';
  }
  
  if (safetyResult.level === 'redirect') {
    return `HEALTH SAFETY: Do not recommend specific medicines or dosages. Guide user to consult a doctor.`;
  }
  
  if (safetyResult.level === 'caution') {
    return `HEALTH TOPIC: Provide general information only. For specific medical advice, suggest consulting a healthcare professional.`;
  }
  
  return '';
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RESPONSE QUALITY CHECK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Basic check if response accidentally contains medicine names
 * Use this as a safety net before sending response
 */
export const responseContainsMedicine = (response: string): boolean => {
  // Common medicine patterns
  const medicinePatterns = /\b(paracetamol|ibuprofen|aspirin|crocin|dolo|combiflam|azithromycin|amoxicillin|cetirizine|omeprazole|pantoprazole)\b/i;
  
  // Dosage patterns
  const dosagePatterns = /\d+\s*(mg|ml|mcg|tablet|goli|capsule)\b/i;
  
  return medicinePatterns.test(response) || dosagePatterns.test(response);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default {
  isHealthRelated,
  isEmergency,
  isMedicineRequest,
  checkHealthSafety,
  getHealthSafetyInstruction,
  responseContainsMedicine,
};