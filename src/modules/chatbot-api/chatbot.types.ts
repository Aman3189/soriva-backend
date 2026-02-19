// src/modules/chatbot-api/chatbot.types.ts

import type { ChatbotClient, ChatbotSession, ChatbotMessage, ChatbotLead } from '@prisma/client';

// ============================================
// REQUEST TYPES
// ============================================

export interface SendMessageRequest {
  sessionId?: string;
  visitorId: string;
  message: string;
  messageType?: 'text' | 'option_select';
  metadata?: Record<string, unknown>;
}

export interface CreateSessionRequest {
  visitorId: string;
  visitorIp?: string;
  userAgent?: string;
  referrer?: string;
  currentPage?: string;
}

export interface CaptureLeadRequest {
  sessionId: string;
  name?: string;
  email?: string;
  phone?: string;
  customFields?: Record<string, unknown>;
}

// ============================================
// RESPONSE TYPES
// ============================================

export interface ChatbotResponse {
  sessionId: string;
  message: {
    id: string;
    role: 'assistant';
    content: string;
    messageType: string;
    options?: QuickReplyOption[];
  };
  latencyMs: number;
}

export interface QuickReplyOption {
  id: string;
  label: string;
  value: string;
  action?: 'send_message' | 'open_url' | 'trigger_lead_form';
}

export interface SessionResponse {
  sessionId: string;
  isActive: boolean;
  startedAt: Date;
  messageCount: number;
}

export interface ClientConfigResponse {
  slug: string;
  name: string;
  widgetConfig: WidgetConfig | null;
}

// ============================================
// WIDGET CONFIGURATION
// ============================================

export interface WidgetConfig {
  theme: {
    primaryColor: string;
    fontFamily?: string;
  };
  greeting: string;
  placeholder: string;
  position: 'bottom-right' | 'bottom-left';
  initialOptions?: QuickReplyOption[];
}

// ============================================
// INTERNAL TYPES
// ============================================

export interface AuthenticatedClient {
  id: string;
  slug: string;
  name: string;
  llmProvider: string;
  llmModel: string;
  systemPrompt: string | null;
  temperature: number;
  maxTokensPerMsg: number;
  dailyMessageLimit: number;
  monthlyMessageLimit: number;
  monthlyInputTokens: number;
  monthlyOutputTokens: number;
  dailySessionLimit: number;
  monthlyLeadLimit: number;
  usedInputTokens: number;
  usedOutputTokens: number;
  usedMessages: number;
  usageResetDate: Date;
  widgetConfig?: WidgetConfig | null;
}

export interface MessageContext {
  client: AuthenticatedClient;
  session: ChatbotSession;
  history: ChatbotMessage[];
}

// ============================================
// EXPRESS REQUEST EXTENSION
// ============================================

declare global {
  namespace Express {
    interface Request {
      authenticatedClient?: AuthenticatedClient;
    }
  }
}

// ============================================
// RE-EXPORTS FROM PRISMA
// ============================================

export type { ChatbotClient, ChatbotSession, ChatbotMessage, ChatbotLead };