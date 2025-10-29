/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA CHAT ROUTES
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Punjab, India
 * Updated: October 13, 2025
 * Purpose: API endpoints for chat functionality
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
import { Router } from 'express';
import { ChatController } from './chat.controller';
import { authenticateToken } from '../auth/auth.middleware';

// Create router
const router = Router();

// Create controller instance
const chatController = new ChatController();

/**
 * @route POST /api/chat/send
 * @desc Send a chat message
 * @access Private (requires authentication)
 * @body { message: string, sessionId?: string }
 */
router.post('/send', authenticateToken, (req, res) => chatController.sendMessage(req, res));

/**
 * @route GET /api/chat/history/:sessionId
 * @desc Get chat history for a session
 * @access Private
 */
router.get('/history/:sessionId', authenticateToken, (req, res) =>
  chatController.getChatHistory(req, res)
);

/**
 * @route GET /api/chat/sessions
 * @desc Get all user chat sessions
 * @access Private
 * @query limit?: number (default 20, max 100)
 */
router.get('/sessions', authenticateToken, (req, res) => chatController.getUserChats(req, res));

/**
 * @route DELETE /api/chat/session/:sessionId
 * @desc Delete a chat session
 * @access Private
 */
router.delete('/session/:sessionId', authenticateToken, (req, res) =>
  chatController.deleteChat(req, res)
);

/**
 * @route DELETE /api/chat/sessions/all
 * @desc Clear all user chats
 * @access Private
 */
router.delete('/sessions/all', authenticateToken, (req, res) =>
  chatController.clearAllChats(req, res)
);

/**
 * @route PATCH /api/chat/session/:sessionId/title
 * @desc Update chat title
 * @access Private
 * @body { title: string }
 */
router.patch('/session/:sessionId/title', authenticateToken, (req, res) =>
  chatController.updateChatTitle(req, res)
);

export default router;
