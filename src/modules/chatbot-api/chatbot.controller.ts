// src/modules/chatbot-api/chatbot.controller.ts

import { Request, Response } from 'express';
import { ChatbotClientService } from './client/chatbot-client.service';
import { ChatbotSessionService } from './session/chatbot-session.service';
import { ChatbotMessageService } from './message/chatbot-message.service';
import { ChatbotLeadService } from './lead/chatbot-lead.service';
import { ChatbotFlowService } from './flow/chatbot-flow.service';
import { GeminiProvider } from '../../core/ai/providers/gemini.provider';
import { MessageRole, Providers, createAIModel } from '../../core/ai/providers/base/types';
import type { AIMessage } from '../../core/ai/providers/base/types';
import { sanitizeInput, calculateLeadScore } from './utils/chatbot.helpers';
import type { 
  SendMessageRequest, 
  CaptureLeadRequest,
  AuthenticatedClient,
  QuickReplyOption
} from './chatbot.types';

// Session message limit
const SESSION_MESSAGE_LIMIT = 7;

export class ChatbotController {
  private clientService: ChatbotClientService;
  private sessionService: ChatbotSessionService;
  private messageService: ChatbotMessageService;
  private leadService: ChatbotLeadService;
  private flowService: ChatbotFlowService;

  constructor() {
    this.clientService = new ChatbotClientService();
    this.sessionService = new ChatbotSessionService();
    this.messageService = new ChatbotMessageService();
    this.leadService = new ChatbotLeadService();
    this.flowService = new ChatbotFlowService();
  }

  /**
   * POST /api/v1/chatbot/:slug/message
   */
  async sendMessage(req: Request, res: Response): Promise<void> {
    const startTime = performance.now();
    
    try {
      const client = req.authenticatedClient as AuthenticatedClient;
      const { sessionId, visitorId, message, messageType, metadata } = req.body as SendMessageRequest;

      // Validate input
      if (!message || !visitorId) {
        res.status(400).json({ error: 'message and visitorId are required' });
        return;
      }

      // Check rate limit
      const withinLimit = await this.clientService.checkRateLimit(client.id, client.dailyMessageLimit);
      if (!withinLimit) {
        res.status(429).json({ error: 'Daily message limit exceeded' });
        return;
      }

      // Get or create session
      const session = await this.sessionService.getOrCreateSession(client.id, {
        visitorId,
        visitorIp: req.ip,
        userAgent: req.get('user-agent'),
        currentPage: req.get('referer')
      });

      const sanitizedMessage = sanitizeInput(message);

      // Save user message FIRST
      await this.messageService.saveUserMessage(session.id, sanitizedMessage, messageType, metadata);

      // Check session message limit (7 messages max per session) - AFTER saving
      const messageCount = await this.messageService.getMessageCount(session.id);
      
      if (messageCount >= SESSION_MESSAGE_LIMIT) {
        res.json({
          sessionId: session.id,
          message: {
            id: `limit_${Date.now()}`,
            role: 'assistant',
            content: 'I would love to connect you with our team for more details. Please fill out our contact form!',
            messageType: 'redirect',
            options: [
              { label: 'Contact Us', value: '/contact' },
              { label: 'Schedule Demo', value: '/schedule-demo' }
            ]
          },
          redirectTo: '/contact',
          remainingMessages: 0,
          latencyMs: Math.round(performance.now() - startTime)
        });
        return;
      }

      // Check for static flow (Hybrid: Static + AI)
      const flowResponse = await this.flowService.processMessage(client.id, sanitizedMessage, messageType);
      
      if (flowResponse.type === 'static' && !flowResponse.useAI) {
        
        // Save static response
        const latencyMs = Math.round(performance.now() - startTime);
        const assistantMessage = await this.messageService.saveAssistantMessage(
          session.id,
          flowResponse.response || 'How can I help you?',
          { model: 'static', latencyMs }
        );

        // Calculate remaining messages
        const remainingMessages = Math.max(0, SESSION_MESSAGE_LIMIT - messageCount - 1);

        res.json({
          sessionId: session.id,
          message: {
            id: assistantMessage.id,
            role: 'assistant',
            content: flowResponse.response || 'How can I help you?',
            messageType: 'text',
            options: flowResponse.options || [],
            route: flowResponse.route
          },
          remainingMessages,
          latencyMs
        });
        return;
      }

      // AI Flow - Get conversation history
      const history = await this.messageService.getConversationHistory(session.id);
      const formattedHistory = this.messageService.formatForLLM(history);

      // Generate AI response using Gemini
      const aiResponse = await this.generateAIResponse(client, formattedHistory, sanitizedMessage);

      // Save assistant message
      const latencyMs = Math.round(performance.now() - startTime);
      const assistantMessage = await this.messageService.saveAssistantMessage(
        session.id,
        aiResponse.content,
        {
          model: client.llmModel,
          promptTokens: aiResponse.promptTokens,
          outputTokens: aiResponse.outputTokens,
          latencyMs
        }
      );

      // Update usage tracking
      await this.clientService.updateUsage(
        client.id, 
        aiResponse.promptTokens || 0, 
        aiResponse.outputTokens || 0
      );

      // Update client activity
      await this.clientService.updateActivity(client.id);

      // Calculate remaining messages
      const remainingMessages = Math.max(0, SESSION_MESSAGE_LIMIT - messageCount - 1);

      res.json({
        sessionId: session.id,
        message: {
          id: assistantMessage.id,
          role: 'assistant',
          content: aiResponse.content,
          messageType: 'text',
          options: aiResponse.options
        },
        remainingMessages,
        latencyMs
      });
    } catch (error) {
      console.error('ChatbotController.sendMessage error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  /**
   * GET /api/v1/chatbot/:slug/session
   */
  async getSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.query;

      if (!sessionId || typeof sessionId !== 'string') {
        res.status(400).json({ error: 'sessionId is required' });
        return;
      }

      const sessionResponse = await this.sessionService.getSessionResponse(sessionId);

      if (!sessionResponse) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      res.json(sessionResponse);
    } catch (error) {
      console.error('ChatbotController.getSession error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /api/v1/chatbot/:slug/lead
   */
  async captureLead(req: Request, res: Response): Promise<void> {
    try {
      const client = req.authenticatedClient as AuthenticatedClient;
      const { sessionId, name, email, phone, customFields } = req.body as CaptureLeadRequest;

      if (!sessionId) {
        res.status(400).json({ error: 'sessionId is required' });
        return;
      }

      // Verify session belongs to this client
      const session = await this.sessionService.getSessionById(sessionId);
      if (!session || session.clientId !== client.id) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      // Capture lead
      const lead = await this.leadService.captureLead(
        client.id,
        sessionId,
        { sessionId, name, email, phone, customFields },
        session.currentPage || undefined
      );

      // Calculate and update lead score
      const score = calculateLeadScore({ name, email, phone, customFields });
      await this.leadService.scoreLead(lead.id, score);

      res.json({
        leadId: lead.id,
        score,
        message: 'Thank you! Our team will contact you shortly.',
        resetChat: true,
        initialOptions: [
          { label: 'Patient Access', value: 'patient_access' },
          { label: 'Coding and Documentation', value: 'coding' },
          { label: 'Billing & A/R Management', value: 'billing' },
          { label: 'Provider Credentialing', value: 'credentialing' },
          { label: 'Careers', value: 'careers' },
          { label: 'Other', value: 'other' }
        ]
      });
    } catch (error) {
      console.error('ChatbotController.captureLead error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/v1/chatbot/:slug/config
   */
  async getConfig(req: Request, res: Response): Promise<void> {
    try {
      const client = req.authenticatedClient as AuthenticatedClient;

      res.json({
        slug: client.slug,
        name: client.name,
        widgetConfig: client.widgetConfig || null
      });
    } catch (error) {
      console.error('ChatbotController.getConfig error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Generate AI response using Gemini provider
   */
  private async generateAIResponse(
    client: AuthenticatedClient,
    history: Array<{ role: string; content: string }>,
    currentMessage: string
  ): Promise<{ 
    content: string; 
    promptTokens?: number; 
    outputTokens?: number; 
    options?: QuickReplyOption[] 
  }> {
    try {
      // Initialize Gemini provider with client config
      const geminiProvider = new GeminiProvider({
        provider: Providers.GOOGLE,
        apiKey: process.env.GOOGLE_API_KEY!,
        model: createAIModel(client.llmModel),
        timeout: 30000,
      });

      // Build messages array with proper types
      const messages: AIMessage[] = [];

      // Add system prompt
      if (client.systemPrompt) {
        messages.push({
          role: MessageRole.SYSTEM,
          content: client.systemPrompt
        });
      } else {
        messages.push({
          role: MessageRole.SYSTEM,
          content: `You are a helpful assistant for ${client.name}. 
              IMPORTANT RULES:
              - Never say you are an AI, Gemini, Google AI, or any AI model
              - Never say you are Soriva or powered by Soriva
              - You are simply the ${client.name} assistant
              - Be helpful, friendly and professional
              - Keep responses concise and relevant`
        });
      }

      // Add conversation history with proper role mapping
      for (const msg of history) {
        messages.push({
          role: msg.role === 'assistant' ? MessageRole.ASSISTANT : MessageRole.USER,
          content: msg.content
        });
      }

      // Add current user message
      messages.push({
        role: MessageRole.USER,
        content: currentMessage
      });

      // Call Gemini API
      const response = await geminiProvider.chat({
        model: createAIModel(client.llmModel),
        messages,
        temperature: client.temperature,
        maxTokens: client.maxTokensPerMsg,
      });

      return {
        content: response.content,
        promptTokens: response.usage?.promptTokens,
        outputTokens: response.usage?.completionTokens,
        options: []
      };

    } catch (error) {
      console.error('Gemini API error:', error);
      
      return {
        content: 'I apologize, but I am unable to respond at the moment. Please try again shortly.',
        promptTokens: 0,
        outputTokens: 0,
        options: []
      };
    }
  }
}