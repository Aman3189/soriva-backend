// src/modules/chatbot-api/session/chatbot-session.service.ts

import { ChatbotSessionRepository } from './chatbot-session.repository';
import type { ChatbotSession, CreateSessionRequest, SessionResponse } from '../chatbot.types';

export class ChatbotSessionService {
  private repository: ChatbotSessionRepository;

  constructor() {
    this.repository = new ChatbotSessionRepository();
  }

  async getOrCreateSession(clientId: string, data: CreateSessionRequest): Promise<ChatbotSession> {
    // Check for existing active session
    const existingSession = await this.repository.findActiveSession(clientId, data.visitorId);
    
    if (existingSession) {
      await this.repository.updateLastActive(existingSession.id, data.currentPage);
      return existingSession;
    }

    // Create new session
    return this.repository.create({
      clientId,
      visitorId: data.visitorId,
      visitorIp: data.visitorIp,
      userAgent: data.userAgent,
      referrer: data.referrer,
      currentPage: data.currentPage
    });
  }

  async getSessionById(sessionId: string): Promise<ChatbotSession | null> {
    return this.repository.findById(sessionId);
  }

  async getSessionResponse(sessionId: string): Promise<SessionResponse | null> {
    const session = await this.repository.findById(sessionId);
    
    if (!session) {
      return null;
    }

    const messageCount = await this.repository.getMessageCount(sessionId);

    return {
      sessionId: session.id,
      isActive: session.isActive,
      startedAt: session.startedAt,
      messageCount
    };
  }

  async updateActivity(sessionId: string, currentPage?: string): Promise<void> {
    await this.repository.updateLastActive(sessionId, currentPage);
  }

  async endSession(sessionId: string): Promise<void> {
    await this.repository.endSession(sessionId);
  }
}