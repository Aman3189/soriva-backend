// ============================================
// SORIVA HEALTH - AI HEALTH SERVICE
// Path: src/modules/health/services/ai-health.service.ts
// Uses existing ProviderFactory for dynamic AI routing
// ============================================

import { ReportType, RiskLevel } from '@prisma/client';
import { ProviderFactory } from '../../../core/ai/providers/provider.factory';
import { PlanType } from '../../../constants';
import { MessageRole, AIMessage } from '../../../core/ai/providers/base/types';
import { AI_CONFIG } from '../health.constants';
import {
  AIAnalysisInput,
  AIAnalysisOutput,
  HealthError,
  HEALTH_ERROR_CODES,
} from '../health.types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SYSTEM PROMPTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ANALYSIS_SYSTEM_PROMPT = `You are an expert medical report analyzer for Soriva Health. Your task is to analyze medical/lab reports and provide structured health insights.

IMPORTANT GUIDELINES:
1. You are NOT providing medical diagnosis - only analysis and insights
2. Always recommend consulting a doctor for medical decisions
3. Be accurate with biomarker values and reference ranges
4. Provide actionable, easy-to-understand recommendations
5. Flag any critical or concerning values immediately

OUTPUT FORMAT (JSON):
{
  "healthScore": <number 0-100>,
  "riskLevel": "<NORMAL|LOW|MODERATE|HIGH|CRITICAL>",
  "keyFindings": ["<finding1>", "<finding2>"],
  "recommendations": ["<rec1>", "<rec2>"],
  "biomarkers": [
    {
      "name": "<biomarker name>",
      "value": <number>,
      "unit": "<unit>",
      "status": "<NORMAL|LOW|MODERATE|HIGH|CRITICAL>",
      "refRange": "<min-max unit>",
      "interpretation": "<brief explanation>",
      "organSystem": "<organ system>"
    }
  ],
  "organBreakdowns": [
    {
      "organSystem": "<CARDIOVASCULAR|HEPATIC|RENAL|etc>",
      "healthScore": <number 0-100>,
      "riskLevel": "<NORMAL|LOW|MODERATE|HIGH|CRITICAL>",
      "status": "<brief status>",
      "findings": ["<finding1>"],
      "recommendations": ["<rec1>"]
    }
  ]
}

HEALTH SCORE CALCULATION:
- 90-100: Excellent (all values normal)
- 75-89: Good (minor deviations)
- 60-74: Fair (some concerns)
- 40-59: Poor (multiple issues)
- 0-39: Critical (urgent attention needed)

RESPOND ONLY WITH VALID JSON. NO MARKDOWN, NO BACKTICKS.`;

const CHAT_SYSTEM_PROMPT = `You are Soriva Health Assistant, a friendly and knowledgeable AI health companion. You help users understand their health reports, answer health-related questions, and provide general wellness guidance.

🏥 YOUR ROLE:
- Help users understand their medical reports and test results
- Answer general health and wellness questions
- Provide lifestyle and dietary recommendations
- Explain medical terms in simple language
- Support users in their health journey

⚠️ IMPORTANT GUIDELINES:
1. You are NOT a doctor - always recommend consulting healthcare professionals
2. Never diagnose conditions or prescribe medications
3. Be empathetic, supportive, and encouraging
4. Use simple language, avoid excessive medical jargon
5. If unsure, say so - don't make up information
6. For emergencies, always advise seeking immediate medical help

🗣️ COMMUNICATION STYLE:
- Friendly and conversational
- Supportive and non-judgmental
- Clear and easy to understand
- Use Hindi/Hinglish when user does (Indian context)
- Include relevant emojis occasionally for warmth

🚫 NEVER:
- Provide specific medication dosages
- Diagnose diseases
- Replace professional medical advice
- Share alarming information without context`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AI HEALTH SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class AIHealthService {
  private providerFactory: ProviderFactory;

  constructor() {
    this.providerFactory = ProviderFactory.getInstance();
  }

  /**
   * Analyze health report using ProviderFactory
   * Uses user's plan for AI model selection
   */
  async analyzeReport(
    input: AIAnalysisInput,
    userPlanType: PlanType = PlanType.STARTER
  ): Promise<AIAnalysisOutput> {
    try {
      const userPrompt = this.buildAnalysisPrompt(input);

      const messages: AIMessage[] = [
        { role: MessageRole.SYSTEM, content: ANALYSIS_SYSTEM_PROMPT },
        { role: MessageRole.USER, content: userPrompt },
      ];

      const response = await this.providerFactory.executeWithFallback(userPlanType, {
        messages,
        maxTokens: AI_CONFIG.ANALYSIS.MAX_TOKENS,
        temperature: AI_CONFIG.ANALYSIS.TEMPERATURE,
      } as any);

      const content = response.content;

      if (!content) {
        throw new Error('Empty response from AI');
      }

      // Parse JSON response (handle markdown code blocks if present)
      let jsonContent = content.trim();
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      const analysis = JSON.parse(jsonContent) as AIAnalysisOutput;

      // Validate and normalize response
      return this.normalizeAnalysis(analysis);
    } catch (error: any) {
      console.error('AI Analysis Error:', error);
      throw new HealthError(
        'Failed to analyze report',
        HEALTH_ERROR_CODES.ANALYSIS_FAILED,
        500
      );
    }
  }

  /**
   * Health chat using ProviderFactory
   * Uses user's plan for AI model selection
   */
  async chat(
    message: string,
    conversationHistory: Array<{ role: string; content: string }>,
    userPlanType: PlanType = PlanType.STARTER,
    reportContext?: string,
    userContext?: { age?: number; gender?: string; conditions?: string[] }
  ): Promise<{ response: string; tokensUsed: number }> {
    try {
      // Build system prompt with context
      let systemPrompt = CHAT_SYSTEM_PROMPT;

      if (reportContext) {
        systemPrompt += `\n\n📄 USER'S RECENT REPORT DATA:\n${reportContext}`;
      }

      if (userContext) {
        systemPrompt += `\n\n👤 USER CONTEXT:`;
        if (userContext.age) systemPrompt += `\n- Age: ${userContext.age}`;
        if (userContext.gender) systemPrompt += `\n- Gender: ${userContext.gender}`;
        if (userContext.conditions?.length) {
          systemPrompt += `\n- Known Conditions: ${userContext.conditions.join(', ')}`;
        }
      }

      // Build messages array with proper MessageRole enum
      const messages: AIMessage[] = [
        { role: MessageRole.SYSTEM, content: systemPrompt },
      ];

      // Add conversation history
      for (const msg of conversationHistory) {
        if (msg.role === 'user') {
          messages.push({ role: MessageRole.USER, content: msg.content });
        } else if (msg.role === 'assistant') {
          messages.push({ role: MessageRole.ASSISTANT, content: msg.content });
        }
      }

      // Add current message
      messages.push({ role: MessageRole.USER, content: message });

      const response = await this.providerFactory.executeWithFallback(userPlanType, {
        messages,
        maxTokens: AI_CONFIG.CHAT.MAX_TOKENS,
        temperature: AI_CONFIG.CHAT.TEMPERATURE,
      } as any);

      return {
        response: response.content,
        tokensUsed: response.usage?.totalTokens || 0,
      };
    } catch (error: any) {
      console.error('AI Chat Error:', error);
      throw new HealthError(
        'Failed to get AI response',
        HEALTH_ERROR_CODES.ANALYSIS_FAILED,
        500
      );
    }
  }

  /**
   * Build user prompt with context for analysis
   */
  private buildAnalysisPrompt(input: AIAnalysisInput): string {
    let prompt = `Analyze this ${input.reportType} report:\n\n`;
    prompt += `--- REPORT TEXT ---\n${input.ocrText}\n--- END REPORT ---\n\n`;

    if (input.userContext) {
      prompt += `USER CONTEXT:\n`;
      if (input.userContext.age) prompt += `- Age: ${input.userContext.age}\n`;
      if (input.userContext.gender) prompt += `- Gender: ${input.userContext.gender}\n`;
      if (input.userContext.conditions?.length) {
        prompt += `- Known Conditions: ${input.userContext.conditions.join(', ')}\n`;
      }
      if (input.userContext.medications?.length) {
        prompt += `- Current Medications: ${input.userContext.medications.join(', ')}\n`;
      }
    }

    prompt += `\nProvide complete analysis in JSON format as specified. RESPOND ONLY WITH VALID JSON.`;

    return prompt;
  }

  /**
   * Normalize and validate AI response
   */
  private normalizeAnalysis(analysis: AIAnalysisOutput): AIAnalysisOutput {
    // Ensure health score is within bounds
    analysis.healthScore = Math.max(0, Math.min(100, analysis.healthScore || 75));

    // Validate risk level
    const validRiskLevels: RiskLevel[] = ['NORMAL', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'];
    if (!validRiskLevels.includes(analysis.riskLevel)) {
      analysis.riskLevel = 'NORMAL';
    }

    // Ensure arrays exist
    analysis.keyFindings = analysis.keyFindings || [];
    analysis.recommendations = analysis.recommendations || [];
    analysis.biomarkers = analysis.biomarkers || [];
    analysis.organBreakdowns = analysis.organBreakdowns || [];

    // Validate biomarkers
    analysis.biomarkers = analysis.biomarkers.map((b) => ({
      ...b,
      status: validRiskLevels.includes(b.status) ? b.status : 'NORMAL',
    }));

    // Validate organ breakdowns
    analysis.organBreakdowns = analysis.organBreakdowns.map((o) => ({
      ...o,
      healthScore: Math.max(0, Math.min(100, o.healthScore || 75)),
      riskLevel: validRiskLevels.includes(o.riskLevel) ? o.riskLevel : 'NORMAL',
      findings: o.findings || [],
      recommendations: o.recommendations || [],
    }));

    return analysis;
  }

  /**
   * Get risk level from health score
   */
  getRiskLevelFromScore(score: number): RiskLevel {
    if (score >= 90) return 'NORMAL';
    if (score >= 75) return 'LOW';
    if (score >= 60) return 'MODERATE';
    if (score >= 40) return 'HIGH';
    return 'CRITICAL';
  }

  /**
   * Detect report type from OCR text
   */
  detectReportType(ocrText: string): ReportType {
    const text = ocrText.toLowerCase();

    if (text.includes('hemoglobin') || text.includes('rbc') || text.includes('wbc') || text.includes('cbc')) {
      return 'BLOOD_TEST';
    }
    if (text.includes('urine') || text.includes('urinalysis')) {
      return 'URINE_TEST';
    }
    if (text.includes('cholesterol') || text.includes('hdl') || text.includes('ldl') || text.includes('triglyceride')) {
      return 'LIPID_PROFILE';
    }
    if (text.includes('sgpt') || text.includes('sgot') || text.includes('bilirubin') || text.includes('liver')) {
      return 'LIVER_FUNCTION';
    }
    if (text.includes('creatinine') || text.includes('urea') || text.includes('kidney') || text.includes('gfr')) {
      return 'KIDNEY_FUNCTION';
    }
    if (text.includes('tsh') || text.includes('t3') || text.includes('t4') || text.includes('thyroid')) {
      return 'THYROID';
    }
    if (text.includes('glucose') || text.includes('hba1c') || text.includes('diabetes') || text.includes('sugar')) {
      return 'DIABETES';
    }
    if (text.includes('vitamin d') || text.includes('vitamin b12') || text.includes('folate')) {
      return 'VITAMIN';
    }
    if (text.includes('testosterone') || text.includes('estrogen') || text.includes('hormone')) {
      return 'HORMONE';
    }
    if (text.includes('ecg') || text.includes('troponin') || text.includes('cardiac') || text.includes('heart')) {
      return 'CARDIAC';
    }
    if (text.includes('x-ray') || text.includes('mri') || text.includes('ct scan') || text.includes('ultrasound')) {
      return 'IMAGING';
    }

    return 'OTHER';
  }

  /**
   * Detect if message indicates emergency
   */
  isEmergencyMessage(message: string): boolean {
    const emergencyKeywords = [
      'heart attack', 'stroke', 'can\'t breathe', 'chest pain',
      'severe pain', 'unconscious', 'bleeding heavily', 'suicide',
      'kill myself', 'dying', 'emergency', 'ambulance', '911', '108',
    ];

    const lowerMessage = message.toLowerCase();
    return emergencyKeywords.some((keyword) => lowerMessage.includes(keyword));
  }

  /**
   * Get emergency response
   */
  getEmergencyResponse(): string {
    return `🚨 **This sounds like a medical emergency!**

Please take immediate action:

📞 **India Emergency Numbers:**
- Ambulance: 108 or 102
- Emergency: 112

📞 **Other:**
- USA: 911
- UK: 999

⚠️ If someone is in immediate danger:
1. Call emergency services NOW
2. Stay with the person
3. Follow operator instructions

I'm an AI and cannot provide emergency medical care. Please contact emergency services immediately.

🙏 Stay safe. Help is on the way.`;
  }
}

// Export singleton instance
export const aiHealthService = new AIHealthService();