/**
 * MINIMAL ABUSE DETECTOR - Only blocks direct insults to Soriva
 */

export enum AbuseLevel {
  NONE = 'none',
  MODERATE = 'moderate',
}

export enum AbuseType {
  NONE = 'none',
  PERSONAL_ATTACK = 'personal_attack',
}

export interface AbuseDetectionResult {
  level: AbuseLevel;
  types: AbuseType[];
  confidence: number;
  isInappropriate: boolean;
  boundaryMessage: string | null;
  violationDescription: string;
}

// Simple regex: (you|soriva|ai) within 20 chars of (stupid|idiot|garbage|useless|trash)
const DIRECTED_INSULT = /\b(you|soriva|ai)\b.{0,20}\b(stupid|idiot|garbage|useless|worthless|trash|pathetic|dumb|moron)\b|\b(stupid|idiot|garbage|useless|worthless|trash|pathetic|dumb|moron)\b.{0,20}\b(you|soriva|ai)\b/i;

export class AbuseDetector {
  detect(userMessage: string): AbuseDetectionResult {
    const isDirectInsult = DIRECTED_INSULT.test(userMessage.toLowerCase());

    return {
      level: isDirectInsult ? AbuseLevel.MODERATE : AbuseLevel.NONE,
      types: isDirectInsult ? [AbuseType.PERSONAL_ATTACK] : [AbuseType.NONE],
      confidence: 1.0,
      isInappropriate: isDirectInsult,
      boundaryMessage: null,
      violationDescription: isDirectInsult ? 'Direct insult' : 'No violations',
    };
  }
}

export const abuseDetector = new AbuseDetector();