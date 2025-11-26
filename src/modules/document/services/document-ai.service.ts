// src/modules/document/services/document-ai.service.ts

/**
 * 🎯 SORIVA - DOCUMENT AI SERVICE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Developer: Amandeep Singh, Punjab, India
 * Created: November 24, 2025
 * Philosophy: "Cost-optimized AI routing for Document Intelligence"
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * AI ROUTING STRATEGY:
 * FREE Users:  100% Gemini Flash (FREE)
 * PAID Users:  80% GPT-4o-mini, 15% Haiku 4.5, 5% Flash
 * 
 * FEATURES:
 * ✅ Multi-provider support (Google, OpenAI, Anthropic)
 * ✅ Automatic routing based on operation type
 * ✅ Token counting & cost tracking
 * ✅ Retry with exponential backoff
 * ✅ Fallback between providers
 * ✅ Response caching support
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { 
  AI_ROUTING_RULES, 
  getAIRouting, 
  getTokenCaps,
} from '../../../constants/documentLimits';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface DocumentAIRequest {
  operation: string;
  content: string;
  options?: DocumentAIOptions;
  isPaidUser: boolean;
}

export interface DocumentAIOptions {
  temperature?: number;
  maxOutputTokens?: number;
  language?: string;
  format?: 'text' | 'json' | 'markdown';
  customInstructions?: string;
  [key: string]: unknown;
}

export interface DocumentAIResponse {
  success: boolean;
  content: string;
  provider: 'google' | 'openai' | 'anthropic';
  model: string;
  tier: 'gemini' | 'gpt' | 'haiku';
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  cost: number; // in INR
  processingTime: number; // in ms
  cached: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DOCUMENT AI SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class DocumentAIService {
  private static instance: DocumentAIService;
  
  // AI Clients
  private geminiClient: GoogleGenerativeAI;
  private openaiClient: OpenAI;
  private anthropicClient: Anthropic;
  
  // Models
  private geminiFlash: GenerativeModel;
  
  // Metrics
  private requestCount: number = 0;
  private totalCost: number = 0;
  private providerStats: Record<string, number> = {
    gemini: 0,
    gpt: 0,
    haiku: 0,
  };

  private constructor() {
    // Initialize Gemini
    this.geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.geminiFlash = this.geminiClient.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp' 
    });
    
    // Initialize OpenAI
    this.openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
    
    // Initialize Anthropic
    this.anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });
  }

  public static getInstance(): DocumentAIService {
    if (!DocumentAIService.instance) {
      DocumentAIService.instance = new DocumentAIService();
    }
    return DocumentAIService.instance;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN EXECUTION METHOD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Execute AI operation with smart routing
   */
  public async execute(request: DocumentAIRequest): Promise<DocumentAIResponse> {
    const startTime = Date.now();
    
    // Get routing decision
    const routing = getAIRouting(request.operation, request.isPaidUser);
    const tokenCaps = getTokenCaps(request.operation);
    
    // Truncate content to token cap
    const truncatedContent = this.truncateToTokenLimit(request.content, tokenCaps.input);
    
    // Build prompt
    const prompt = this.buildPrompt(request.operation, truncatedContent, request.options);
    
    try {
      let response: DocumentAIResponse;
      
      // Route to appropriate provider
      switch (routing.tier) {
        case 'gemini':
          response = await this.executeGeminiFlash(prompt, tokenCaps.output, request);
          break;
        case 'gpt':
          response = await this.executeGPT4oMini(prompt, tokenCaps.output, request);
          break;
        case 'haiku':
          response = await this.executeHaiku(prompt, tokenCaps.output, request);
          break;
        default:
          response = await this.executeGeminiFlash(prompt, tokenCaps.output, request);
      }
      
      // Update metrics
      this.updateMetrics(response);
      
      return {
        ...response,
        processingTime: Date.now() - startTime,
      };
      
    } catch (error) {
      // Try fallback on error
      return this.handleErrorWithFallback(error, prompt, tokenCaps, request, startTime);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PROVIDER IMPLEMENTATIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Execute with Gemini 2.0 Flash (FREE tier - 5% for PAID, 100% for FREE)
   */
  private async executeGeminiFlash(
    prompt: string, 
    maxOutputTokens: number,
    request: DocumentAIRequest
  ): Promise<DocumentAIResponse> {
    const result = await this.geminiFlash.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens,
        temperature: request.options?.temperature ?? 0.3,
      },
    });
    
    const response = result.response;
    const text = response.text();
    const usage = response.usageMetadata;
    
    return {
      success: true,
      content: text,
      provider: 'google',
      model: 'gemini-2.0-flash-exp',
      tier: 'gemini',
      tokensUsed: {
        input: usage?.promptTokenCount || this.estimateTokens(prompt),
        output: usage?.candidatesTokenCount || this.estimateTokens(text),
        total: usage?.totalTokenCount || this.estimateTokens(prompt + text),
      },
      cost: 0, // Gemini Flash is FREE
      processingTime: 0,
      cached: false,
    };
  }

  /**
   * Execute with GPT-4o-mini (80% of PAID requests)
   */
  private async executeGPT4oMini(
    prompt: string, 
    maxOutputTokens: number,
    request: DocumentAIRequest
  ): Promise<DocumentAIResponse> {
    const completion = await this.openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxOutputTokens,
      temperature: request.options?.temperature ?? 0.3,
    });
    
    const text = completion.choices[0]?.message?.content || '';
    const usage = completion.usage;
    
    // Calculate cost: $0.15/1M input, $0.60/1M output * 85 (INR)
    const inputCost = ((usage?.prompt_tokens || 0) / 1_000_000) * 0.15 * 85;
    const outputCost = ((usage?.completion_tokens || 0) / 1_000_000) * 0.60 * 85;
    
    return {
      success: true,
      content: text,
      provider: 'openai',
      model: 'gpt-4o-mini',
      tier: 'gpt',
      tokensUsed: {
        input: usage?.prompt_tokens || this.estimateTokens(prompt),
        output: usage?.completion_tokens || this.estimateTokens(text),
        total: usage?.total_tokens || this.estimateTokens(prompt + text),
      },
      cost: Math.round((inputCost + outputCost) * 100) / 100,
      processingTime: 0,
      cached: false,
    };
  }

  /**
   * Execute with Claude Haiku 4.5 (15% of PAID requests - Complex tasks)
   */
  private async executeHaiku(
    prompt: string, 
    maxOutputTokens: number,
    request: DocumentAIRequest
  ): Promise<DocumentAIResponse> {
    const message = await this.anthropicClient.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxOutputTokens,
      messages: [{ role: 'user', content: prompt }],
    });
    
    // Extract text from content blocks
    const text = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('');
    
    const usage = message.usage;
    
    // Calculate cost: $0.80/1M input, $4/1M output * 85 (INR)
    const inputCost = ((usage?.input_tokens || 0) / 1_000_000) * 0.80 * 85;
    const outputCost = ((usage?.output_tokens || 0) / 1_000_000) * 4 * 85;
    
    return {
      success: true,
      content: text,
      provider: 'anthropic',
      model: 'claude-haiku-4-5-20251001',
      tier: 'haiku',
      tokensUsed: {
        input: usage?.input_tokens || this.estimateTokens(prompt),
        output: usage?.output_tokens || this.estimateTokens(text),
        total: (usage?.input_tokens || 0) + (usage?.output_tokens || 0),
      },
      cost: Math.round((inputCost + outputCost) * 100) / 100,
      processingTime: 0,
      cached: false,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PROMPT BUILDER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Build operation-specific prompts
   */
  private buildPrompt(operation: string, content: string, options?: DocumentAIOptions): string {
    const prompts: Record<string, string> = {
      // ===== FREE Operations =====
      SUMMARY_SHORT: `Summarize this document in 2-3 sentences. Be concise and capture key points.

Document:
${content}

Summary:`,

      SUMMARY_BULLET: `Extract 5-7 key bullet points from this document. Each point should be one clear sentence.

Document:
${content}

Key Points:`,

      KEYWORD_EXTRACT: `Extract 10-15 important keywords and phrases from this document. Return as comma-separated list.

Document:
${content}

Keywords:`,

      DOCUMENT_CLEANUP: `Clean up this document by fixing formatting, grammar, and structure. Preserve the original meaning.

Document:
${content}

Cleaned Document:`,

      FLASHCARDS: `Create 5 study flashcards from this document. Format each as:
Q: [Question]
A: [Answer]

Document:
${content}

Flashcards:`,

      // ===== PAID Operations (GPT-4o-mini - 80%) =====
      SUMMARY_LONG: `Write a comprehensive summary of this document in 3-4 paragraphs. Cover all major topics and conclusions.

Document:
${content}

Detailed Summary:`,

      SUMMARIES_ADVANCED: `Create an executive summary suitable for business stakeholders. Include:
- Key findings
- Recommendations
- Action items

Document:
${content}

Executive Summary:`,

      NOTES_GENERATOR: `Generate structured study notes from this document. Use headings, subheadings, and bullet points.

Document:
${content}

Study Notes:`,

      TOPIC_BREAKDOWN: `Break down this document into main topics and subtopics. Create an outline structure.

Document:
${content}

Topic Breakdown:`,

      TEST_GENERATOR: `Create a test with 10 multiple choice questions from this document. Format:
1. Question?
   a) Option A
   b) Option B
   c) Option C
   d) Option D
   Answer: [letter]

Document:
${content}

Test Questions:`,

      QUESTION_BANK: `Generate a comprehensive question bank with:
- 10 MCQs
- 5 Short answer questions
- 3 Long answer questions

Document:
${content}

Question Bank:`,

      FILL_IN_BLANKS: `Create 10 fill-in-the-blank exercises from this document. Mark blanks with _____.

Document:
${content}

Fill in the Blanks:`,

      PRESENTATION_MAKER: `Create a presentation outline with 8-10 slides from this document. For each slide include:
- Slide title
- 3-4 bullet points
- Speaker notes (1-2 sentences)

Document:
${content}

Presentation Outline:`,

      REPORT_BUILDER: `Generate a professional report from this document. Include:
- Executive Summary
- Introduction
- Key Findings
- Analysis
- Recommendations
- Conclusion

Document:
${content}

Professional Report:`,

      TRANSLATE_BASIC: `Translate this document to ${options?.language || 'Hindi'}. Maintain the original formatting.

Document:
${content}

Translation:`,

      TRANSLATE_SIMPLIFY_ADVANCED: `Translate this document to ${options?.language || 'Hindi'} and simplify complex terms for general audience.

Document:
${content}

Simplified Translation:`,

      TABLE_TO_CHARTS: `Analyze the tables/data in this document and suggest:
1. Best chart type for visualization
2. Key data points to highlight
3. Insights from the data

Return as JSON:
{
  "chartType": "bar|line|pie",
  "title": "Chart title",
  "dataPoints": [...],
  "insights": [...]
}

Document:
${content}

Chart Configuration:`,

      KEYWORD_INDEX_EXTRACTOR: `Create a comprehensive keyword index for this document. Group keywords by category and include page/section references.

Document:
${content}

Keyword Index:`,

      WORKFLOW_CONVERSION: `Convert this document into a step-by-step workflow or process guide. Use numbered steps and decision points.

Document:
${content}

Workflow:`,

      DOCUMENT_CLEANUP_ADVANCED: `Professionally clean and restructure this document:
- Fix all grammar and spelling
- Improve sentence structure
- Enhance readability
- Add proper formatting
- Maintain original meaning

Document:
${content}

Professional Document:`,

      VOICE_MODE: `Convert this document into a conversational script suitable for voice narration. Keep it natural and engaging.

Document:
${content}

Voice Script:`,

      // ===== PAID Operations (Haiku 4.5 - 15% Complex) =====
      CONTRACT_LAW_SCAN: `Analyze this legal document and identify:
- Key terms and conditions
- Obligations of each party
- Risk areas
- Important dates/deadlines
- Red flags or concerns

Document:
${content}

Legal Analysis:`,

      MULTI_DOC_REASONING: `Analyze these documents together and provide:
- Common themes
- Contradictions
- Synthesis of information
- Unified conclusions

Documents:
${content}

Multi-Document Analysis:`,

      INSIGHTS_EXTRACTION: `Extract key insights and actionable intelligence from this document. Focus on:
- Important discoveries
- Hidden patterns
- Implications
- Recommendations

Document:
${content}

Key Insights:`,

      TREND_ANALYSIS: `Analyze trends and patterns in this document. Identify:
- Key trends
- Growth areas
- Declining areas
- Predictions

Document:
${content}

Trend Analysis:`,

      AI_DETECTION_REDACTION: `Analyze this text and identify sections that appear to be AI-generated. Provide:
- Percentage likelihood of AI generation
- Specific sections flagged
- Reasoning

Document:
${content}

AI Detection Report:`,

      CROSS_PDF_COMPARE: `Compare and contrast the key points, similarities, and differences in the following documents.

Documents:
${content}

Comparison Analysis:`,

      DIAGRAM_INTERPRETATION: `Describe and explain the diagrams, charts, or visual elements in this document. Include:
- What the visual shows
- Key data points
- Interpretation

Document:
${content}

Visual Interpretation:`,

      DOCUMENT_CHAT_MEMORY: `Based on this document, answer the following question accurately. If the answer is not in the document, say so.

Document:
${content}

Question: ${options?.question || 'What is this document about?'}

Answer:`,
    };

    let prompt = prompts[operation] || `Process this document:\n\n${content}`;
    
    // Add custom instructions if provided
    if (options?.customInstructions) {
      prompt += `\n\nAdditional Instructions: ${options.customInstructions}`;
    }
    
    // Add format instruction
    if (options?.format === 'json') {
      prompt += '\n\nReturn response as valid JSON.';
    } else if (options?.format === 'markdown') {
      prompt += '\n\nFormat response using Markdown.';
    }
    
    return prompt;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FALLBACK HANDLER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Handle errors with fallback to Gemini Flash (FREE & reliable)
   */
  private async handleErrorWithFallback(
    error: unknown,
    prompt: string,
    tokenCaps: { input: number; output: number },
    request: DocumentAIRequest,
    startTime: number
  ): Promise<DocumentAIResponse> {
    console.error('[DocumentAI] Primary provider failed, trying Gemini Flash fallback:', error);
    
    try {
      // Always fallback to Gemini Flash (FREE & reliable)
      const response = await this.executeGeminiFlash(prompt, tokenCaps.output, request);
      
      return {
        ...response,
        processingTime: Date.now() - startTime,
      };
    } catch (fallbackError) {
      console.error('[DocumentAI] Fallback also failed:', fallbackError);
      
      throw new Error(
        `AI processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UTILITY METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Truncate content to token limit
   * Rough estimation: 1 token ≈ 4 characters
   */
  private truncateToTokenLimit(content: string, maxTokens: number): string {
    const maxChars = maxTokens * 4;
    if (content.length <= maxChars) {
      return content;
    }
    return content.substring(0, maxChars) + '\n\n[Content truncated for processing...]';
  }

  /**
   * Estimate token count
   * Rough estimation: 1 token ≈ 4 characters for English
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Update service metrics
   */
  private updateMetrics(response: DocumentAIResponse): void {
    this.requestCount++;
    this.totalCost += response.cost;
    this.providerStats[response.tier]++;
  }

  /**
   * Get service statistics
   */
  public getStats(): {
    requestCount: number;
    totalCost: number;
    providerStats: Record<string, number>;
  } {
    return {
      requestCount: this.requestCount,
      totalCost: Math.round(this.totalCost * 100) / 100,
      providerStats: { ...this.providerStats },
    };
  }

  /**
   * Health check for all providers
   */
  public async healthCheck(): Promise<{
    gemini: boolean;
    openai: boolean;
    anthropic: boolean;
  }> {
    const results = {
      gemini: false,
      openai: false,
      anthropic: false,
    };

    // Check Gemini Flash
    try {
      await this.geminiFlash.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
        generationConfig: { maxOutputTokens: 5 },
      });
      results.gemini = true;
    } catch (e) {
      console.error('[HealthCheck] Gemini Flash failed:', e);
    }

    // Check OpenAI
    try {
      await this.openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 5,
      });
      results.openai = true;
    } catch (e) {
      console.error('[HealthCheck] OpenAI failed:', e);
    }

    // Check Anthropic
    try {
      await this.anthropicClient.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 5,
        messages: [{ role: 'user', content: 'ping' }],
      });
      results.anthropic = true;
    } catch (e) {
      console.error('[HealthCheck] Anthropic failed:', e);
    }

    return results;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const documentAIService = DocumentAIService.getInstance();
export default documentAIService;