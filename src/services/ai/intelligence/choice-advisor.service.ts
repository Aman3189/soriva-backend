import Anthropic from '@anthropic-ai/sdk';
import { MemoryService } from './memory.service';
import {
  ChoiceAnalysis,
  ChoiceOption,
  ChoiceRecommendation,
  ChoiceContext,
  OptionComparison,
  DecisionFactors,
  LLMService,
} from './intelligence.types';

/**
 * Memory item interface for type safety
 */
interface MemoryItem {
  content: string;
  timestamp: Date;
  importance: number;
}

/**
 * Choice Advisor Service
 * Helps users make decisions by analyzing options dynamically
 * 100% LLM-powered with personalized recommendations
 */
export class ChoiceAdvisorService {
  private client: Anthropic;
  private memoryService: MemoryService;
  private readonly model = 'claude-sonnet-4-20250514';

  /**
   * ✅ FIXED: Constructor accepts LLMService interface
   */
  constructor(llmService: LLMService, memoryService: MemoryService) {
    // Extract apiKey from LLMService adapter
    const apiKey = (llmService as any).getApiKey?.() || process.env.ANTHROPIC_API_KEY || '';
    this.client = new Anthropic({ apiKey });
    this.memoryService = memoryService;
  }

  /**
   * Analyze a decision query and provide recommendations
   */
  async analyzeChoice(
    userId: string,
    query: string,
    context?: ChoiceContext
  ): Promise<ChoiceAnalysis> {
    try {
      // Get user memory for personalization
      const userMemory = await this.memoryService.getRelevantMemories(
        userId,
        query,
        5
      );

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
      console.error('Error analyzing choice:', error);
      throw new Error('Failed to analyze choice');
    }
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

If options are not clear, infer 2-4 reasonable alternatives based on the query context.`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Extract JSON from response
    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to extract options');
    }

    return JSON.parse(jsonMatch[0]);
  }

  /**
   * Analyze a single option dynamically
   */
  private async analyzeOption(
    option: ChoiceOption,
    originalQuery: string,
    userMemory: MemoryItem[]
  ): Promise<ChoiceOption> {
    const memoryContext = userMemory.length > 0
      ? `User background:\n${userMemory.map(m => `- ${m.content}`).join('\n')}`
      : 'No previous context available.';

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

Be honest, practical, and consider the user's background if relevant.`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Extract JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to analyze option');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return {
      ...option,
      pros: analysis.pros,
      cons: analysis.cons,
      risks: analysis.risks,
      requirements: analysis.requirements,
      timeframe: analysis.timeframe,
      effort: analysis.effort,
      impact: analysis.impact
    };
  }

  /**
   * Compare options side-by-side
   */
  private async compareOptions(
    options: ChoiceOption[],
    query: string,
    userMemory: MemoryItem[]
  ): Promise<OptionComparison> {
    const memoryContext = userMemory.length > 0
      ? `User background:\n${userMemory.map(m => `- ${m.content}`).join('\n')}`
      : 'No previous context available.';

    const optionsText = options.map((opt, idx) => 
      `Option ${idx + 1}: ${opt.title}\n` +
      `Pros: ${opt.pros?.join(', ')}\n` +
      `Cons: ${opt.cons?.join(', ')}`
    ).join('\n\n');

    const prompt = `Compare these options objectively for the decision: "${query}"

${optionsText}

${memoryContext}

Provide a comparison in JSON format:
{
  "summary": "Brief comparison highlighting key differences",
  "bestFor": {
    "${options[0].id}": "Best option if user prioritizes X"
  },
  "keyDifferentiators": ["What makes each option unique"],
  "tradeoffs": ["Main tradeoffs between options"]
}`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to compare options');
    }

    return JSON.parse(jsonMatch[0]);
  }

  /**
   * Generate personalized recommendation
   */
  private async generateRecommendation(
    options: ChoiceOption[],
    comparison: OptionComparison,
    query: string,
    userMemory: MemoryItem[],
    context?: ChoiceContext
  ): Promise<ChoiceRecommendation> {
    const memoryContext = userMemory.length > 0
      ? `User background:\n${userMemory.map(m => `- ${m.content}`).join('\n')}`
      : 'No previous context available.';

    const optionsText = options.map((opt, idx) => 
      `Option ${idx + 1} (${opt.id}): ${opt.title}\n` +
      `Pros: ${opt.pros?.join(', ')}\n` +
      `Cons: ${opt.cons?.join(', ')}\n` +
      `Impact: ${opt.impact}, Effort: ${opt.effort}`
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

Be honest about confidence. If options are very close, reflect that in confidence score (0.5-0.7).`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to generate recommendation');
    }

    return JSON.parse(jsonMatch[0]);
  }

  /**
   * Analyze decision factors (what matters most)
   */
  private async analyzeDecisionFactors(
    query: string,
    options: ChoiceOption[],
    userMemory: MemoryItem[]
  ): Promise<DecisionFactors> {
    const memoryContext = userMemory.length > 0
      ? `User background:\n${userMemory.map(m => `- ${m.content}`).join('\n')}`
      : 'No previous context available.';

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
}`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1536,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to analyze factors');
    }

    return JSON.parse(jsonMatch[0]);
  }

  /**
   * Quick recommendation without full analysis (faster)
   */
  async getQuickAdvice(
    userId: string,
    query: string
  ): Promise<string> {
    try {
      const userMemory = await this.memoryService.getRelevantMemories(
        userId,
        query,
        3
      );

      const memoryContext = userMemory.length > 0
        ? `User background:\n${userMemory.map(m => `- ${m.content}`).join('\n')}`
        : '';

      const prompt = `Provide quick, practical advice for this decision:

"${query}"

${memoryContext}

Give a concise recommendation (2-3 sentences) that helps them think through this decision.`;

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 256,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      return content.text.trim();
    } catch (error) {
      console.error('Error getting quick advice:', error);
      throw new Error('Failed to get quick advice');
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

Example: ["What's your timeline for making this decision?", "What matters most to you - cost, quality, or convenience?"]`;

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 512,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      const jsonMatch = content.text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Failed to extract questions');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error getting clarifying questions:', error);
      return [
        'What factors are most important to you in making this decision?',
        'Are there any constraints or limitations I should know about?'
      ];
    }
  }
}

export default ChoiceAdvisorService;