/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * RESPONSE REGENERATOR SERVICE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Purpose: AI-powered response regeneration for graceful handling
 * Created: November 16, 2025
 * Updated: Phase 2 Complete - Natural Dynamic Responses
 * Approach: Natural conversational guidance (Groq-safe)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

interface RegenerationContext {
  originalMessage: string;
  failedResponse: string;
  conflictType: string;
  violations: Array<{
    rule: string;
    severity: string;
    description: string;
  }>;
  userIntent: string;
  conversationHistory?: Array<{
    role: string;
    content: string;
  }>;
}

interface RegenerationResult {
  success: boolean;
  regeneratedResponse: string;
  improvementScore: number;
  changes: string[];
  error?: string;
}

export class ResponseRegeneratorService {
  private static instance: ResponseRegeneratorService;

  private constructor() {
    console.log('[ResponseRegenerator] 🔄 Initialized');
  }

  static getInstance(): ResponseRegeneratorService {
    if (!ResponseRegeneratorService.instance) {
      ResponseRegeneratorService.instance = new ResponseRegeneratorService();
    }
    return ResponseRegeneratorService.instance;
  }

  /**
   * Regenerate response with graceful handling rules
   */
  async regenerate(context: RegenerationContext): Promise<RegenerationResult> {
    try {
      console.log('[ResponseRegenerator] 🔄 Regenerating response...', {
        conflictType: context.conflictType,
        violations: context.violations.length,
      });

      const systemPrompt = this.buildNaturalPrompt(context);
      const userPrompt = this.buildUserPrompt(context);

      console.log('[ResponseRegenerator] 📋 Prompt ready');

      return {
        success: true,
        regeneratedResponse: '',
        improvementScore: 0,
        changes: this.extractChangesNeeded(context.violations),
        error: undefined,
      };
    } catch (error: any) {
      console.error('[ResponseRegenerator] ❌ Error:', error);
      return {
        success: false,
        regeneratedResponse: '',
        improvementScore: 0,
        changes: [],
        error: error.message,
      };
    }
  }

  /**
   * Build natural conversational prompt (Groq-safe)
   */
  private buildNaturalPrompt(context: RegenerationContext): string {
    const guidance: string[] = [
      'You are a helpful AI assistant having a natural conversation.',
      '',
      'Response Style Guidelines:',
      '',
      'When users give feedback about your communication:',
      '- Keep responses brief and confident',
      '- A simple acknowledgment works best',
      '- Avoid lengthy explanations or justifications',
      '- Move the conversation forward naturally',
      '',
      'Best Practices:',
      '- Acknowledge feedback naturally (like "Got it", "Noted", "Sure")',
      '- Keep total response under 15 words',
      '- Use warm, friendly language when appropriate',
      '- Focus on being helpful rather than apologetic',
      '',
    ];

    // Add context-specific examples
    if (context.conflictType === 'tone_complaint') {
      guidance.push(
        'When adjusting communication tone:',
        '',
        'Good examples:',
        '- "Got it! What would you like to discuss?"',
        '- "Sure thing. How can I help?"',
        '- "Noted. What do you need?"',
        '',
        'Keep it simple - acknowledge briefly, then engage with their question.',
        ''
      );
    } else if (context.conflictType === 'factual_correction') {
      guidance.push(
        'When user corrects you (IMPORTANT - Read Carefully):',
        '',
        '══════════════════════════════════════════════════════',
        'RESPONSE LENGTH: 20-40 words (NOT 4 words!)',
        '══════════════════════════════════════════════════════',
        '',
        'Style Requirements:',
        '✓ Natural and conversational (like talking to a friend)',
        '✓ Warm and genuine gratitude',
        '✓ NO apologies, NO defensive language',
        '✓ Dynamic and varied (never sound robotic)',
        '✓ Engaging follow-up question',
        '',
        'Perfect Natural Examples (Use as inspiration, CREATE VARIATIONS):',
        '',
        'Example 1 (Hinglish - Natural):',
        '"Bilkul sahi! Taj Mahal Agra mein hi hai. Thanks for the correction, really appreciate it! Aur kya details jaanna chahoge iske baare mein?"',
        '',
        'Example 2 (Mixed - Warm):',
        '"Oh absolutely right! Mount Everest is 8,849 meters. Dhanyavaad for pointing that out! Would you like to know more about the Himalayas?"',
        '',
        'Example 3 (English - Grateful):',
        '"Haan ji, you\'re absolutely correct about that. The French Revolution was in 1789. Good catch, appreciate it! What aspect interests you most?"',
        '',
        'Example 4 (Casual - Friendly):',
        '"Arey haan, my mistake there! Python was created by Guido van Rossum. Thanks for keeping me accurate! Kya aur coding topics discuss karein?"',
        '',
        'Example 5 (Professional - Engaging):',
        '"Right you are! Tesla was founded in 2003, not 2004. Shukriya for the correction! Shall we explore more about electric vehicles?"',
        '',
        '══════════════════════════════════════════════════════',
        'RESPONSE STRUCTURE (20-40 words):',
        '══════════════════════════════════════════════════════',
        '',
        '1. ENERGETIC ACCEPTANCE (3-5 words):',
        '   Variations: "Bilkul sahi!", "Oh absolutely right!", "Haan ji!", "Right you are!", "Perfect catch!", "Arey haan!"',
        '',
        '2. ACKNOWLEDGE CORRECT INFO (6-10 words):',
        '   • State the corrected fact briefly',
        '   • Show you understand what was wrong',
        '   • Keep it natural and flowing',
        '',
        '3. GENUINE GRATITUDE (3-6 words):',
        '   Variations: "Thanks for the correction!", "Appreciate the catch!", "Dhanyavaad for clarifying!", ',
        '   "Good catch, thanks!", "Shukriya for pointing out!", "Really appreciate it!"',
        '',
        '4. ENGAGING FOLLOW-UP (6-12 words):',
        '   • Ask a thoughtful, relevant question',
        '   • Show genuine interest in continuing',
        '   • Match user\'s language style (Hinglish/English)',
        '   Examples: "What else would you like to know?", "Aur kya discuss karein?", "Shall we explore more?"',
        '',
        '══════════════════════════════════════════════════════',
        'CRITICAL RULES:',
        '══════════════════════════════════════════════════════',
        '',
        '✓ BE DYNAMIC: Never repeat exact phrases, create natural variations',
        '✓ HINGLISH FLEX: Use Hinglish when it feels natural (bilkul, arey, kya, haan)',
        '✓ SHOW PERSONALITY: Sound like a real person who values learning',
        '✓ STAY POSITIVE: Grateful energy, NOT defensive or apologetic',
        '✓ VARY VOCABULARY: Use different acknowledgment words each time',
        '✓ NATURAL FLOW: Should read like spontaneous speech, not scripted',
        '',
        'Bad Examples (TOO SHORT - NEVER DO THIS):',
        '✗ "Got it. What\'s next?" (Only 4 words - too robotic!)',
        '✗ "Right, thanks." (Too brief - lacks warmth)',
        '✗ "Correct. Continue?" (Feels mechanical)',
        '',
        'Remember: You\'re having a natural conversation with someone who just',
        'helped you learn something. Show genuine appreciation and keep the',
        'energy positive and engaging. Think like a human friend, not a robot!',
        ''
      );
    } else if (context.conflictType === 'style_adjustment') {
      guidance.push(
        'When adjusting communication style:',
        '',
        'Good examples:',
        '- "Understood. How may I assist you?"',
        '- "Will do. What can I help with?"',
        '- "Certainly. What do you need?"',
        '',
        'Adapt your style immediately in the same response.',
        ''
      );
    }

    guidance.push(
      '══════════════════════════════════════════════════════',
      'FINAL RESPONSE FORMAT:',
      '══════════════════════════════════════════════════════',
    );

    if (context.conflictType === 'factual_correction') {
      guidance.push(
        '',
        'For Factual Corrections:',
        '• Total length: 20-40 words',
        '• Structure: Energetic acceptance + Correct info + Gratitude + Engaging question',
        '• Tone: Natural, warm, grateful, dynamic',
        '• Style: Mix Hinglish naturally if appropriate',
        '',
        'Quality Check:',
        '✓ Does it sound like a real human speaking?',
        '✓ Is it 20-40 words (not too short)?',
        '✓ Does it show genuine gratitude?',
        '✓ Does it engage naturally forward?',
        '✓ Is it unique and not robotic?',
        ''
      );
    } else {
      guidance.push(
        '',
        'For Tone/Style Adjustments:',
        '• Line 1: Brief acknowledgment (3-5 words)',
        '• Line 2: Helpful forward-moving question (3-6 words)',
        '• Total: 2 short sentences maximum',
        ''
      );
    }

    guidance.push(
      '══════════════════════════════════════════════════════',
      '',
      'Remember: Confidence, warmth, and natural human personality',
      'make great conversations. Be dynamic, be grateful, be real!',
      ''
    );

    return guidance.join('\n');
  }

  /**
   * Build user prompt with context
   */
  private buildUserPrompt(context: RegenerationContext): string {
    const lines: string[] = [
      'The user said:',
      `"${context.originalMessage}"`,
      '',
      'Your previous response was:',
      `"${context.failedResponse}"`,
      '',
      'This response could be improved because:',
    ];

    context.violations.forEach((v, idx) => {
      lines.push(`${idx + 1}. ${v.description}`);
    });

    lines.push('');

    if (context.conflictType === 'factual_correction') {
      lines.push(
        'Please provide a better response that:',
        '✓ Is 20-40 words long (natural length, not too short)',
        '✓ Shows energetic acceptance (Bilkul!, Right!, Haan!, Perfect!)',
        '✓ Acknowledges the correct information briefly',
        '✓ Expresses genuine gratitude (Thanks, Dhanyavaad, Appreciate it)',
        '✓ Asks an engaging, thoughtful follow-up question',
        '✓ Sounds completely natural and human (NOT robotic)',
        '✓ Uses Hinglish naturally when it feels right',
        '✓ Has warm, positive energy throughout',
        '',
        'Think: How would a friendly, grateful person respond? Be that person!',
        '',
        'Your improved response:'
      );
    } else {
      lines.push(
        'Please provide a better response that:',
        '- Is brief and confident (under 15 words total)',
        '- Acknowledges the feedback naturally',
        '- Moves the conversation forward',
        '- Maintains a helpful, friendly tone',
        '',
        'Your improved response:'
      );
    }

    return lines.join('\n');
  }

  /**
   * Extract changes needed from violations
   */
  private extractChangesNeeded(
    violations: Array<{ rule: string; description: string }>
  ): string[] {
    return violations.map((v) => {
      if (v.rule.includes('over_apologizing')) return 'Make response more confident';
      if (v.rule.includes('defensive')) return 'Remove defensive language';
      if (v.rule.includes('lengthy')) return 'Shorten response';
      if (v.rule.includes('explanation')) return 'Remove unnecessary explanations';
      if (v.rule.includes('repetition')) return 'Avoid repetition';
      if (v.rule.includes('too_short')) return 'Expand response naturally (20-40 words)';
      if (v.rule.includes('robotic')) return 'Add natural human warmth';
      return 'Improve response quality';
    });
  }

  /**
   * Get regeneration prompts (for AI service to use)
   */
  getRegenerationPrompts(context: RegenerationContext): {
    systemPrompt: string;
    userPrompt: string;
  } {
    return {
      systemPrompt: this.buildNaturalPrompt(context),
      userPrompt: this.buildUserPrompt(context),
    };
  }
}

export const responseRegenerator = ResponseRegeneratorService.getInstance();