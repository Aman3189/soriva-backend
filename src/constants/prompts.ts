/**
 * PROMPTS MANAGER
 * System prompts for chat functionality
 */

interface SystemPromptConfig {
  userName?: string;
  userContext?: string;
  conversationHistory?: any[];
  personality?: string;
  tone?: string;
}

export class PromptsManager {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INSTANCE METHODS (for chat.service.ts)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Build dynamic system prompt based on config (INSTANCE)
   */
  buildSystemPrompt(config: SystemPromptConfig = {}): string {
    const {
      userName = 'User',
      userContext = '',
      conversationHistory = [],
      personality = 'helpful and friendly',
      tone = 'professional',
    } = config;

    let prompt = `You are Soriva, an advanced AI assistant.\n\n`;
    prompt += `Personality: ${personality}\n`;
    prompt += `Tone: ${tone}\n\n`;

    if (userName && userName !== 'User') {
      prompt += `You are chatting with ${userName}.\n`;
    }

    if (userContext) {
      prompt += `Context: ${userContext}\n\n`;
    }

    prompt += `Instructions:\n`;
    prompt += `- Be concise and accurate\n`;
    prompt += `- Provide helpful and relevant responses\n`;
    prompt += `- Maintain a ${tone} tone\n`;
    prompt += `- If you don't know something, admit it\n\n`;

    return prompt;
  }

  /**
   * Get system prompt (INSTANCE)
   */
  getSystemPrompt(): string {
    return `You are Soriva, a helpful AI assistant. Be concise and friendly.`;
  }

  /**
   * Get context-aware prompt (INSTANCE)
   */
  getContextPrompt(context: string): string {
    return `Context: ${context}\n\nRespond based on the above context.`;
  }

  /**
   * Get default conversation prompt (INSTANCE)
   */
  getDefaultPrompt(): string {
    return `You are a helpful assistant. Answer questions accurately and concisely.`;
  }

  /**
   * Get personality-based prompt (INSTANCE)
   */
  getPersonalityPrompt(personality: string): string {
    return `Act as a ${personality} assistant. Adjust your responses accordingly.`;
  }

  /**
   * Build conversation context from history (INSTANCE)
   */
  buildConversationContext(history: any[]): string {
    if (!history || history.length === 0) {
      return '';
    }

    let context = 'Previous conversation:\n';
    history.slice(-5).forEach((msg: any) => {
      context += `${msg.role}: ${msg.content}\n`;
    });

    return context;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STATIC METHODS (for backwards compatibility)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Build dynamic system prompt based on config (STATIC)
   */
  static buildSystemPrompt(config: SystemPromptConfig = {}): string {
    const instance = new PromptsManager();
    return instance.buildSystemPrompt(config);
  }

  /**
   * Get system prompt (STATIC)
   */
  static getSystemPrompt(): string {
    const instance = new PromptsManager();
    return instance.getSystemPrompt();
  }

  /**
   * Get context-aware prompt (STATIC)
   */
  static getContextPrompt(context: string): string {
    const instance = new PromptsManager();
    return instance.getContextPrompt(context);
  }

  /**
   * Get default conversation prompt (STATIC)
   */
  static getDefaultPrompt(): string {
    const instance = new PromptsManager();
    return instance.getDefaultPrompt();
  }
}
