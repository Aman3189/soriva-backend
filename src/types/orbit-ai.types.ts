/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ORBIT AI TYPES
 * Types for AI-powered orbit suggestions and learning system
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

/**
 * Orbit suggestion from AI
 */
export interface OrbitSuggestion {
  orbitId: string;
  orbitName: string;
  confidence: number; // 0-1
  reason: string;
}

/**
 * Request to get orbit suggestions
 */
export interface SuggestOrbitRequest {
  conversationId: string;
  conversationTitle: string;
  conversationPreview?: string;
}

/**
 * Response with orbit suggestions
 */
export interface SuggestOrbitResponse {
  suggestions: OrbitSuggestion[];
}

/**
 * User feedback on suggestion
 */
export interface OrbitFeedbackRequest {
  conversationId: string;
  suggestedOrbitId: string;
  userChoice: 'accepted' | 'rejected' | 'different';
  selectedOrbitId?: string; // if user chose different orbit
}

/**
 * Suggestion statistics
 */
export interface OrbitSuggestionStats {
  totalSuggestions: number;
  accepted: number;
  rejected: number;
  different: number;
  accuracy: number; // percentage
}

/**
 * Orbit with learned keywords
 */
export interface OrbitWithKeywords {
  id: string;
  name: string;
  keywords: string[];
}

/**
 * Keyword weight for learning
 */
export interface OrbitKeyword {
  id: string;
  userId: string;
  orbitId: string;
  keyword: string;
  weight: number;
  createdAt: Date;
}

/**
 * Suggestion history record
 */
export interface OrbitSuggestionHistory {
  id: string;
  userId: string;
  conversationId: string;
  suggestedOrbitId: string;
  confidence: number;
  userChoice: 'accepted' | 'rejected' | 'different' | null;
  selectedOrbitId?: string;
  createdAt: Date;
}