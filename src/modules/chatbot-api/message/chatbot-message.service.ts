// src/modules/chatbot-api/message/chatbot-message.service.ts

import { ChatbotMessageRepository } from './chatbot-message.repository';
import type { ChatbotMessage, ChatbotResponse, AuthenticatedClient } from '../chatbot.types';

export class ChatbotMessageService {
  private repository: ChatbotMessageRepository;

  constructor() {
    this.repository = new ChatbotMessageRepository();
  }

  async saveUserMessage(
    sessionId: string,
    content: string,
    messageType: string = 'text',
    metadata?: Record<string, unknown>
  ): Promise<ChatbotMessage> {
    return this.repository.create({
      sessionId,
      role: 'user',
      content,
      messageType,
      metadata
    });
  }

  async saveAssistantMessage(
    sessionId: string,
    content: string,
    aiMetadata: {
      model: string;
      promptTokens?: number;
      outputTokens?: number;
      latencyMs: number;
    }
  ): Promise<ChatbotMessage> {
    return this.repository.create({
      sessionId,
      role: 'assistant',
      content,
      model: aiMetadata.model,
      promptTokens: aiMetadata.promptTokens,
      outputTokens: aiMetadata.outputTokens,
      latencyMs: aiMetadata.latencyMs
    });
  }

  async getConversationHistory(sessionId: string, limit: number = 10): Promise<ChatbotMessage[]> {
    return this.repository.getRecentHistory(sessionId, limit);
  }

  formatForLLM(messages: ChatbotMessage[]): Array<{ role: string; content: string }> {
    return messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));
  }
  async getMessageCount(sessionId: string): Promise<number> {
    return this.repository.countBySession(sessionId);
  }
}