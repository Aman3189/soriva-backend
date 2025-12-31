// ============================================
// SORIVA HEALTH - AI SERVICE
// Path: src/modules/health/services/health.ai.service.ts
// ============================================
// Gemini integration for SAFE, EDUCATIONAL features
// NO: Diagnosis, Scores, Risk, Predictions
// YES: Education, Explanation, Doctor Questions
// ============================================

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { SYSTEM_PROMPTS, FORBIDDEN_PHRASES, DISCLAIMERS } from '../health.constants';
import { HEALTH_LLM_CONFIG } from '../../../config/health-plans.config';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Local operation type matching config keys
type HealthAIOperation = 'CHAT' | 'EXPLANATION' | 'QUESTIONS';

export interface HealthAIRequest {
  operation: HealthAIOperation;
  userMessage: string;
  reportContext?: string;
  additionalContext?: Record<string, any>;
}

export interface HealthAIResponse {
  success: boolean;
  content: string;
  tokensUsed: number;
  model: string;
  error?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LLM CONFIG HELPER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getLLMConfig(operation: HealthAIOperation) {
  switch (operation) {
    case 'CHAT':
      return HEALTH_LLM_CONFIG.CHAT;
    case 'EXPLANATION':
      return HEALTH_LLM_CONFIG.EXPLANATION;
    case 'QUESTIONS':
      return HEALTH_LLM_CONFIG.EXPLANATION; // Questions use same config as Explanation
    default:
      return HEALTH_LLM_CONFIG.CHAT;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEALTH AI SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class HealthAIService {
  private genAI: GoogleGenerativeAI;
  private models: Map<string, GenerativeModel> = new Map();

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  // ═══════════════════════════════════════════════════════
  // MODEL INITIALIZATION
  // ═══════════════════════════════════════════════════════

  private getModel(operation: HealthAIOperation): GenerativeModel {
    const config = getLLMConfig(operation);
    const modelName = config.MODEL;

    if (!this.models.has(modelName)) {
      this.models.set(
        modelName,
        this.genAI.getGenerativeModel({ model: modelName })
      );
    }

    return this.models.get(modelName)!;
  }

  // ═══════════════════════════════════════════════════════
  // MAIN GENERATE METHOD
  // ═══════════════════════════════════════════════════════

  async generate(request: HealthAIRequest): Promise<HealthAIResponse> {
    const { operation, userMessage, reportContext, additionalContext } = request;

    try {
      // Get config and model
      const config = getLLMConfig(operation);
      const model = this.getModel(operation);

      // Build system prompt based on operation
      const systemPrompt = this.getSystemPrompt(operation);

      // Build full prompt
      const fullPrompt = this.buildPrompt(
        systemPrompt,
        userMessage,
        reportContext,
        additionalContext
      );

      // Generate response
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: {
          maxOutputTokens: config.MAX_TOKENS,
          temperature: config.TEMPERATURE,
        },
      });

      const response = result.response;
      const content = response.text();

      // Sanitize response - remove any forbidden phrases
      const sanitizedContent = this.sanitizeResponse(content);

      // Estimate tokens (Gemini doesn't always return exact counts)
      const tokensUsed = this.estimateTokens(fullPrompt, sanitizedContent);

      return {
        success: true,
        content: sanitizedContent,
        tokensUsed,
        model: config.MODEL,
      };
    } catch (error: any) {
      console.error('Health AI Service Error:', error);

      return {
        success: false,
        content: this.getFallbackResponse(operation),
        tokensUsed: 0,
        model: 'fallback',
        error: error.message,
      };
    }
  }

  // ═══════════════════════════════════════════════════════
  // SPECIALIZED METHODS
  // ═══════════════════════════════════════════════════════

  /**
   * Health Chat - Educational Q&A about reports
   */
  async chat(
    message: string,
    reportContext?: string,
    sessionHistory?: { role: string; content: string }[]
  ): Promise<HealthAIResponse> {
    // Build context from history if provided
    let historyContext = '';
    if (sessionHistory && sessionHistory.length > 0) {
      const recentHistory = sessionHistory.slice(-6); // Last 3 exchanges
      historyContext = recentHistory
        .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');
    }

    const additionalContext = historyContext
      ? { conversationHistory: historyContext }
      : undefined;

    return this.generate({
      operation: 'CHAT',
      userMessage: message,
      reportContext,
      additionalContext,
    });
  }

  /**
   * Explain a medical term in plain English
   */
  async explainTerm(
    term: string,
    context?: string
  ): Promise<HealthAIResponse> {
    const userMessage = `Explain the medical term "${term}" in simple, plain English.
${context ? `\nContext from report: ${context}` : ''}

Remember:
- DO NOT say if a value is good/bad/normal/abnormal
- DO NOT interpret what it means for the user's health
- Just explain what the term generally means in medicine
- Keep it simple (8th grade reading level)
- End with: "Your doctor can tell you what this means for you specifically."`;

    return this.generate({
      operation: 'EXPLANATION',
      userMessage,
    });
  }

  /**
   * Generate questions to ask doctor
   */
  async generateDoctorQuestions(
    reportType: string,
    reportDate: string,
    reportContent?: string,
    userConcerns?: string
  ): Promise<HealthAIResponse> {
    const userMessage = `Based on this health report, generate helpful questions the user can ask their doctor.

Report Type: ${reportType}
Report Date: ${reportDate}
${reportContent ? `Report Content: ${reportContent.substring(0, 2000)}` : ''}
${userConcerns ? `User's concerns: ${userConcerns}` : ''}

Generate 5-7 helpful, non-alarming questions. Format as a numbered list.

Rules:
- Questions should NOT assume anything is wrong
- Questions should be curious and informational, not alarming
- Include at least one question about next steps or follow-up
- Include at least one question about lifestyle factors their doctor might discuss
- DO NOT generate questions like "Am I at risk for [disease]?" or "Is this dangerous?"`;

    return this.generate({
      operation: 'QUESTIONS',
      userMessage,
    });
  }

  /**
   * Generate factual summary for comparison (NO interpretation)
   */
  async generateFactualSummary(
    title: string,
    reportType: string,
    reportDate: string,
    reportContent?: string
  ): Promise<HealthAIResponse> {
    const userMessage = `Create a brief factual summary (2-3 sentences) of this report.

Report: ${title}
Type: ${reportType}
Date: ${reportDate}
${reportContent ? `Content: ${reportContent.substring(0, 1000)}` : ''}

RULES:
- ONLY state facts: report type, date, what was tested
- DO NOT interpret, analyze, or comment on any values
- DO NOT say if anything is normal/abnormal/good/bad
- DO NOT mention anything about trends or changes
- Keep it to 2-3 sentences maximum

Example good response:
"This blood test from January 15, 2025 includes measurements for complete blood count and lipid panel. It was conducted at Apollo Diagnostics."`;

    return this.generate({
      operation: 'EXPLANATION',
      userMessage,
    });
  }

  // ═══════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════

  /**
   * Get system prompt based on operation type
   */
  private getSystemPrompt(operation: HealthAIOperation): string {
    switch (operation) {
      case 'CHAT':
        return SYSTEM_PROMPTS.HEALTH_CHAT;
      case 'EXPLANATION':
        return SYSTEM_PROMPTS.TERM_EXPLANATION;
      case 'QUESTIONS':
        return SYSTEM_PROMPTS.DOCTOR_QUESTIONS;
      default:
        return SYSTEM_PROMPTS.HEALTH_CHAT;
    }
  }

  /**
   * Build the full prompt with all context
   */
  private buildPrompt(
    systemPrompt: string,
    userMessage: string,
    reportContext?: string,
    additionalContext?: Record<string, any>
  ): string {
    let prompt = `${systemPrompt}\n\n`;

    // Add report context if provided
    if (reportContext) {
      prompt += `--- REPORT CONTEXT ---\n${reportContext}\n--- END REPORT CONTEXT ---\n\n`;
    }

    // Add any additional context
    if (additionalContext) {
      if (additionalContext.conversationHistory) {
        prompt += `--- CONVERSATION HISTORY ---\n${additionalContext.conversationHistory}\n--- END HISTORY ---\n\n`;
      }
    }

    // Add the user's message
    prompt += `User: ${userMessage}\n\nAssistant:`;

    return prompt;
  }

  /**
   * Sanitize AI response - remove forbidden phrases
   */
  private sanitizeResponse(response: string): string {
    let sanitized = response;
    let hasForbidden = false;

    // Check and log forbidden phrases
    for (const phrase of FORBIDDEN_PHRASES) {
      const regex = new RegExp(phrase, 'gi');
      if (regex.test(sanitized)) {
        console.warn(`[Health AI] Removing forbidden phrase: "${phrase}"`);
        hasForbidden = true;
        
        // Replace with safer alternatives
        sanitized = sanitized.replace(regex, this.getSafeReplacement(phrase));
      }
    }

    // If forbidden phrases were found, add extra disclaimer
    if (hasForbidden) {
      sanitized += `\n\n${DISCLAIMERS.CHAT}`;
    }

    return sanitized.trim();
  }

  /**
   * Get safe replacement for forbidden phrase
   */
  private getSafeReplacement(phrase: string): string {
    const lowerPhrase = phrase.toLowerCase();

    // Value judgments
    if (['normal', 'abnormal', 'good', 'bad', 'healthy', 'unhealthy'].some(p => lowerPhrase.includes(p))) {
      return 'within a range your doctor can discuss with you';
    }

    // Risk/diagnosis
    if (['risk', 'diagnos', 'you have', 'you may have'].some(p => lowerPhrase.includes(p))) {
      return 'something your doctor can evaluate';
    }

    // Recommendations
    if (['you should', 'you need to', 'i recommend'].some(p => lowerPhrase.includes(p))) {
      return 'your doctor may discuss options such as';
    }

    // Predictions
    if (['will lead to', 'will cause', 'can cause'].some(p => lowerPhrase.includes(p))) {
      return 'may be related to factors your doctor can explain';
    }

    // Default
    return '[discuss with your doctor]';
  }

  /**
   * Get fallback response when AI fails
   */
  private getFallbackResponse(operation: HealthAIOperation): string {
    switch (operation) {
      case 'CHAT':
        return `I apologize, but I'm having trouble processing your question right now. Please try again in a moment.\n\n${DISCLAIMERS.CHAT}`;

      case 'EXPLANATION':
        return `I couldn't generate an explanation at this time. For accurate information about this medical term, please consult your healthcare provider or a reliable medical resource.\n\n${DISCLAIMERS.TERM_EXPLANATION}`;

      case 'QUESTIONS':
        return `I couldn't generate questions right now. Here are some general questions you might consider asking your doctor:\n
1. What does this report tell you about my health?
2. Are there any follow-up tests you'd recommend?
3. Is there anything I should be aware of?
4. When should I schedule my next check-up?\n\n${DISCLAIMERS.QUESTIONS}`;

      default:
        return `I'm sorry, I couldn't process that request. Please try again or consult your healthcare provider.\n\n${DISCLAIMERS.CHAT}`;
    }
  }

  /**
   * Estimate token usage (approximate)
   */
  private estimateTokens(prompt: string, response: string): number {
    // Rough estimation: ~4 characters per token
    const promptTokens = Math.ceil(prompt.length / 4);
    const responseTokens = Math.ceil(response.length / 4);
    return promptTokens + responseTokens;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SINGLETON EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const healthAIService = new HealthAIService();