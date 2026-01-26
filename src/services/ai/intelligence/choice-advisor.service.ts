/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA CHOICE ADVISOR SERVICE - DYNAMIC DECISION HELPER
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Punjab, India
 * Updated: January 2026
 * 
 * Purpose:
 * - Help users make decisions by analyzing options dynamically
 * - 100% LLM-powered with personalized recommendations
 * - Uses LLMService for smart routing (no direct Anthropic calls)
 * 
 * Fixes Applied:
 * - ✅ Removed direct Anthropic SDK dependency
 * - ✅ Using LLMService for all LLM calls (smart routing enabled)
 * - ✅ Fixed getRelevantMemories → searchMessages
 * - ✅ Using StoredMessage type from intelligence.types
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { MemoryService } from './memory.service';
import {
  ChoiceAnalysis,
  ChoiceOption,
  ChoiceRecommendation,
  ChoiceContext,
  OptionComparison,
  DecisionFactors,
  LLMService,
  StoredMessage,
} from './intelligence.types';
import { PlanType } from '../../../constants/plans';

/**
 * Choice Advisor Service
 * Helps users make decisions by analyzing options dynamically
 * 100% LLM-powered with personalized recommendations
 */
export class ChoiceAdvisorService {
  private llmService: LLMService;
  private memoryService: MemoryService;

  constructor(llmService: LLMService, memoryService: MemoryService) {
    this.llmService = llmService;
    this.memoryService = memoryService;
    console.log('[ChoiceAdvisorService] ✅ Initialized - LLM-powered decision advisor');
  }

  /**
   * Analyze a decision query and provide recommendations
   */
  async analyzeChoice(
    userId: string,
    query: string,
    planType: PlanType = PlanType.PLUS,
    context?: ChoiceContext
  ): Promise<ChoiceAnalysis> {
    try {
      // Get user memory for personalization
      const userMemory = await this.getUserMemory(userId, query, planType);

      // Extract options from query
      const options = await this.extractOptions(query, context);

      // Analyze each option
      const optionAnalyses = await Promise.all(
        options.map(option => this.analyzeOption(option, query, userMemory))
      );

      // Compare options
      const comparison = await this.compareOptions(
        optionAnalyses,
        query,
        userMemory
      );

      // Generate recommendation
      const recommendation = await this.generateRecommendation(
        optionAnalyses,
        comparison,
        query,
        userMemory,
        context
      );

      // Calculate decision factors
      const factors = await this.analyzeDecisionFactors(
        query,
        optionAnalyses,
        userMemory
      );

      return {
        query,
        options: optionAnalyses,
        comparison,
        recommendation,
        factors,
        timestamp: new Date(),
        context: context || {}
      };
    } catch (error) {
      console.error('[ChoiceAdvisorService] ❌ Error analyzing choice:', error);
      throw new Error('Failed to analyze choice');
    }
  }

  /**
   * Get user memory for personalization
   */
  private async getUserMemory(
    userId: string,
    query: string,
    planType: PlanType
  ): Promise<StoredMessage[]> {
    try {
      return await this.memoryService.searchMessages(userId, planType, query, 5);
    } catch (error) {
      console.warn('[ChoiceAdvisorService] ⚠️ Could not fetch user memory:', error);
      return [];
    }
  }

  /**
   * Build memory context string from stored messages
   */
  private buildMemoryContext(userMemory: StoredMessage[]): string {
    if (userMemory.length === 0) {
      return 'No previous context available.';
    }
    return `User background:\n${userMemory.map(m => `- ${m.content}`).join('\n')}`;
  }

  /**
   * Extract options from user query using LLM
   */
  private async extractOptions(
    query: string,
    context?: ChoiceContext
  ): Promise<ChoiceOption[]> {
    const prompt = `Extract decision options from this query. If options are explicitly mentioned, use them. If not, infer reasonable options.

Query: "${query}"

${context?.explicitOptions ? `Explicit options provided: ${JSON.stringify(context.explicitOptions)}` : ''}
${context?.constraints ? `Constraints: ${JSON.stringify(context.constraints)}` : ''}

Return a JSON array of options with this structure:
[
  {
    "id": "option_1",
    "title": "Brief title",
    "description": "What this option means"
  }
]

If options are not clear, infer 2-4 reasonable alternatives based on the query context.

IMPORTANT: Return ONLY the JSON array, no explanations or markdown.`;

    try {
      const responseText = await this.llmService.generateCompletion(prompt);

      // Extract JSON from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.warn('[ChoiceAdvisorService] ⚠️ Could not extract options JSON, using defaults');
        return this.getDefaultOptions(query);
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('[ChoiceAdvisorService] ❌ Error extracting options:', error);
      return this.getDefaultOptions(query);
    }
  }

  /**
   * Get default options when extraction fails
   */
  private getDefaultOptions(query: string): ChoiceOption[] {
    return [
      {
        id: 'option_1',
        title: 'Option A',
        description: 'First alternative based on the query'
      },
      {
        id: 'option_2',
        title: 'Option B',
        description: 'Second alternative based on the query'
      }
    ];
  }

  /**
   * Analyze a single option dynamically
   */
  private async analyzeOption(
    option: ChoiceOption,
    originalQuery: string,
    userMemory: StoredMessage[]
  ): Promise<ChoiceOption> {
    const memoryContext = this.buildMemoryContext(userMemory);

    const prompt = `Analyze this decision option thoroughly and objectively.

Original question: "${originalQuery}"
Option: ${option.title}
Description: ${option.description}

${memoryContext}

Provide a comprehensive analysis in JSON format:
{
  "pros": ["list of advantages - be specific and practical"],
  "cons": ["list of disadvantages - be realistic and thorough"],
  "risks": ["potential risks or challenges"],
  "requirements": ["what's needed to pursue this option"],
  "timeframe": "realistic time consideration",
  "effort": "effort level (low/medium/high) with brief explanation",
  "impact": "potential impact (low/medium/high) with brief explanation"
}

Be honest, practical, and consider the user's background if relevant.

IMPORTANT: Return ONLY the JSON object, no explanations or markdown.`;

    try {
      const responseText = await this.llmService.generateCompletion(prompt);

      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn('[ChoiceAdvisorService] ⚠️ Could not parse option analysis');
        return option;
      }

      const analysis = JSON.parse(jsonMatch[0]);

      return {
        ...option,
        pros: analysis.pros || [],
        cons: analysis.cons || [],
        risks: analysis.risks || [],
        requirements: analysis.requirements || [],
        timeframe: analysis.timeframe || 'Not specified',
        effort: analysis.effort || 'medium',
        impact: analysis.impact || 'medium'
      };
    } catch (error) {
      console.error('[ChoiceAdvisorService] ❌ Error analyzing option:', error);
      return option;
    }
  }

  /**
   * Compare options side-by-side
   */
  private async compareOptions(
    options: ChoiceOption[],
    query: string,
    userMemory: StoredMessage[]
  ): Promise<OptionComparison> {
    const memoryContext = this.buildMemoryContext(userMemory);

    const optionsText = options.map((opt, idx) => 
      `Option ${idx + 1}: ${opt.title}\n` +
      `Pros: ${opt.pros?.join(', ') || 'N/A'}\n` +
      `Cons: ${opt.cons?.join(', ') || 'N/A'}`
    ).join('\n\n');

    const prompt = `Compare these options objectively for the decision: "${query}"

${optionsText}

${memoryContext}

Provide a comparison in JSON format:
{
  "summary": "Brief comparison highlighting key differences",
  "bestFor": {
    "${options[0]?.id || 'option_1'}": "Best option if user prioritizes X"
  },
  "keyDifferentiators": ["What makes each option unique"],
  "tradeoffs": ["Main tradeoffs between options"]
}

IMPORTANT: Return ONLY the JSON object, no explanations or markdown.`;

    try {
      const responseText = await this.llmService.generateCompletion(prompt);

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return this.getDefaultComparison(options);
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('[ChoiceAdvisorService] ❌ Error comparing options:', error);
      return this.getDefaultComparison(options);
    }
  }

  /**
   * Get default comparison when analysis fails
   */
  private getDefaultComparison(options: ChoiceOption[]): OptionComparison {
    return {
      summary: 'Both options have their merits and should be considered based on your priorities.',
      bestFor: {},
      keyDifferentiators: ['Each option offers different benefits'],
      tradeoffs: ['Consider your specific situation and priorities']
    };
  }

  /**
   * Generate personalized recommendation
   */
  private async generateRecommendation(
    options: ChoiceOption[],
    comparison: OptionComparison,
    query: string,
    userMemory: StoredMessage[],
    context?: ChoiceContext
  ): Promise<ChoiceRecommendation> {
    const memoryContext = this.buildMemoryContext(userMemory);

    const optionsText = options.map((opt, idx) => 
      `Option ${idx + 1} (${opt.id}): ${opt.title}\n` +
      `Pros: ${opt.pros?.join(', ') || 'N/A'}\n` +
      `Cons: ${opt.cons?.join(', ') || 'N/A'}\n` +
      `Impact: ${opt.impact || 'N/A'}, Effort: ${opt.effort || 'N/A'}`
    ).join('\n\n');

    const prompt = `Based on all analysis, provide a personalized recommendation for: "${query}"

${optionsText}

Comparison insights:
${comparison.summary}

${memoryContext}

${context?.userPriorities ? `User priorities: ${context.userPriorities.join(', ')}` : ''}
${context?.constraints ? `Constraints: ${JSON.stringify(context.constraints)}` : ''}

Provide recommendation in JSON format:
{
  "recommendedOption": "option_id",
  "confidence": 0.85,
  "reasoning": "Clear explanation of why this is recommended based on user's situation",
  "alternativeOption": "option_id for second-best choice",
  "alternativeReasoning": "When to consider the alternative",
  "considerations": ["Important things to keep in mind"],
  "nextSteps": ["Actionable next steps if user chooses recommendation"]
}

Be honest about confidence. If options are very close, reflect that in confidence score (0.5-0.7).

IMPORTANT: Return ONLY the JSON object, no explanations or markdown.`;

    try {
      const responseText = await this.llmService.generateCompletion(prompt);

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return this.getDefaultRecommendation(options);
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('[ChoiceAdvisorService] ❌ Error generating recommendation:', error);
      return this.getDefaultRecommendation(options);
    }
  }

  /**
   * Get default recommendation when analysis fails
   */
  private getDefaultRecommendation(options: ChoiceOption[]): ChoiceRecommendation {
    return {
      recommendedOption: options[0]?.id || 'option_1',
      confidence: 0.5,
      reasoning: 'Based on the available information, this option appears suitable. Consider your specific priorities.',
      alternativeOption: options[1]?.id,
      alternativeReasoning: 'This could be better if your priorities differ.',
      considerations: ['Consider your specific situation', 'Evaluate based on your priorities'],
      nextSteps: ['Think about what matters most to you', 'Gather more information if needed']
    };
  }

  /**
   * Analyze decision factors (what matters most)
   */
  private async analyzeDecisionFactors(
    query: string,
    options: ChoiceOption[],
    userMemory: StoredMessage[]
  ): Promise<DecisionFactors> {
    const memoryContext = this.buildMemoryContext(userMemory);

    const prompt = `Identify the key factors that should influence this decision: "${query}"

Options being considered:
${options.map(o => `- ${o.title}`).join('\n')}

${memoryContext}

Provide decision factors in JSON format:
{
  "primaryFactors": ["Most important considerations"],
  "secondaryFactors": ["Important but less critical factors"],
  "personalFactors": ["Factors unique to this user's situation"],
  "externalFactors": ["External circumstances to consider"],
  "timeframe": "How urgent is this decision",
  "reversibility": "Can this decision be changed later? (high/medium/low) with explanation"
}

IMPORTANT: Return ONLY the JSON object, no explanations or markdown.`;

    try {
      const responseText = await this.llmService.generateCompletion(prompt);

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return this.getDefaultFactors();
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('[ChoiceAdvisorService] ❌ Error analyzing factors:', error);
      return this.getDefaultFactors();
    }
  }

  /**
   * Get default factors when analysis fails
   */
  private getDefaultFactors(): DecisionFactors {
    return {
      primaryFactors: ['Your main priorities', 'Available resources'],
      secondaryFactors: ['Long-term implications', 'Flexibility'],
      personalFactors: ['Your specific situation'],
      externalFactors: ['External constraints'],
      timeframe: 'Consider based on urgency',
      reversibility: 'Depends on the specific choice'
    };
  }

  /**
   * Quick recommendation without full analysis (faster)
   */
  async getQuickAdvice(
    userId: string,
    query: string,
    planType: PlanType = PlanType.PLUS
  ): Promise<string> {
    try {
      const userMemory = await this.getUserMemory(userId, query, planType);
      const memoryContext = this.buildMemoryContext(userMemory);

      const prompt = `Provide quick, practical advice for this decision:

"${query}"

${memoryContext}

Give a concise recommendation (2-3 sentences) that helps them think through this decision.
Be friendly and conversational - like a helpful friend giving advice.`;

      const responseText = await this.llmService.generateCompletion(prompt);
      return responseText.trim();
    } catch (error) {
      console.error('[ChoiceAdvisorService] ❌ Error getting quick advice:', error);
      return 'I\'d suggest weighing the pros and cons of each option based on what matters most to you. Consider both short-term convenience and long-term benefits.';
    }
  }

  /**
   * Ask clarifying questions to better understand the decision
   */
  async getClarifyingQuestions(
    query: string,
    context?: ChoiceContext
  ): Promise<string[]> {
    try {
      const prompt = `For this decision query, what clarifying questions would help provide better advice?

Query: "${query}"
${context ? `Context: ${JSON.stringify(context)}` : ''}

Return 2-4 thoughtful questions as a JSON array of strings.
Focus on questions that reveal priorities, constraints, or important context.

Example format: ["Question 1?", "Question 2?"]

IMPORTANT: Return ONLY the JSON array, no explanations or markdown.`;

      const responseText = await this.llmService.generateCompletion(prompt);

      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        return this.getDefaultClarifyingQuestions();
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('[ChoiceAdvisorService] ❌ Error getting clarifying questions:', error);
      return this.getDefaultClarifyingQuestions();
    }
  }

  /**
   * Get default clarifying questions
   */
  private getDefaultClarifyingQuestions(): string[] {
    return [
      'What factors are most important to you in making this decision?',
      'Are there any constraints or limitations I should know about?',
      'What is your timeline for making this decision?'
    ];
  }
}

export default ChoiceAdvisorService;