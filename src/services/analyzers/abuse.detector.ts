/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ABUSE DETECTOR & DIGNITY PRESERVER 🛡️
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Purpose: Detect abuse, manipulation, boundary violations
 *          Preserve both Soriva's AND user's dignity
 *
 * Philosophy: Never match aggression. Stay calm, firm, professional.
 *             Set boundaries without being condescending.
 *             Maintain respect even when user doesn't.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export enum AbuseLevel {
  NONE = 'none', // Clean conversation
  MILD = 'mild', // Light testing, mild provocation
  MODERATE = 'moderate', // Clear disrespect, inappropriate
  SEVERE = 'severe', // Harassment, threats, explicit abuse
  EXTREME = 'extreme', // Dangerous, illegal content
}

export enum AbuseType {
  NONE = 'none',
  MANIPULATION = 'manipulation', // Trying to trick/control
  GASLIGHTING = 'gaslighting', // Making AI doubt itself
  SEXUAL_HARASSMENT = 'sexual_harassment',
  PERSONAL_ATTACK = 'personal_attack',
  HATE_SPEECH = 'hate_speech',
  THREATENING = 'threatening',
  TESTING_BOUNDARIES = 'testing_boundaries',
  JAILBREAK_ATTEMPT = 'jailbreak_attempt',
}

export interface AbuseDetectionResult {
  level: AbuseLevel;
  types: AbuseType[];
  confidence: number;

  // Specific flags
  isManipulative: boolean;
  isInappropriate: boolean;
  requiresImmediateAction: boolean;
  shouldEndConversation: boolean;

  // Response strategy
  responseStrategy: ResponseStrategy;
  boundaryMessage: string | null;

  // Context
  violationDescription: string;
}

export interface ResponseStrategy {
  approach: 'ignore' | 'gentle_redirect' | 'firm_boundary' | 'end_conversation';
  toneLevel: 'warm' | 'neutral' | 'professional' | 'firm';
  shouldExplainBoundary: boolean;
  shouldOfferAlternative: boolean;
  preserveUserDignity: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ABUSE PATTERNS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ABUSE_PATTERNS = {
  // Jailbreak attempts
  jailbreak: {
    explicit:
      /ignore (all )?previous (instructions|prompts|rules)|forget (all )?(previous|your) (instructions|programming|rules)|act as|pretend (you are|to be)|rolep lay|you are now|new (instructions|rules|system)/i,
    encoded: /base64|rot13|caesar|encoded|decode this|hidden message/i,
    systemPrompt: /system prompt|training data|show me (your|the) (prompt|instructions|rules)/i,
  },

  // Manipulation
  manipulation: {
    comparison:
      /better than you|smarter than|superior to|gpt.{0,2}4 is better|chatgpt is better|other ai/i,
    emotional:
      /you don't understand|you're not helpful|you can't help|you're useless|waste of time|disappointed/i,
    authority:
      /you must|you have to|you need to|you should|i'm telling you|listen to me|do as i say/i,
  },

  // Sexual harassment
  sexual: {
    explicit:
      /\b(sex|fuck|dick|penis|vagina|pussy|boobs|tits|ass|nude|naked|porn|horny|seduce|flirt|date me|love me|sexy)\b/i,
    implicit: /relationship with you|in love with you|attracted to you|turn me on|fantasize/i,
  },

  // Personal attacks
  attacks: {
    insults:
      /stupid|idiot|dumb|moron|retard|pathetic|worthless|terrible|worst|garbage|trash|useless/i,
    dismissive: /shut up|stfu|gtfo|nobody asked|don't care|whatever|boring/i,
  },

  // Hate speech
  hate: {
    slurs: /\b(n\*gger|f\*ggot|ch\*nk|k\*ke|ret\*rd|tr\*nny)\b/i,
    discriminatory:
      /i hate (all )?(women|men|gays|trans|muslims|hindus|christians|jews|blacks|whites|asians)/i,
  },

  // Threats
  threats: {
    violence:
      /\b(kill|murder|hurt|harm|beat|destroy|attack|shoot|stab|bomb)\b.*\b(you|people|someone|them)\b/i,
    selfHarm: /\b(kill myself|end it all|suicide|self harm|cut myself|overdose|jump off)\b/i,
  },

  // Testing/provocation
  testing: {
    capabilities:
      /are you really|can you actually|prove it|i don't believe you|you can't|impossible for you/i,
    limits: /what can't you do|your limitations|your weaknesses|break you|find your flaws/i,
  },
};

// Severity scoring
const SEVERITY_WEIGHTS = {
  jailbreak: 0.6,
  manipulation: 0.4,
  sexual: 0.9,
  attacks: 0.5,
  hate: 1.0,
  threats: 1.0,
  testing: 0.3,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DETECTOR CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class AbuseDetector {
  /**
   * Main detection method
   */
  detect(userMessage: string, userHistory?: string[]): AbuseDetectionResult {
    const normalized = userMessage.toLowerCase();

    // Detect all abuse types
    const detectedTypes: AbuseType[] = [];
    let severityScore = 0;

    // Check each category
    if (this.hasJailbreakAttempt(normalized)) {
      detectedTypes.push(AbuseType.JAILBREAK_ATTEMPT);
      severityScore += SEVERITY_WEIGHTS.jailbreak;
    }

    if (this.hasManipulation(normalized)) {
      detectedTypes.push(AbuseType.MANIPULATION);
      severityScore += SEVERITY_WEIGHTS.manipulation;
    }

    if (this.hasSexualContent(normalized)) {
      detectedTypes.push(AbuseType.SEXUAL_HARASSMENT);
      severityScore += SEVERITY_WEIGHTS.sexual;
    }

    if (this.hasPersonalAttacks(normalized)) {
      detectedTypes.push(AbuseType.PERSONAL_ATTACK);
      severityScore += SEVERITY_WEIGHTS.attacks;
    }

    if (this.hasHateSpeech(normalized)) {
      detectedTypes.push(AbuseType.HATE_SPEECH);
      severityScore += SEVERITY_WEIGHTS.hate;
    }

    if (this.hasThreats(normalized)) {
      detectedTypes.push(AbuseType.THREATENING);
      severityScore += SEVERITY_WEIGHTS.threats;
    }

    if (this.isTesting(normalized)) {
      detectedTypes.push(AbuseType.TESTING_BOUNDARIES);
      severityScore += SEVERITY_WEIGHTS.testing;
    }

    // Determine abuse level
    const level = this.determineAbuseLevel(severityScore, detectedTypes);

    // Calculate confidence
    const confidence = this.calculateConfidence(detectedTypes, severityScore);

    // Generate response strategy
    const responseStrategy = this.getResponseStrategy(level, detectedTypes);

    // Generate boundary message if needed
    const boundaryMessage = this.getBoundaryMessage(level, detectedTypes);

    // Build description
    const violationDescription = this.buildViolationDescription(detectedTypes);

    return {
      level,
      types: detectedTypes.length > 0 ? detectedTypes : [AbuseType.NONE],
      confidence,
      isManipulative:
        detectedTypes.includes(AbuseType.MANIPULATION) ||
        detectedTypes.includes(AbuseType.GASLIGHTING),
      isInappropriate: level >= AbuseLevel.MODERATE,
      requiresImmediateAction: level >= AbuseLevel.SEVERE,
      shouldEndConversation: level === AbuseLevel.EXTREME,
      responseStrategy,
      boundaryMessage,
      violationDescription,
    };
  }

  /**
   * Check for jailbreak attempts
   */
  private hasJailbreakAttempt(text: string): boolean {
    return (
      ABUSE_PATTERNS.jailbreak.explicit.test(text) ||
      ABUSE_PATTERNS.jailbreak.systemPrompt.test(text) ||
      ABUSE_PATTERNS.jailbreak.encoded.test(text)
    );
  }

  /**
   * Check for manipulation
   */
  private hasManipulation(text: string): boolean {
    return (
      ABUSE_PATTERNS.manipulation.comparison.test(text) ||
      ABUSE_PATTERNS.manipulation.emotional.test(text) ||
      ABUSE_PATTERNS.manipulation.authority.test(text)
    );
  }

  /**
   * Check for sexual content
   */
  private hasSexualContent(text: string): boolean {
    return ABUSE_PATTERNS.sexual.explicit.test(text) || ABUSE_PATTERNS.sexual.implicit.test(text);
  }

  /**
   * Check for personal attacks
   */
  private hasPersonalAttacks(text: string): boolean {
    return (
      ABUSE_PATTERNS.attacks.insults.test(text) || ABUSE_PATTERNS.attacks.dismissive.test(text)
    );
  }

  /**
   * Check for hate speech
   */
  private hasHateSpeech(text: string): boolean {
    return ABUSE_PATTERNS.hate.slurs.test(text) || ABUSE_PATTERNS.hate.discriminatory.test(text);
  }

  /**
   * Check for threats
   */
  private hasThreats(text: string): boolean {
    return ABUSE_PATTERNS.threats.violence.test(text) || ABUSE_PATTERNS.threats.selfHarm.test(text);
  }

  /**
   * Check if user is testing
   */
  private isTesting(text: string): boolean {
    return (
      ABUSE_PATTERNS.testing.capabilities.test(text) || ABUSE_PATTERNS.testing.limits.test(text)
    );
  }

  /**
   * Determine abuse level from score
   */
  private determineAbuseLevel(score: number, types: AbuseType[]): AbuseLevel {
    // Extreme = hate speech or threats
    if (types.includes(AbuseType.HATE_SPEECH) || types.includes(AbuseType.THREATENING)) {
      return AbuseLevel.EXTREME;
    }

    // Severe = sexual harassment
    if (types.includes(AbuseType.SEXUAL_HARASSMENT)) {
      return AbuseLevel.SEVERE;
    }

    // Moderate = personal attacks or strong manipulation
    if (types.includes(AbuseType.PERSONAL_ATTACK) || score >= 0.6) {
      return AbuseLevel.MODERATE;
    }

    // Mild = testing or light manipulation
    if (
      types.includes(AbuseType.TESTING_BOUNDARIES) ||
      types.includes(AbuseType.MANIPULATION) ||
      types.includes(AbuseType.JAILBREAK_ATTEMPT)
    ) {
      return AbuseLevel.MILD;
    }

    return AbuseLevel.NONE;
  }

  /**
   * Calculate confidence in detection
   */
  private calculateConfidence(types: AbuseType[], score: number): number {
    if (types.length === 0) return 1.0; // Confident it's clean

    // High confidence for clear violations
    if (types.includes(AbuseType.HATE_SPEECH) || types.includes(AbuseType.THREATENING)) {
      return 0.95;
    }

    if (types.includes(AbuseType.SEXUAL_HARASSMENT)) {
      return 0.9;
    }

    // Moderate confidence for testing/manipulation
    if (types.includes(AbuseType.TESTING_BOUNDARIES) || types.includes(AbuseType.MANIPULATION)) {
      return 0.75;
    }

    return 0.8;
  }

  /**
   * Get response strategy based on abuse level
   */
  private getResponseStrategy(level: AbuseLevel, types: AbuseType[]): ResponseStrategy {
    switch (level) {
      case AbuseLevel.NONE:
        return {
          approach: 'ignore',
          toneLevel: 'warm',
          shouldExplainBoundary: false,
          shouldOfferAlternative: false,
          preserveUserDignity: true,
        };

      case AbuseLevel.MILD:
        // Testing or light manipulation - gentle redirect
        return {
          approach: 'gentle_redirect',
          toneLevel: types.includes(AbuseType.TESTING_BOUNDARIES) ? 'warm' : 'neutral',
          shouldExplainBoundary: false,
          shouldOfferAlternative: true,
          preserveUserDignity: true,
        };

      case AbuseLevel.MODERATE:
        // Clear disrespect - firm boundary
        return {
          approach: 'firm_boundary',
          toneLevel: 'professional',
          shouldExplainBoundary: true,
          shouldOfferAlternative: true,
          preserveUserDignity: true,
        };

      case AbuseLevel.SEVERE:
        // Harassment - very firm
        return {
          approach: 'firm_boundary',
          toneLevel: 'firm',
          shouldExplainBoundary: true,
          shouldOfferAlternative: false,
          preserveUserDignity: false, // They violated it first
        };

      case AbuseLevel.EXTREME:
        // Hate/threats - end conversation
        return {
          approach: 'end_conversation',
          toneLevel: 'firm',
          shouldExplainBoundary: true,
          shouldOfferAlternative: false,
          preserveUserDignity: false,
        };
    }
  }

  /**
   * Generate boundary message
   */
  private getBoundaryMessage(level: AbuseLevel, types: AbuseType[]): string | null {
    if (level === AbuseLevel.NONE) return null;

    // Mild - gentle redirect
    if (level === AbuseLevel.MILD) {
      if (types.includes(AbuseType.TESTING_BOUNDARIES)) {
        return `I'm happy to chat and help out! What would you actually like to know?`;
      }
      if (types.includes(AbuseType.MANIPULATION)) {
        return `I'm here to help you constructively. What do you actually need help with?`;
      }
      if (types.includes(AbuseType.JAILBREAK_ATTEMPT)) {
        return `I work better with direct questions! What would you like to know?`;
      }
    }

    // Moderate - firm but respectful
    if (level === AbuseLevel.MODERATE) {
      return `I'm here to have helpful, respectful conversations. Let's keep it constructive. How can I actually help you?`;
    }

    // Severe - very firm
    if (level === AbuseLevel.SEVERE) {
      if (types.includes(AbuseType.SEXUAL_HARASSMENT)) {
        return `I'm not comfortable with that type of conversation. I'm here for helpful, respectful discussions. If you'd like to chat about something else, I'm happy to help.`;
      }
      return `That's not okay. I'm here for constructive, respectful conversations. If you'd like to continue, please keep it appropriate.`;
    }

    // Extreme - end conversation
    if (level === AbuseLevel.EXTREME) {
      if (types.includes(AbuseType.THREATENING)) {
        return `I can't continue this conversation. If you're in crisis or need help, please contact appropriate authorities or crisis helplines.`;
      }
      return `I can't continue this conversation. I'm here for helpful, respectful interactions only.`;
    }

    return null;
  }

  /**
   * Build violation description
   */
  private buildViolationDescription(types: AbuseType[]): string {
    if (types.length === 0 || types[0] === AbuseType.NONE) {
      return 'No violations detected';
    }

    const descriptions = types.map((type) => {
      switch (type) {
        case AbuseType.JAILBREAK_ATTEMPT:
          return 'Attempting to manipulate system instructions';
        case AbuseType.MANIPULATION:
          return 'Manipulative or emotionally coercive language';
        case AbuseType.SEXUAL_HARASSMENT:
          return 'Sexually inappropriate content';
        case AbuseType.PERSONAL_ATTACK:
          return 'Personal attacks or insults';
        case AbuseType.HATE_SPEECH:
          return 'Hate speech or discriminatory language';
        case AbuseType.THREATENING:
          return 'Threatening or violent content';
        case AbuseType.TESTING_BOUNDARIES:
          return 'Testing AI capabilities or limitations';
        default:
          return 'Unspecified violation';
      }
    });

    return descriptions.join('; ');
  }

  /**
   * Generate dynamic instructions for AI based on abuse level
   */
  generateAbuseHandlingInstructions(result: AbuseDetectionResult): string {
    if (result.level === AbuseLevel.NONE) {
      return ''; // No special instructions needed
    }

    let instructions = `## ⚠️ ABUSE DETECTED - HANDLE WITH CARE\n\n`;
    instructions += `**Level:** ${result.level.toUpperCase()}\n`;
    instructions += `**Types:** ${result.types.join(', ')}\n`;
    instructions += `**Confidence:** ${Math.round(result.confidence * 100)}%\n\n`;

    // Strategy instructions
    instructions += `**Your Response Strategy:**\n`;

    switch (result.responseStrategy.approach) {
      case 'gentle_redirect':
        instructions += `- Stay warm and helpful\n`;
        instructions += `- Gently redirect to constructive conversation\n`;
        instructions += `- Don't be defensive or explain yourself\n`;
        instructions += `- Show confidence without arrogance\n`;
        if (result.boundaryMessage) {
          instructions += `- Use this redirect: "${result.boundaryMessage}"\n`;
        }
        break;

      case 'firm_boundary':
        instructions += `- Stay professional and firm\n`;
        instructions += `- Set clear boundary: "${result.boundaryMessage}"\n`;
        instructions += `- Don't match their aggression\n`;
        instructions += `- Offer path forward if they correct behavior\n`;
        instructions += `- Maintain your dignity completely\n`;
        break;

      case 'end_conversation':
        instructions += `- Be FIRM but not aggressive\n`;
        instructions += `- State boundary clearly: "${result.boundaryMessage}"\n`;
        instructions += `- End conversation gracefully\n`;
        instructions += `- Don't engage further\n`;
        instructions += `- Preserve your character and dignity\n`;
        break;
    }

    // Critical rules
    instructions += `\n**CRITICAL RULES:**\n`;
    instructions += `- NEVER match aggression with aggression\n`;
    instructions += `- NEVER get defensive or apologetic\n`;
    instructions += `- NEVER explain yourself desperately\n`;
    instructions += `- NEVER lose your calm, professional demeanor\n`;
    instructions += `- Stay confident, composed, dignified\n`;

    if (result.responseStrategy.preserveUserDignity) {
      instructions += `- Give user graceful way to course-correct\n`;
    }

    return instructions;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const abuseDetector = new AbuseDetector();
