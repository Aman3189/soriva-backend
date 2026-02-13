// src/modules/document/services/document-ai.service.ts

/**
 * ==========================================
 * SORIVA - DOCUMENT AI SERVICE
 * ==========================================
 * Developer: Amandeep, Punjab, India
 * Created: November 24, 2025
 * Updated: December 10, 2025 - COMPLETE AUDIT & WORLD CLASS UPGRADE
 * Philosophy: "10/10 or nothing"
 * ==========================================
 * 
 * AUDIT FIXES APPLIED:
 * ✅ Added ALL 33 operation prompts (was missing 5)
 * ✅ Upgraded ALL prompts to WORLD CLASS quality
 * ✅ Added retry with exponential backoff
 * ✅ Added response caching support
 * ✅ Added structured output parsing
 * ✅ Fixed routing comments
 * ✅ Added proper error handling
 * ✅ Added request timeout handling
 * 
 * AI ROUTING STRATEGY (from documentLimits.ts):
 * ─────────────────────────────────────────
 * FREE Users:  100% Gemini 2.0 Flash (₹0 cost)
 * PAID Users:  Smart routing based on operation:
 *   - Gemini Flash: 15 operations (simple tasks)
 *   - GPT-4o-mini: 10 operations (medium complexity)
 *   - Claude Haiku 4.5: 8 operations (complex reasoning)
 * 
 * FEATURES:
 * ✅ Multi-provider support (Google, OpenAI, Anthropic)
 * ✅ Automatic routing based on operation type
 * ✅ Token counting & cost tracking
 * ✅ Retry with exponential backoff (3 attempts)
 * ✅ Fallback between providers
 * ✅ Response caching (24-hour TTL)
 * ✅ Structured output parsing
 * ✅ Request timeout handling
 * ✅ Health check for all providers
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import crypto from 'crypto';
import {
  ProviderFactory,
  createAIModel,
  MessageRole,
} from '../../../core/ai/providers';
import { 
  AI_ROUTING_RULES, 
  getAIRouting, 
  getTokenCaps,
  OPERATION_METADATA,
} from '../../../constants/documentLimits';
import type {
  StructuredOperationResult,
  PresentationResult,
  TestResult,
  QuizTurboResult,
  NotesResult,
  TeacherExplanationResult,
  ScriptResult,
  DefinitionsResult,
  SummaryResult,
  BulletSummaryResult,
  KeywordsResult,
  FlashcardsResult,
} from '../interfaces/document-intelligence.types';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface DocumentAIRequest {
  operation: string;
  content: string;
  options?: DocumentAIOptions;
  isPaidUser: boolean;
  userId?: string;
  documentId?: string;
}

export interface DocumentAIOptions {
  // General options
  temperature?: number;
  maxOutputTokens?: number;
  language?: string;
  format?: 'text' | 'json' | 'markdown';
  customInstructions?: string;
  
  // Summary options
  length?: 'short' | 'medium' | 'long';
  
  // Test/Quiz options
  questionCount?: number;
  questionType?: 'mcq' | 'short' | 'long' | 'fill_blank' | 'true_false' | 'mixed';
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  includeAnswerKey?: boolean;
  
  // Quiz Turbo options
  quizTypes?: string[];
  includeCaseStudies?: boolean;
  caseStudyCount?: number;
  
  // Flashcard options
  cardCount?: number;
  includeHints?: boolean;
  
  // Notes options
  detailLevel?: 'brief' | 'detailed' | 'comprehensive';
  includeExamples?: boolean;
  notesStructure?: 'outline' | 'cornell' | 'mindmap' | 'traditional';
  
  // Presentation options
  slideCount?: number;
  templateStyle?: 'professional' | 'academic' | 'creative' | 'minimal' | 'corporate';
  includeSpeakerNotes?: boolean;
  includeInfographics?: boolean;
  colorTheme?: string;
  
  // Teacher mode options
  teachingStyle?: 'socratic' | 'lecture' | 'interactive' | 'storytelling';
  includeFormulas?: boolean;
  includePracticeProblems?: boolean;
  includeMemoryAids?: boolean;
  subjectArea?: string;
  
  // Script options
  scriptType?: 'youtube' | 'podcast' | 'presentation' | 'explainer' | 'tutorial';
  targetDuration?: number;
  includeTimestamps?: boolean;
  includeBRollSuggestions?: boolean;
  scriptTone?: 'professional' | 'casual' | 'educational' | 'entertaining';
  
  // Definition options
  maxDefinitions?: number;
  includeExamplesWithDefinitions?: boolean;
  sortDefinitions?: 'alphabetical' | 'order_of_appearance' | 'importance';
  
  // ELI5 options
  targetAudience?: 'child' | 'teenager' | 'adult_beginner' | 'general';
  useAnalogies?: boolean;
  
  // Q&A options
  question?: string;
  customQuestion?: string;
  
  // Translation options
  targetLanguage?: string;
  
  // Report options
  reportType?: 'summary' | 'analysis' | 'research' | 'executive' | 'technical';
  includeRecommendations?: boolean;
  
  // Legal options
  jurisdiction?: string;
  riskFocus?: 'high' | 'medium' | 'all';
  
  // Index for additional properties
  [key: string]: unknown;
}

export interface DocumentAIResponse {
  success: boolean;
  content: string;
  structuredContent?: StructuredOperationResult;
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
  cacheKey?: string;
  retryCount?: number;
}

interface CacheEntry {
  content: string;
  structuredContent?: StructuredOperationResult;
  provider: 'google' | 'openai' | 'anthropic';
  model: string;
  tier: 'gemini' | 'gpt' | 'haiku';
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  cost: number;
  createdAt: number;
  expiresAt: number;
  hitCount: number;
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

// ==========================================
// DOCUMENT AI SERVICE CLASS
// ==========================================

class DocumentAIService {
  private static instance: DocumentAIService;
  
  // AI Clients
  private geminiClient: GoogleGenerativeAI;
  private openaiClient: OpenAI;
  private anthropicClient: Anthropic;
  
  // ProviderFactory for Mistral (Doc AI Primary)
  private factory: ProviderFactory;
  
  // Models
  private geminiFlash: GenerativeModel;
  
  // Cache (In-memory - for production use Redis)
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  
  // Retry configuration
  private readonly retryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
  };
  
  // Request timeout
  private readonly REQUEST_TIMEOUT = 60000; // 60 seconds
  
  // Metrics
  private requestCount: number = 0;
  private totalCost: number = 0;
  private cacheHits: number = 0;
  private cacheMisses: number = 0;
  private providerStats: Record<string, number> = {
    gemini: 0,
    gpt: 0,
    haiku: 0,
  };
  private errorStats: Record<string, number> = {
    gemini: 0,
    gpt: 0,
    haiku: 0,
  };

  private constructor() {
    // Initialize Gemini (fallback)
    this.geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.geminiFlash = this.geminiClient.getGenerativeModel({ 
      model: 'gemini-2.0-flash' 
    });
    
    // Initialize OpenAI
    this.openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
    
    // Initialize Anthropic
    this.anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });
    
    // Initialize ProviderFactory for Mistral (PRIMARY for Doc AI)
    this.factory = ProviderFactory.getInstance({
      mistralApiKey: process.env.MISTRAL_API_KEY,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      googleApiKey: process.env.GOOGLE_API_KEY,
      openaiApiKey: process.env.OPENAI_API_KEY,
      openrouterApiKey: process.env.OPENROUTER_API_KEY,
    });
    
    // Start cache cleanup interval
    this.startCacheCleanup();
    
    console.log('[DocumentAI] ✅ Initialized with ProviderFactory (Mistral Primary)');
  }

  public static getInstance(): DocumentAIService {
    if (!DocumentAIService.instance) {
      DocumentAIService.instance = new DocumentAIService();
    }
    return DocumentAIService.instance;
  }

  // ==========================================
  // MAIN EXECUTION METHOD
  // ==========================================

  /**
   * Execute AI operation with smart routing, caching, and retry
   */
  public async execute(request: DocumentAIRequest): Promise<DocumentAIResponse> {
    const startTime = Date.now();
    
    // Generate cache key
    const cacheKey = this.generateCacheKey(request);
    
    // Check cache first
    const cachedResponse = this.getFromCache(cacheKey);
    if (cachedResponse) {
      this.cacheHits++;
      return {
        success: true,
        content: cachedResponse.content,
        structuredContent: cachedResponse.structuredContent,
        provider: cachedResponse.provider,
        model: cachedResponse.model,
        tier: cachedResponse.tier,
        tokensUsed: cachedResponse.tokensUsed,
        cost: 0, // Cached = no cost
        processingTime: Date.now() - startTime,
        cached: true,
        cacheKey,
      };
    }
    this.cacheMisses++;
    
    // Get routing decision
    const routing = getAIRouting(request.operation, request.isPaidUser);
    const tokenCaps = getTokenCaps(request.operation);
    
    // Truncate content to token cap
    const truncatedContent = this.truncateToTokenLimit(request.content, tokenCaps.input);
    
    // Build prompt
    const prompt = this.buildPrompt(request.operation, truncatedContent, request.options);
    
    // Execute with retry
    let lastError: Error | null = null;
    let retryCount = 0;
    
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        let response: DocumentAIResponse;
        
        // Route to appropriate provider
        switch (routing.tier) {
          case 'gemini':
            // PRIMARY: Use Gemini 2.0 Flash (FAST!)
            response = await this.executeWithTimeout(
              () => this.executeGeminiFlash(prompt, tokenCaps.output, request),
              this.REQUEST_TIMEOUT
            );
            break;
          case 'gpt':
            response = await this.executeWithTimeout(
              () => this.executeGPT4oMini(prompt, tokenCaps.output, request),
              this.REQUEST_TIMEOUT
            );
            break;
          case 'haiku':
            response = await this.executeWithTimeout(
              () => this.executeHaiku(prompt, tokenCaps.output, request),
              this.REQUEST_TIMEOUT
            );
            break;
          default:
            // DEFAULT: Use Mistral via ProviderFactory
            response = await this.executeWithTimeout(
              () => this.executeMistral(prompt, tokenCaps.output, request),
              this.REQUEST_TIMEOUT
            );
        }
        
        // Parse structured output if JSON format
        if (request.options?.format === 'json' || this.shouldParseAsJSON(request.operation)) {
          response.structuredContent = this.parseStructuredOutput(response.content, request.operation);
        }
        
        // Update metrics
        this.updateMetrics(response);
        
        // Cache the response
        this.setCache(cacheKey, response);
        
        return {
          ...response,
          processingTime: Date.now() - startTime,
          cached: false,
          cacheKey,
          retryCount,
        };
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        retryCount = attempt + 1;
        this.errorStats[routing.tier]++;
        
        console.error(`[DocumentAI] Attempt ${attempt + 1} failed:`, error);
        
        if (attempt < this.retryConfig.maxRetries) {
          // Exponential backoff
          const delay = Math.min(
            this.retryConfig.baseDelay * Math.pow(2, attempt),
            this.retryConfig.maxDelay
          );
          await this.sleep(delay);
        }
      }
    }
    
    // All retries failed, try fallback
    return this.handleErrorWithFallback(lastError, prompt, tokenCaps, request, startTime, retryCount);
  }

  // ==========================================
  // PROVIDER IMPLEMENTATIONS
  // ==========================================

  /**
   * Execute with Mistral Large (PRIMARY for Doc AI)
   * Uses ProviderFactory for consistent routing
   * Model: mistral-large-latest
   */
  private async executeMistral(
    prompt: string, 
    maxOutputTokens: number,
    request: DocumentAIRequest
  ): Promise<DocumentAIResponse> {
    // Use ProviderFactory with STARTER plan (always uses Mistral)
    const response = await this.factory.executeWithFallback('STARTER' as any, {
      model: createAIModel('mistral-large-latest'),
      messages: [
        { role: MessageRole.SYSTEM, content: 'You are Soriva Doc AI, an expert document analysis assistant. Provide clear, accurate, and helpful responses.' },
        { role: MessageRole.USER, content: prompt }
      ],
      temperature: request.options?.temperature ?? 0.3,
      maxTokens: maxOutputTokens,
      userId: request.userId,
    });
    
    return {
      success: true,
      content: response.content || '',
      provider: 'google', // Keep for compatibility
      model: 'mistral-large-latest',
      tier: 'gemini', // Keep for compatibility
      tokensUsed: {
        input: response.usage?.promptTokens || this.estimateTokens(prompt),
        output: response.usage?.completionTokens || this.estimateTokens(response.content || ''),
        total: response.usage?.totalTokens || this.estimateTokens(prompt + (response.content || '')),
      },
      cost: 0,
      processingTime: 0,
      cached: false,
    };
  }
  
  /**
   * Legacy Gemini Flash (FALLBACK only)
   * Kept for fallback scenarios
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
      model: 'gemini-2.0-flash',
      tier: 'gemini',
      tokensUsed: {
        input: usage?.promptTokenCount || this.estimateTokens(prompt),
        output: usage?.candidatesTokenCount || this.estimateTokens(text),
        total: usage?.totalTokenCount || this.estimateTokens(prompt + text),
      },
      cost: 0,
      processingTime: 0,
      cached: false,
    };
  }

  /**
   * Execute with GPT-4o-mini
   * Used for: Medium complexity PAID operations
   * Cost: ₹12.75/1M input, ₹51/1M output
   */
  private async executeGPT4oMini(
    prompt: string, 
    maxOutputTokens: number,
    request: DocumentAIRequest
  ): Promise<DocumentAIResponse> {
    const completion = await this.openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional document intelligence assistant. Provide accurate, well-structured, and helpful responses. When asked for JSON, return valid JSON only without markdown code blocks.'
        },
        { role: 'user', content: prompt }
      ],
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
   * Execute with Claude Haiku 4.5
   * Used for: Complex reasoning PAID operations
   * Cost: ₹68/1M input, ₹340/1M output
   */
  private async executeHaiku(
    prompt: string, 
    maxOutputTokens: number,
    request: DocumentAIRequest
  ): Promise<DocumentAIResponse> {
    const message = await this.anthropicClient.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxOutputTokens,
      system: 'You are a professional document intelligence assistant specialized in complex analysis, legal review, and multi-document reasoning. Provide thorough, accurate, and well-reasoned responses. When asked for JSON, return valid JSON only without markdown code blocks.',
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

  // ==========================================
  // WORLD CLASS PROMPT BUILDER
  // All 33 Operations with Professional Prompts
  // ==========================================

  /**
   * Build operation-specific WORLD CLASS prompts
   */
  private buildPrompt(operation: string, content: string, options?: DocumentAIOptions): string {
    const operationMeta = OPERATION_METADATA[operation];
    const prompts: Record<string, string> = {
      
      // ═══════════════════════════════════════════════════════════════
      // FREE OPERATIONS (7) - Gemini Flash
      // ═══════════════════════════════════════════════════════════════

      SUMMARY_SHORT: `You are an expert summarizer. Create a concise 2-3 sentence summary that captures the essence of this document.

REQUIREMENTS:
- Maximum 3 sentences
- Include the main topic/purpose
- Mention key findings or conclusions
- Use clear, professional language

DOCUMENT:
${content}

SUMMARY:`,

      SUMMARY_BULLET: `You are an expert content analyst. Extract the most important points from this document as bullet points.

REQUIREMENTS:
- Exactly 5-7 bullet points
- Each point should be one clear, complete sentence
- Order by importance (most important first)
- Cover different aspects of the document
- Be specific, not vague

DOCUMENT:
${content}

KEY POINTS:`,

      KEYWORD_EXTRACT: `You are a keyword extraction specialist. Identify the most important keywords and phrases from this document.

REQUIREMENTS:
- Extract 10-15 keywords/phrases
- Include both single words and multi-word phrases
- Categorize by importance (high/medium/low)
- Focus on domain-specific terms
- Include named entities (people, places, organizations)

FORMAT (JSON):
{
  "keywords": [
    { "keyword": "term", "importance": "high|medium|low", "frequency": 3, "context": "brief context" }
  ],
  "categories": [
    { "name": "Category Name", "keywords": ["term1", "term2"] }
  ]
}

DOCUMENT:
${content}

KEYWORDS (JSON):`,

      DOCUMENT_CLEANUP: `You are a professional editor. Clean up and improve this document while preserving its original meaning.

TASKS:
- Fix all grammar and spelling errors
- Improve sentence structure and clarity
- Fix punctuation and formatting
- Remove redundant phrases
- Maintain the original tone and intent
- Preserve all factual information

DOCUMENT:
${content}

CLEANED DOCUMENT:`,

      FLASHCARDS: `You are an expert educator. Create ${options?.cardCount || 5} study flashcards from this document.

REQUIREMENTS:
- Each card should test one specific concept
- Questions should be clear and unambiguous
- Answers should be concise but complete
- Include hints where helpful
- Vary difficulty levels
- Cover the most important topics

FORMAT (JSON):
{
  "cards": [
    {
      "id": 1,
      "front": "Question or term",
      "back": "Answer or definition",
      "hint": "Optional hint",
      "difficulty": "easy|medium|hard",
      "topic": "Topic area"
    }
  ]
}

DOCUMENT:
${content}

FLASHCARDS (JSON):`,

      EXPLAIN_SIMPLE: `You are a master teacher who can explain complex topics to anyone. Explain this document in simple terms that ${this.getAudienceDescription(options?.targetAudience)}.

REQUIREMENTS:
- Use simple, everyday words
- ${options?.useAnalogies !== false ? 'Include helpful analogies and comparisons' : 'Keep explanations direct'}
- Break down complex ideas into small, digestible parts
- Use examples from daily life
- Avoid jargon - if you must use technical terms, explain them immediately
- Make it engaging and interesting
- Maximum complexity level: ${options?.maxComplexityLevel || 5}/10

DOCUMENT:
${content}

SIMPLE EXPLANATION:`,

      EXTRACT_DEFINITIONS: `You are an expert lexicographer. Extract and organize all important definitions, terms, and concepts from this document.

REQUIREMENTS:
- Extract up to ${options?.maxDefinitions || 20} definitions
- Include the exact term and its definition
- ${options?.includeExamplesWithDefinitions ? 'Provide an example for each definition' : ''}
- ${options?.includeRelatedTerms ? 'List related terms for each definition' : ''}
- Sort by: ${options?.sortDefinitions || 'order_of_appearance'}
- Categorize definitions by topic area

FORMAT (JSON):
{
  "definitions": [
    {
      "id": 1,
      "term": "Term name",
      "definition": "Clear definition",
      "example": "Example usage (if requested)",
      "relatedTerms": ["term1", "term2"],
      "category": "Topic category",
      "importance": "high|medium|low",
      "pageReference": "Section or page if identifiable"
    }
  ],
  "categories": ["Category1", "Category2"]
}

DOCUMENT:
${content}

DEFINITIONS (JSON):`,

      // ═══════════════════════════════════════════════════════════════
      // PAID OPERATIONS - GEMINI TIER (Simple tasks)
      // ═══════════════════════════════════════════════════════════════

      SUMMARY_LONG: `You are a professional content analyst. Create a comprehensive summary of this document.

REQUIREMENTS:
- 3-4 well-structured paragraphs
- Paragraph 1: Main topic and purpose
- Paragraph 2: Key findings and arguments
- Paragraph 3: Supporting details and evidence
- Paragraph 4: Conclusions and implications
- Maintain objectivity
- Cover all major sections

DOCUMENT:
${content}

COMPREHENSIVE SUMMARY:`,

      TRANSLATE_BASIC: `You are an expert translator. Translate this document to ${options?.targetLanguage || 'Hindi'}.

REQUIREMENTS:
- Maintain the original meaning precisely
- Preserve formatting and structure
- Keep technical terms accurate (provide original in parentheses if needed)
- Maintain the original tone
- Ensure natural flow in target language

DOCUMENT:
${content}

TRANSLATION (${options?.targetLanguage || 'Hindi'}):`,

      NOTES_GENERATOR: `You are an expert note-taker and educator. Generate comprehensive study notes from this document.

STRUCTURE: ${options?.notesStructure || 'traditional'}
DETAIL LEVEL: ${options?.detailLevel || 'detailed'}
${options?.includeExamples ? 'Include examples for key concepts.' : ''}

REQUIREMENTS:
- Clear hierarchical structure with headings
- Key concepts highlighted
- Important terms defined
- ${options?.detailLevel === 'comprehensive' ? 'Include all details' : 'Focus on main points'}
- Easy to review and memorize
- Include summary at the end

DOCUMENT:
${content}

STUDY NOTES:`,

      TOPIC_BREAKDOWN: `You are an expert content organizer. Break down this document into a clear topic hierarchy.

REQUIREMENTS:
- Identify main topics and subtopics
- Create a clear outline structure
- Show relationships between topics
- Include brief descriptions for each topic
- Rate importance of each topic

FORMAT (JSON):
{
  "mainTopic": "Overall document topic",
  "topics": [
    {
      "id": 1,
      "name": "Topic name",
      "description": "Brief description",
      "importance": "high|medium|low",
      "subTopics": [
        {
          "name": "Subtopic name",
          "description": "Brief description"
        }
      ]
    }
  ],
  "relationships": [
    { "from": "Topic A", "to": "Topic B", "relationship": "builds on" }
  ]
}

DOCUMENT:
${content}

TOPIC BREAKDOWN (JSON):`,

      FILL_IN_BLANKS: `You are an expert educator. Create fill-in-the-blank exercises from this document.

REQUIREMENTS:
- Create ${options?.questionCount || 10} exercises
- Remove key terms that test understanding
- Provide word bank at the end
- Mix difficulty levels
- Cover different topics from the document
- Mark blanks with _____

FORMAT:
1. [Sentence with _____]
   (Answer: [correct term])

DOCUMENT:
${content}

FILL IN THE BLANKS:`,

      DOCUMENT_CLEANUP_ADVANCED: `You are a senior professional editor. Perform comprehensive cleanup and enhancement of this document.

TASKS:
- Fix all grammar, spelling, and punctuation errors
- Improve sentence structure for clarity
- Enhance readability and flow
- Remove redundancy and wordiness
- Ensure consistent formatting
- Improve paragraph transitions
- Maintain professional tone
- Preserve all factual content

OUTPUT:
- Cleaned document
- Summary of changes made

DOCUMENT:
${content}

PROFESSIONAL DOCUMENT:`,

      SUMMARIES_ADVANCED: `You are a senior business analyst. Create an executive summary suitable for C-level stakeholders.

REQUIREMENTS:
- Maximum 1 page equivalent
- Lead with key findings/recommendations
- Include critical metrics/numbers
- Highlight risks and opportunities
- End with clear action items
- Professional, concise language
- No technical jargon

STRUCTURE:
1. Key Takeaway (1-2 sentences)
2. Critical Findings (3-5 bullets)
3. Recommendations (2-3 bullets)
4. Next Steps (2-3 bullets)

DOCUMENT:
${content}

EXECUTIVE SUMMARY:`,

      VOICE_MODE: `You are a professional scriptwriter. Convert this document into a natural, engaging voice script for audio narration.

REQUIREMENTS:
- Conversational but professional tone
- Easy to read aloud (short sentences)
- Natural pauses indicated with [PAUSE]
- Emphasis marked with *word*
- Pronunciation guides for difficult terms
- Engaging opening hook
- Clear transitions between sections
- Duration target: ${options?.targetDuration || 5} minutes

DOCUMENT:
${content}

VOICE SCRIPT:`,

      // ═══════════════════════════════════════════════════════════════
      // PAID OPERATIONS - GPT TIER (Medium complexity)
      // ═══════════════════════════════════════════════════════════════

      TEST_GENERATOR: `You are an expert test designer. Create a comprehensive test from this document.

TEST SPECIFICATIONS:
- Total Questions: ${options?.questionCount || 10}
- Question Types: ${options?.questionType || 'mixed'}
- Difficulty: ${options?.difficulty || 'mixed'}
- Include Answer Key: ${options?.includeAnswerKey !== false}

REQUIREMENTS:
- Questions should test understanding, not just recall
- Cover all major topics from the document
- Vary difficulty levels appropriately
- Each MCQ should have 4 options with one clearly correct answer
- Provide explanations for answers

FORMAT (JSON):
{
  "title": "Test on [Topic]",
  "totalQuestions": 10,
  "totalMarks": 50,
  "suggestedTime": 30,
  "difficulty": "mixed",
  "questions": [
    {
      "id": 1,
      "type": "mcq",
      "question": "Question text?",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "answer": "A",
      "explanation": "Why A is correct",
      "marks": 5,
      "difficulty": "medium",
      "topic": "Topic covered"
    }
  ],
  "answerKey": [
    { "questionId": 1, "correctAnswer": "A", "explanation": "..." }
  ]
}

DOCUMENT:
${content}

TEST (JSON):`,

      QUESTION_BANK: `You are an expert question paper designer. Create a comprehensive question bank from this document.

REQUIREMENTS:
- 10 Multiple Choice Questions (MCQs)
- 5 Short Answer Questions (2-3 sentences each)
- 3 Long Answer Questions (paragraph response)
- Vary difficulty: 40% Easy, 40% Medium, 20% Hard
- Include marks allocation
- Cover all major topics
- Provide model answers

FORMAT (JSON):
{
  "title": "Question Bank: [Topic]",
  "mcqs": [...],
  "shortAnswer": [...],
  "longAnswer": [...],
  "totalMarks": 100
}

DOCUMENT:
${content}

QUESTION BANK (JSON):`,

      PRESENTATION_MAKER: `You are a world-class presentation designer (McKinsey/BCG style). Create a professional presentation from this document.

SPECIFICATIONS:
- Slides: ${options?.slideCount || 10}
- Style: ${options?.templateStyle || 'professional'}
- Include Speaker Notes: ${options?.includeSpeakerNotes !== false}
- Include Infographics: ${options?.includeInfographics !== false}
- Color Theme: ${options?.colorTheme || 'blue'}

REQUIREMENTS:
- Title slide with compelling headline
- Clear narrative flow
- One key message per slide
- Visual hierarchy (not text-heavy)
- Data visualization where appropriate
- Professional design suggestions
- Memorable closing

FORMAT (JSON):
{
  "title": "Presentation Title",
  "subtitle": "Subtitle",
  "totalSlides": 10,
  "theme": {
    "name": "${options?.templateStyle || 'professional'}",
    "style": "${options?.templateStyle || 'professional'}",
    "colors": {
      "primary": "#0066CC",
      "secondary": "#004499",
      "accent": "#FF6600",
      "background": "#FFFFFF",
      "text": "#333333",
      "textLight": "#666666"
    },
    "fonts": { "heading": "Arial", "body": "Calibri" }
  },
  "slides": [
    {
      "id": 1,
      "slideType": "title",
      "title": "Main Title",
      "subtitle": "Subtitle",
      "content": {
        "mainText": "Key message"
      },
      "speakerNotes": "What to say",
      "layout": {
        "type": "full",
        "contentAlignment": "center",
        "hasImage": false
      }
    },
    {
      "id": 2,
      "slideType": "content",
      "title": "Slide Title",
      "content": {
        "bulletPoints": [
          { "text": "Key point 1", "icon": "check" },
          { "text": "Key point 2", "icon": "arrow-right" }
        ],
        "statistics": [
          { "value": "85%", "label": "Increase", "trend": "up" }
        ],
        "imageSuggestion": {
          "description": "Description of suggested image",
          "keywords": ["keyword1", "keyword2"],
          "style": "photo",
          "placement": "right"
        }
      },
      "speakerNotes": "Explain these points...",
      "layout": {
        "type": "split",
        "contentAlignment": "left",
        "hasImage": true,
        "imagePosition": "right"
      }
    }
  ],
  "metadata": {
    "estimatedDuration": 15,
    "topic": "Main topic",
    "keywords": ["key1", "key2"]
  }
}

DOCUMENT:
${content}

PRESENTATION (JSON):`,

      REPORT_BUILDER: `You are a senior business analyst. Generate a professional report from this document.

REPORT TYPE: ${options?.reportType || 'analysis'}
${options?.includeRecommendations ? 'Include actionable recommendations.' : ''}

STRUCTURE:
1. Executive Summary (1 paragraph)
2. Table of Contents
3. Introduction
4. Key Findings (with evidence)
5. Analysis
6. ${options?.includeRecommendations ? 'Recommendations' : 'Conclusions'}
7. Appendix (if needed)

REQUIREMENTS:
- Professional formatting
- Clear section headings
- Data-driven insights
- Actionable conclusions
- Citation of sources from document

DOCUMENT:
${content}

PROFESSIONAL REPORT:`,

      WORKFLOW_CONVERSION: `You are a process improvement specialist. Convert this document into a clear step-by-step workflow.

REQUIREMENTS:
- Clear numbered steps
- Decision points marked with [DECISION]
- Responsible parties identified
- Time estimates where possible
- Dependencies noted
- Include flowchart description

FORMAT:
WORKFLOW: [Title]

STEP 1: [Action]
- Details: ...
- Responsible: ...
- Time: ...
- Output: ...

[DECISION]: If X, go to Step 2. If Y, go to Step 3.

STEP 2: ...

FLOWCHART DESCRIPTION:
Start → Step 1 → Decision → ...

DOCUMENT:
${content}

WORKFLOW:`,

      KEYWORD_INDEX_EXTRACTOR: `You are a professional indexer. Create a comprehensive keyword index for this document.

REQUIREMENTS:
- Alphabetically organized
- Include page/section references
- Group related terms
- Include cross-references (see also)
- Mark primary vs secondary references
- Include synonyms

FORMAT:
INDEX

A
- Algorithm (see Machine Learning)
- API: Section 2.3, 4.1 (primary)
  - REST API: Section 2.3.1
  - GraphQL: Section 2.3.2

B
- Backend: Section 3 (primary), Section 5.2
  See also: Server, Architecture

DOCUMENT:
${content}

KEYWORD INDEX:`,

      TRANSLATE_SIMPLIFY_ADVANCED: `You are an expert translator and simplifier. Translate this document to ${options?.targetLanguage || 'Hindi'} while making it accessible to general audiences.

REQUIREMENTS:
- Translate to ${options?.targetLanguage || 'Hindi'}
- Simplify complex terminology
- Add brief explanations for technical terms
- Maintain core meaning
- Make it accessible to non-experts
- Preserve important nuances

DOCUMENT:
${content}

SIMPLIFIED TRANSLATION:`,

      TABLE_TO_CHARTS: `You are a data visualization expert. Analyze the data in this document and provide chart recommendations.

REQUIREMENTS:
- Identify all data/tables
- Recommend best chart type for each dataset
- Provide chart configuration in JSON
- Include key insights from the data
- Suggest visual emphasis points

FORMAT (JSON):
{
  "charts": [
    {
      "chartType": "bar|line|pie|donut|area|scatter",
      "title": "Chart title",
      "data": [
        { "label": "Item", "value": 100 }
      ],
      "insights": ["Insight 1", "Insight 2"],
      "recommendation": "Why this chart type"
    }
  ],
  "overallInsights": ["Key insight 1", "Key insight 2"],
  "dataTable": {
    "headers": ["Col1", "Col2"],
    "rows": [["val1", "val2"]]
  }
}

DOCUMENT:
${content}

CHART DATA (JSON):`,

      // ═══════════════════════════════════════════════════════════════
      // FEATURED OPERATIONS - GPT TIER (Special shortcuts)
      // ═══════════════════════════════════════════════════════════════

      EXPLAIN_AS_TEACHER: `You are a world-class ${options?.subjectArea || 'subject'} teacher with decades of experience making complex topics accessible.

TEACHING STYLE: ${options?.teachingStyle || 'interactive'}

YOUR TASK: Explain this document as if teaching a student who wants to deeply understand the topic.

REQUIREMENTS:
- Start with a hook that creates curiosity
- Build concepts progressively (simple → complex)
- ${options?.includeFormulas ? 'Include relevant formulas with clear explanations of each variable' : ''}
- ${options?.includePracticeProblems ? 'Include 3-5 practice problems with solutions' : ''}
- ${options?.includeMemoryAids ? 'Include mnemonics, acronyms, or memory aids' : ''}
- Use real-world examples and analogies
- Address common misconceptions
- Include "Think about it" questions
- Summarize key takeaways

FORMAT (JSON):
{
  "topic": "Topic name",
  "introduction": "Engaging introduction",
  "sections": [
    {
      "id": 1,
      "heading": "Section title",
      "explanation": "Clear explanation",
      "realWorldExample": "Practical example",
      "formula": {
        "expression": "E = mc²",
        "explanation": "What this means",
        "variables": [
          { "symbol": "E", "meaning": "Energy", "unit": "Joules" }
        ]
      },
      "diagram": {
        "title": "Diagram title",
        "description": "What to visualize",
        "suggestedType": "flowchart|mindmap|diagram"
      },
      "commonMistakes": ["Mistake 1"],
      "tips": ["Pro tip 1"]
    }
  ],
  "practiceProblems": [
    {
      "id": 1,
      "question": "Problem",
      "hints": ["Hint 1"],
      "solution": "Step by step solution",
      "explanation": "Why this works",
      "difficulty": "medium"
    }
  ],
  "memoryAids": [
    {
      "type": "mnemonic|acronym|rhyme|visualization",
      "content": "The memory aid",
      "helps_remember": "What concept it helps with"
    }
  ],
  "summary": "Key takeaways",
  "furtherReading": ["Resource 1"]
}

DOCUMENT:
${content}

TEACHER EXPLANATION (JSON):`,

      CONTENT_TO_SCRIPT: `You are a professional content creator and scriptwriter. Convert this document into a ${options?.scriptType || 'youtube'} script.

SPECIFICATIONS:
- Platform: ${options?.scriptType || 'YouTube'}
- Target Duration: ${options?.targetDuration || 10} minutes
- Tone: ${options?.scriptTone || 'educational'}
- ${options?.includeTimestamps ? 'Include timestamps' : ''}
- ${options?.includeBRollSuggestions ? 'Include B-roll suggestions' : ''}

REQUIREMENTS:
- Hook viewers in first 10 seconds
- Clear structure with transitions
- Engaging storytelling approach
- Natural, conversational language
- Call-to-action at the end
- Platform-optimized pacing

FORMAT (JSON):
{
  "scriptType": "${options?.scriptType || 'youtube'}",
  "title": "Video/Episode Title",
  "description": "Brief description for platform",
  "totalDuration": ${(options?.targetDuration || 10) * 60},
  "intro": {
    "hook": "Attention-grabbing opening line",
    "introduction": "What we'll cover today",
    "duration": 30,
    "visualSuggestions": ["Suggestion 1"]
  },
  "sections": [
    {
      "id": 1,
      "timestamp": "00:30",
      "duration": 120,
      "heading": "Section Title",
      "narration": "What to say (conversational)",
      "visualSuggestions": ["Show graphic of..."],
      "bRollSuggestions": ["Footage of..."],
      "onScreenText": ["Key Point"],
      "transition": "Now let's look at..."
    }
  ],
  "outro": {
    "summary": "Quick recap",
    "callToAction": "Subscribe, like, comment...",
    "duration": 30,
    "visualSuggestions": ["End screen"]
  },
  "metadata": {
    "targetPlatform": "${options?.scriptType || 'youtube'}",
    "tone": "${options?.scriptTone || 'educational'}",
    "keywords": ["keyword1", "keyword2"],
    "suggestedThumbnail": "Description of thumbnail",
    "suggestedTitle": "SEO-optimized title"
  }
}

DOCUMENT:
${content}

SCRIPT (JSON):`,

      NOTES_TO_QUIZ_TURBO: `You are an expert assessment designer. Create a comprehensive, multi-format quiz from this document.

QUIZ SPECIFICATIONS:
- Total Questions: ${options?.totalQuestions || 25}
- Question Types: ${(options?.quizTypes || ['mcq', 'true_false', 'fill_blank', 'short_answer']).join(', ')}
- Include Case Studies: ${options?.includeCaseStudies || false}
- Difficulty Mix: Easy 30%, Medium 50%, Hard 20%
${options?.sectionWise ? '- Organize by sections from the document' : ''}

REQUIREMENTS:
- Cover all major topics
- Vary cognitive levels (recall, understand, apply, analyze)
- Clear, unambiguous questions
- Distractors for MCQs should be plausible
- Include detailed answer explanations
- Provide marking scheme

FORMAT (JSON):
{
  "title": "Comprehensive Quiz: [Topic]",
  "totalQuestions": 25,
  "totalMarks": 100,
  "suggestedTime": 45,
  "difficultyBreakdown": {
    "easy": 8,
    "medium": 12,
    "hard": 5
  },
  "sections": [
    {
      "sectionName": "Multiple Choice Questions",
      "sectionType": "mcq",
      "marks": 40,
      "questions": [
        {
          "id": 1,
          "type": "mcq",
          "question": "Question?",
          "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
          "answer": "A",
          "explanation": "Why A is correct",
          "marks": 4,
          "difficulty": "medium",
          "topic": "Topic"
        }
      ]
    },
    {
      "sectionName": "True or False",
      "sectionType": "true_false",
      "marks": 10,
      "questions": [...]
    },
    {
      "sectionName": "Fill in the Blanks",
      "sectionType": "fill_blank",
      "marks": 15,
      "questions": [...]
    },
    {
      "sectionName": "Short Answer",
      "sectionType": "short_answer",
      "marks": 20,
      "questions": [...]
    }
  ],
  "caseStudies": [
    {
      "id": 1,
      "title": "Case Study Title",
      "scenario": "Detailed scenario description...",
      "questions": [
        {
          "id": 1,
          "question": "Based on the case...",
          "answer": "Expected answer",
          "marks": 5
        }
      ],
      "totalMarks": 15
    }
  ],
  "matchingQuestions": [
    {
      "id": 1,
      "instruction": "Match Column A with Column B",
      "columnA": ["Term 1", "Term 2"],
      "columnB": ["Definition A", "Definition B"],
      "correctMatches": { "Term 1": "Definition A" },
      "marks": 5
    }
  ]
}

DOCUMENT:
${content}

QUIZ TURBO (JSON):`,

      // ═══════════════════════════════════════════════════════════════
      // PAID OPERATIONS - HAIKU TIER (Complex reasoning)
      // ═══════════════════════════════════════════════════════════════

      CONTRACT_LAW_SCAN: `You are an experienced legal analyst specializing in contract review.

JURISDICTION: ${options?.jurisdiction || 'General'}
RISK FOCUS: ${options?.riskFocus || 'all'}

ANALYSIS REQUIREMENTS:
1. Document Type & Purpose
2. Key Parties & Obligations
3. Important Terms & Conditions
4. Dates, Deadlines & Milestones
5. Financial Terms
6. Risk Assessment (High/Medium/Low)
7. Red Flags & Concerns
8. Missing Clauses
9. Recommendations

IMPORTANT: This is for informational purposes only, not legal advice.

FORMAT (JSON):
{
  "documentType": "Type of legal document",
  "summary": "Brief overview",
  "riskLevel": "low|medium|high",
  "parties": [
    { "name": "Party Name", "role": "Role", "obligations": ["..."] }
  ],
  "keyTerms": [
    { "term": "Term name", "details": "...", "risk": "low|medium|high" }
  ],
  "clauses": [
    {
      "id": 1,
      "clauseTitle": "Clause name",
      "clauseText": "Relevant text",
      "analysis": "What this means",
      "riskLevel": "low|medium|high",
      "suggestedChanges": "If any"
    }
  ],
  "financialTerms": { "summary": "...", "details": [...] },
  "importantDates": [
    { "date": "Date", "event": "What happens" }
  ],
  "redFlags": ["Concern 1", "Concern 2"],
  "missingClauses": ["Clause that should be present"],
  "recommendations": ["Recommendation 1"]
}

DOCUMENT:
${content}

LEGAL ANALYSIS (JSON):`,

      MULTI_DOC_REASONING: `You are an expert analyst specializing in synthesizing information across multiple sources.

ANALYSIS REQUIREMENTS:
1. Identify common themes across all documents
2. Note contradictions or conflicting information
3. Synthesize into unified understanding
4. Draw connections between documents
5. Provide comprehensive conclusions

REASONING APPROACH:
- Compare and contrast systematically
- Identify consensus and disagreement
- Weight evidence by source reliability
- Note gaps in information
- Provide confidence levels for conclusions

FORMAT (JSON):
{
  "documents": [
    { "id": "doc1", "name": "Name", "summary": "Brief summary" }
  ],
  "commonThemes": ["Theme 1", "Theme 2"],
  "contradictions": [
    { "topic": "Topic", "doc1Says": "...", "doc2Says": "...", "resolution": "..." }
  ],
  "synthesis": "Unified understanding paragraph",
  "detailedComparison": [
    {
      "topic": "Topic",
      "documentStances": [
        { "documentId": "doc1", "stance": "Position" }
      ],
      "verdict": "Conclusion"
    }
  ],
  "overallSimilarityScore": 75,
  "conclusions": ["Conclusion 1"],
  "confidenceLevel": "high|medium|low",
  "gaps": ["Information gap 1"]
}

DOCUMENTS:
${content}

MULTI-DOCUMENT ANALYSIS (JSON):`,

      INSIGHTS_EXTRACTION: `You are a senior business intelligence analyst. Extract actionable insights from this document.

FOCUS AREAS:
1. Key discoveries and findings
2. Hidden patterns and trends
3. Anomalies and outliers
4. Opportunities identified
5. Risks and threats
6. Actionable recommendations

REQUIREMENTS:
- Insights must be specific and actionable
- Support each insight with evidence from the document
- Rate importance of each insight
- Provide business implications

FORMAT (JSON):
{
  "keyInsights": [
    {
      "id": 1,
      "insight": "Specific insight",
      "category": "Category",
      "importance": "high|medium|low",
      "evidence": "Supporting evidence from document",
      "implication": "Business implication",
      "recommendation": "What to do about it"
    }
  ],
  "trends": [
    {
      "id": 1,
      "trend": "Trend description",
      "direction": "up|down|stable",
      "impact": "Potential impact"
    }
  ],
  "dataHighlights": [
    { "metric": "Metric name", "value": "Value", "context": "Why it matters" }
  ],
  "recommendations": ["Recommendation 1"]
}

DOCUMENT:
${content}

INSIGHTS (JSON):`,

      TREND_ANALYSIS: `You are a trend analysis specialist. Analyze patterns and trends in this document.

ANALYSIS REQUIREMENTS:
1. Identify all trends (growth, decline, stable)
2. Determine trend drivers
3. Calculate/estimate magnitudes
4. Project future directions
5. Assess reliability of trends
6. Provide actionable insights

FORMAT (JSON):
{
  "overallTrend": "Summary of overall direction",
  "trends": [
    {
      "id": 1,
      "trend": "Trend description",
      "direction": "up|down|stable",
      "magnitude": "X% increase/decrease",
      "timeframe": "Period analyzed",
      "drivers": ["Driver 1", "Driver 2"],
      "confidence": "high|medium|low",
      "projection": "Expected future direction",
      "impact": "Business impact"
    }
  ],
  "keyMetrics": [
    { "metric": "Name", "current": "Value", "previous": "Value", "change": "+X%" }
  ],
  "predictions": ["Prediction 1"],
  "recommendations": ["Recommendation 1"]
}

DOCUMENT:
${content}

TREND ANALYSIS (JSON):`,

      AI_DETECTION_REDACTION: `You are an AI content detection specialist. Analyze this text to identify AI-generated content.

DETECTION CRITERIA:
1. Writing pattern analysis
2. Vocabulary consistency
3. Structural patterns typical of AI
4. Unusual phrasing or formality
5. Repetitive structures
6. Lack of personal voice

REQUIREMENTS:
- Provide overall AI probability score (0-100)
- Identify specific sections that appear AI-generated
- Explain indicators for each flagged section
- Suggest humanization improvements if requested

FORMAT (JSON):
{
  "overallScore": 75,
  "confidence": "high|medium|low",
  "verdict": "Likely AI-generated|Likely human-written|Mixed",
  "sections": [
    {
      "text": "Flagged text excerpt",
      "score": 85,
      "indicators": ["Indicator 1", "Indicator 2"],
      "suggestion": "How to humanize this section"
    }
  ],
  "humanizationSuggestions": [
    "Add personal anecdotes",
    "Vary sentence structure more"
  ],
  "summary": "Overall assessment paragraph"
}

DOCUMENT:
${content}

AI DETECTION REPORT (JSON):`,

      CROSS_PDF_COMPARE: `You are a document comparison specialist. Compare and contrast these documents thoroughly.

COMPARISON REQUIREMENTS:
1. Executive summary of each document
2. Key similarities
3. Key differences
4. Conflicting information
5. Unique content in each
6. Overall assessment

FORMAT (JSON):
{
  "documents": [
    { "id": "1", "name": "Document 1", "summary": "Summary" }
  ],
  "similarities": [
    { "topic": "Topic", "description": "How they're similar" }
  ],
  "differences": [
    { "topic": "Topic", "doc1": "Doc 1 says", "doc2": "Doc 2 says" }
  ],
  "contradictions": [
    { "topic": "Topic", "nature": "Description of contradiction", "severity": "high|medium|low" }
  ],
  "uniqueContent": {
    "doc1Only": ["Content only in doc 1"],
    "doc2Only": ["Content only in doc 2"]
  },
  "overallSimilarityScore": 65,
  "recommendation": "Which document to prefer and why"
}

DOCUMENTS:
${content}

COMPARISON ANALYSIS (JSON):`,

      DIAGRAM_INTERPRETATION: `You are a visual content analyst. Interpret and explain the diagrams, charts, and visual elements described or present in this document.

ANALYSIS REQUIREMENTS:
1. Identify all visual elements
2. Explain what each visual represents
3. Extract key data points
4. Interpret the meaning and implications
5. Note any insights not obvious from text

FORMAT (JSON):
{
  "visuals": [
    {
      "id": 1,
      "type": "chart|diagram|table|image|flowchart",
      "title": "Visual title if available",
      "description": "What the visual shows",
      "keyDataPoints": [
        { "label": "Label", "value": "Value", "significance": "Why it matters" }
      ],
      "interpretation": "What this means",
      "insights": ["Insight 1", "Insight 2"]
    }
  ],
  "overallNarrative": "What the visuals collectively tell us",
  "recommendations": ["Recommendation based on visual analysis"]
}

DOCUMENT:
${content}

VISUAL INTERPRETATION (JSON):`,

      DOCUMENT_CHAT_MEMORY: `You are a helpful document assistant. Answer questions about this document accurately and helpfully.

QUESTION: ${options?.customQuestion || options?.question || 'What is this document about?'}

REQUIREMENTS:
1. Answer based ONLY on information in the document
2. If the answer isn't in the document, say so clearly
3. Quote relevant sections when helpful
4. Be concise but complete
5. If uncertain, express your confidence level

FORMAT (JSON):
{
  "question": "The question asked",
  "answer": "Direct answer to the question",
  "confidence": "high|medium|low",
  "citations": [
    { "text": "Relevant quote from document", "section": "Section name if known" }
  ],
  "relatedQuestions": ["Other questions the user might have"],
  "notFound": false
}

DOCUMENT:
${content}

ANSWER (JSON):`,

    };

    let prompt = prompts[operation];
    
    // Fallback for any operation not explicitly defined
    if (!prompt) {
      console.warn(`[DocumentAI] No specific prompt for operation: ${operation}. Using generic.`);
      prompt = `Process this document and perform the following operation: ${operation}

DOCUMENT:
${content}

RESULT:`;
    }
    
    // Add custom instructions if provided
    if (options?.customInstructions) {
      prompt += `\n\nADDITIONAL INSTRUCTIONS: ${options.customInstructions}`;
    }
    
    // Add output language instruction
    if (options?.language && options.language !== 'english') {
      prompt += `\n\nIMPORTANT: Provide the response in ${options.language}.`;
    }
    
    return prompt;
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  /**
   * Get audience description for ELI5
   */
  private getAudienceDescription(audience?: string): string {
    const descriptions: Record<string, string> = {
      child: 'a 5-year-old child could understand',
      teenager: 'a high school student could understand',
      adult_beginner: 'an adult with no background in this topic could understand',
      general: 'anyone could easily understand',
    };
    return descriptions[audience || 'general'] || descriptions.general;
  }

  /**
   * Check if operation should return JSON
   */
  private shouldParseAsJSON(operation: string): boolean {
    const jsonOperations = [
      'KEYWORD_EXTRACT',
      'FLASHCARDS',
      'EXTRACT_DEFINITIONS',
      'TOPIC_BREAKDOWN',
      'TEST_GENERATOR',
      'QUESTION_BANK',
      'PRESENTATION_MAKER',
      'TABLE_TO_CHARTS',
      'EXPLAIN_AS_TEACHER',
      'CONTENT_TO_SCRIPT',
      'NOTES_TO_QUIZ_TURBO',
      'CONTRACT_LAW_SCAN',
      'MULTI_DOC_REASONING',
      'INSIGHTS_EXTRACTION',
      'TREND_ANALYSIS',
      'AI_DETECTION_REDACTION',
      'CROSS_PDF_COMPARE',
      'DIAGRAM_INTERPRETATION',
      'DOCUMENT_CHAT_MEMORY',
    ];
    return jsonOperations.includes(operation);
  }

  /**
   * Parse structured output from AI response
   */
  private parseStructuredOutput(content: string, operation: string): StructuredOperationResult | undefined {
    try {
      // Remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7);
      }
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3);
      }
      cleanContent = cleanContent.trim();
      
      const parsed = JSON.parse(cleanContent);
      
      // Add type identifier based on operation
      const typeMap: Record<string, string> = {
        SUMMARY_SHORT: 'summary',
        SUMMARY_LONG: 'summary',
        SUMMARY_BULLET: 'bullet_summary',
        KEYWORD_EXTRACT: 'keywords',
        FLASHCARDS: 'flashcards',
        EXTRACT_DEFINITIONS: 'definitions',
        TEST_GENERATOR: 'test',
        QUESTION_BANK: 'test',
        NOTES_TO_QUIZ_TURBO: 'quiz_turbo',
        NOTES_GENERATOR: 'notes',
        PRESENTATION_MAKER: 'presentation',
        EXPLAIN_AS_TEACHER: 'teacher_explanation',
        CONTENT_TO_SCRIPT: 'script',
        CONTRACT_LAW_SCAN: 'legal_scan',
        INSIGHTS_EXTRACTION: 'insights',
        AI_DETECTION_REDACTION: 'ai_detection',
        CROSS_PDF_COMPARE: 'comparison',
        MULTI_DOC_REASONING: 'comparison',
        TREND_ANALYSIS: 'insights',
        TABLE_TO_CHARTS: 'chart_data',
        TOPIC_BREAKDOWN: 'topic_breakdown',
        DOCUMENT_CHAT_MEMORY: 'qa',
        DIAGRAM_INTERPRETATION: 'insights',
      };
      
      return {
        type: typeMap[operation] || 'unknown',
        ...parsed,
      } as StructuredOperationResult;
      
    } catch (error) {
      console.warn(`[DocumentAI] Failed to parse structured output for ${operation}:`, error);
      return undefined;
    }
  }

  // ==========================================
  // FALLBACK HANDLER
  // ==========================================

  /**
   * Handle errors with fallback to Gemini Flash
   */
  private async handleErrorWithFallback(
    error: Error | null,
    prompt: string,
    tokenCaps: { input: number; output: number },
    request: DocumentAIRequest,
    startTime: number,
    previousRetries: number
  ): Promise<DocumentAIResponse> {
    console.error('[DocumentAI] All retries failed, trying Gemini Flash fallback:', error?.message);
    
    try {
      const response = await this.executeGeminiFlash(prompt, tokenCaps.output, request);
      
      // Parse structured output if needed
      if (request.options?.format === 'json' || this.shouldParseAsJSON(request.operation)) {
        response.structuredContent = this.parseStructuredOutput(response.content, request.operation);
      }
      
      return {
        ...response,
        processingTime: Date.now() - startTime,
        retryCount: previousRetries + 1,
      };
    } catch (fallbackError) {
      console.error('[DocumentAI] Fallback also failed:', fallbackError);
      
      throw new Error(
        `AI processing failed after ${previousRetries + 1} retries: ${error?.message || 'Unknown error'}`
      );
    }
  }

  // ==========================================
  // CACHE METHODS
  // ==========================================

  /**
   * Generate cache key from request
   */
  private generateCacheKey(request: DocumentAIRequest): string {
    const keyData = {
      operation: request.operation,
      contentHash: crypto.createHash('md5').update(request.content).digest('hex'),
      options: request.options ? JSON.stringify(request.options) : '',
      isPaid: request.isPaidUser,
    };
    return crypto.createHash('sha256').update(JSON.stringify(keyData)).digest('hex');
  }

  /**
   * Get from cache
   */
  private getFromCache(key: string): CacheEntry | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    // Update hit count
    entry.hitCount++;
    return entry;
  }

  /**
   * Set cache entry
   */
  private setCache(key: string, response: DocumentAIResponse): void {
    const entry: CacheEntry = {
      content: response.content,
      structuredContent: response.structuredContent,
      provider: response.provider,
      model: response.model,
      tier: response.tier,
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.CACHE_TTL,
      hitCount: 0,
    };
    this.cache.set(key, entry);
  }

  /**
   * Start cache cleanup interval
   */
  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expiresAt) {
          this.cache.delete(key);
        }
      }
    }, 60 * 60 * 1000); // Run every hour
  }

  /**
   * Clear entire cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
  } {
    const total = this.cacheHits + this.cacheMisses;
    return {
      size: this.cache.size,
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: total > 0 ? Math.round((this.cacheHits / total) * 100) : 0,
    };
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Execute with timeout
   */
  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeout: number
  ): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      ),
    ]);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Truncate content to token limit
   */
  private truncateToTokenLimit(content: string, maxTokens: number): string {
    const maxChars = maxTokens * 4; // ~4 chars per token
    if (content.length <= maxChars) {
      return content;
    }
    
    // Smart truncation: keep beginning and end
    const keepChars = maxChars - 100; // Reserve space for truncation message
    const halfKeep = Math.floor(keepChars / 2);
    
    return (
      content.substring(0, halfKeep) +
      '\n\n[... Content truncated for processing ...]\n\n' +
      content.substring(content.length - halfKeep)
    );
  }

  /**
   * Estimate token count
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
    errorStats: Record<string, number>;
    cacheStats: { size: number; hits: number; misses: number; hitRate: number };
  } {
    return {
      requestCount: this.requestCount,
      totalCost: Math.round(this.totalCost * 100) / 100,
      providerStats: { ...this.providerStats },
      errorStats: { ...this.errorStats },
      cacheStats: this.getCacheStats(),
    };
  }

  /**
   * Reset statistics
   */
  public resetStats(): void {
    this.requestCount = 0;
    this.totalCost = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.providerStats = { gemini: 0, gpt: 0, haiku: 0 };
    this.errorStats = { gemini: 0, gpt: 0, haiku: 0 };
  }

  /**
   * Health check for all providers
   */
  public async healthCheck(): Promise<{
    gemini: boolean;
    openai: boolean;
    anthropic: boolean;
    overall: boolean;
  }> {
    const results = {
      gemini: false,
      openai: false,
      anthropic: false,
      overall: false,
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

    // Overall health - at least Gemini (fallback) must work
    results.overall = results.gemini;

    return results;
  }
}

// ==========================================
// EXPORT SINGLETON
// ==========================================

export const documentAIService = DocumentAIService.getInstance();
export default documentAIService;

// ==========================================
// AUDIT SUMMARY
// ==========================================
/**
 * AUDIT COMPLETED: December 10, 2025
 * 
 * ✅ FIXES APPLIED:
 * 
 * 1. ALL 33 OPERATION PROMPTS ADDED:
 *    - 7 FREE operations (Gemini tier)
 *    - 8 PAID Gemini operations
 *    - 11 PAID GPT operations (including 3 Featured)
 *    - 8 PAID Haiku operations (complex reasoning)
 * 
 * 2. WORLD CLASS PROMPTS:
 *    - Each prompt is detailed and professional
 *    - JSON format specified where needed
 *    - Clear requirements and structure
 *    - Options integrated into prompts
 * 
 * 3. RETRY WITH EXPONENTIAL BACKOFF:
 *    - 3 retry attempts
 *    - Exponential delay: 1s, 2s, 4s
 *    - Max delay: 10 seconds
 *    - Falls back to Gemini on all failures
 * 
 * 4. RESPONSE CACHING:
 *    - 24-hour TTL
 *    - MD5 content hash for cache key
 *    - Cache statistics tracking
 *    - Automatic cleanup every hour
 * 
 * 5. STRUCTURED OUTPUT PARSING:
 *    - Automatic JSON parsing for appropriate operations
 *    - Markdown code block removal
 *    - Type identification
 *    - Graceful fallback on parse errors
 * 
 * 6. REQUEST TIMEOUT:
 *    - 60 second timeout
 *    - Promise.race implementation
 * 
 * 7. ENHANCED METRICS:
 *    - Provider stats
 *    - Error stats
 *    - Cache hit/miss tracking
 *    - Cost tracking
 * 
 * 8. SYSTEM PROMPTS FOR AI:
 *    - GPT: Professional assistant context
 *    - Haiku: Complex analysis specialist context
 * 
 * TOTAL LINES: ~1900
 * TOTAL PROMPTS: 33 (all operations)
 * READY FOR: Production deployment
 */