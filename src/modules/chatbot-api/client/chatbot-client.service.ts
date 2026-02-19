// src/modules/chatbot-api/client/chatbot-client.service.ts

import { ChatbotClientRepository } from './chatbot-client.repository';
import type { AuthenticatedClient } from '../chatbot.types';

export class ChatbotClientService {
  private repository: ChatbotClientRepository;

  constructor() {
    this.repository = new ChatbotClientRepository();
  }

  async authenticateByApiKey(apiKey: string): Promise<AuthenticatedClient | null> {
    const client = await this.repository.findByApiKey(apiKey);
    
    if (!client || !client.isActive) {
      return null;
    }

    return {
      id: client.id,
      slug: client.slug,
      name: client.name,
      llmProvider: client.llmProvider,
      llmModel: client.llmModel,
      systemPrompt: client.systemPrompt,
      temperature: client.temperature,
      maxTokensPerMsg: client.maxTokensPerMsg,
      dailyMessageLimit: client.dailyMessageLimit,
      monthlyMessageLimit: client.monthlyMessageLimit,
      monthlyInputTokens: client.monthlyInputTokens,
      monthlyOutputTokens: client.monthlyOutputTokens,
      dailySessionLimit: client.dailySessionLimit,
      monthlyLeadLimit: client.monthlyLeadLimit,
      usedInputTokens: client.usedInputTokens,
      usedOutputTokens: client.usedOutputTokens,
      usedMessages: client.usedMessages,
      usageResetDate: client.usageResetDate,
      widgetConfig: client.widgetConfig as any
    };
  }

  async getClientBySlug(slug: string): Promise<AuthenticatedClient | null> {
    const client = await this.repository.findBySlug(slug);
    
    if (!client || !client.isActive) {
      return null;
    }

    return {
      id: client.id,
      slug: client.slug,
      name: client.name,
      llmProvider: client.llmProvider,
      llmModel: client.llmModel,
      systemPrompt: client.systemPrompt,
      temperature: client.temperature,
      maxTokensPerMsg: client.maxTokensPerMsg,
      dailyMessageLimit: client.dailyMessageLimit,
      monthlyMessageLimit: client.monthlyMessageLimit,
      monthlyInputTokens: client.monthlyInputTokens,
      monthlyOutputTokens: client.monthlyOutputTokens,
      dailySessionLimit: client.dailySessionLimit,
      monthlyLeadLimit: client.monthlyLeadLimit,
      usedInputTokens: client.usedInputTokens,
      usedOutputTokens: client.usedOutputTokens,
      usedMessages: client.usedMessages,
      usageResetDate: client.usageResetDate,
      widgetConfig: client.widgetConfig as any
    };
  }

  async checkRateLimit(clientId: string, dailyLimit: number): Promise<boolean> {
    const count = await this.repository.getDailyMessageCount(clientId);
    return count < dailyLimit;
  }

  async checkLeadLimit(clientId: string, monthlyLimit: number): Promise<boolean> {
    const count = await this.repository.getMonthlyLeadCount(clientId);
    return count < monthlyLimit;
  }

  async updateActivity(clientId: string): Promise<void> {
    await this.repository.updateLastActive(clientId);
  }
  async updateUsage(clientId: string, inputTokens: number, outputTokens: number): Promise<void> {
    await this.repository.checkAndResetIfNewMonth(clientId);
    await this.repository.updateUsage(clientId, inputTokens, outputTokens);
  }

  async checkMonthlyLimits(client: AuthenticatedClient): Promise<{ allowed: boolean; reason?: string }> {
    // Check monthly message limit
    if (client.usedMessages >= client.monthlyMessageLimit) {
      return { allowed: false, reason: 'Monthly message limit exceeded' };
    }

    // Check monthly input token limit
    if (client.usedInputTokens >= client.monthlyInputTokens) {
      return { allowed: false, reason: 'Monthly input token limit exceeded' };
    }

    // Check monthly output token limit
    if (client.usedOutputTokens >= client.monthlyOutputTokens) {
      return { allowed: false, reason: 'Monthly output token limit exceeded' };
    }

    return { allowed: true };
  }
}