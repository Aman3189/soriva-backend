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
 * @swagger
 * /api/chat/send:
 *   post:
 *     summary: Send Chat Message
 *     description: Send a message in a chat session and receive AI response
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: What is the weather like today?
 *                 description: User's message content
 *               sessionId:
 *                 type: string
 *                 example: clx1234567890abcdef
 *                 description: Optional session ID (creates new session if not provided)
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessionId:
 *                       type: string
 *                       example: clx1234567890abcdef
 *                     userMessage:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: msg_001
 *                         content:
 *                           type: string
 *                           example: What is the weather like today?
 *                         role:
 *                           type: string
 *                           example: user
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                     aiResponse:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: msg_002
 *                         content:
 *                           type: string
 *                           example: I don't have access to real-time weather data...
 *                         role:
 *                           type: string
 *                           example: assistant
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Bad request - Missing or invalid message
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/send', authenticateToken, (req, res) => chatController.sendMessage(req, res));

/**
 * @swagger
 * /api/chat/history/{sessionId}:
 *   get:
 *     summary: Get Chat History
 *     description: Retrieve complete message history for a specific chat session
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *           example: clx1234567890abcdef
 *         description: Chat session ID
 *     responses:
 *       200:
 *         description: Chat history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessionId:
 *                       type: string
 *                       example: clx1234567890abcdef
 *                     title:
 *                       type: string
 *                       example: Weather Discussion
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: msg_001
 *                           content:
 *                             type: string
 *                             example: What is the weather like?
 *                           role:
 *                             type: string
 *                             enum: [user, assistant]
 *                             example: user
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Chat session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/history/:sessionId', authenticateToken, (req, res) =>
  chatController.getChatHistory(req, res)
);

/**
 * @swagger
 * /api/chat/sessions:
 *   get:
 *     summary: Get All Chat Sessions
 *     description: Retrieve list of all user's chat sessions with metadata
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *           example: 20
 *         description: Maximum number of sessions to return
 *     responses:
 *       200:
 *         description: Chat sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: clx1234567890abcdef
 *                           title:
 *                             type: string
 *                             example: Machine Learning Discussion
 *                           messageCount:
 *                             type: integer
 *                             example: 12
 *                           lastMessage:
 *                             type: string
 *                             example: Can you explain neural networks?
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                     total:
 *                       type: integer
 *                       example: 45
 *                     limit:
 *                       type: integer
 *                       example: 20
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/sessions', authenticateToken, (req, res) => chatController.getUserChats(req, res));

/**
 * @swagger
 * /api/chat/session/{sessionId}:
 *   delete:
 *     summary: Delete Chat Session
 *     description: Permanently delete a specific chat session and all its messages
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *           example: clx1234567890abcdef
 *         description: Chat session ID to delete
 *     responses:
 *       200:
 *         description: Chat session deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Chat session deleted successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Chat session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/session/:sessionId', authenticateToken, (req, res) =>
  chatController.deleteChat(req, res)
);

/**
 * @swagger
 * /api/chat/sessions/all:
 *   delete:
 *     summary: Clear All Chats
 *     description: Delete all chat sessions and messages for the authenticated user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All chat sessions deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: All chat sessions deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedCount:
 *                       type: integer
 *                       example: 15
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/sessions/all', authenticateToken, (req, res) =>
  chatController.clearAllChats(req, res)
);

/**
 * @swagger
 * /api/chat/session/{sessionId}/title:
 *   patch:
 *     summary: Update Chat Title
 *     description: Update the title of a specific chat session
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *           example: clx1234567890abcdef
 *         description: Chat session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: Updated Chat Title
 *                 description: New title for the chat session
 *     responses:
 *       200:
 *         description: Chat title updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Chat title updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessionId:
 *                       type: string
 *                       example: clx1234567890abcdef
 *                     title:
 *                       type: string
 *                       example: Updated Chat Title
 *       400:
 *         description: Bad request - Invalid or missing title
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Chat session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/session/:sessionId/title', authenticateToken, (req, res) =>
  chatController.updateChatTitle(req, res)
);

export default router;