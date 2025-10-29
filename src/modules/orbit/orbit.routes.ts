/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA ORBIT ROUTES
 * "Where every idea finds its gravity"
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { Router } from 'express';
import * as orbitController from './orbit.controller';
import { AuthMiddleware } from '../auth/auth.middleware';

const router = Router();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ALL ROUTES REQUIRE AUTHENTICATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

router.use(AuthMiddleware.authenticate);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ORBIT MANAGEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * @swagger
 * /api/orbit/limits:
 *   get:
 *     summary: Get Orbit Limits
 *     description: Get orbit creation limits based on user's subscription plan
 *     tags: [Orbit]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orbit limits retrieved successfully
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
 *                     plan:
 *                       type: string
 *                       example: PLUS
 *                     maxOrbits:
 *                       type: integer
 *                       example: 15
 *                     currentOrbits:
 *                       type: integer
 *                       example: 5
 *                     remaining:
 *                       type: integer
 *                       example: 10
 *                     canCreateMore:
 *                       type: boolean
 *                       example: true
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/limits', orbitController.getLimits);

/**
 * @swagger
 * /api/orbit:
 *   get:
 *     summary: Get All Orbits
 *     description: Retrieve all orbits (conversation groups) for the authenticated user
 *     tags: [Orbit]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orbits retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: orbit_123
 *                       name:
 *                         type: string
 *                         example: Work Projects
 *                       description:
 *                         type: string
 *                         example: All work-related conversations
 *                       icon:
 *                         type: string
 *                         example: 💼
 *                       color:
 *                         type: string
 *                         example: "#3B82F6"
 *                       isPinned:
 *                         type: boolean
 *                         example: true
 *                       isDefault:
 *                         type: boolean
 *                         example: false
 *                       conversationCount:
 *                         type: integer
 *                         example: 12
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', orbitController.getAllOrbits);

/**
 * @swagger
 * /api/orbit:
 *   post:
 *     summary: Create New Orbit
 *     description: Create a new orbit (conversation group) for organizing chats
 *     tags: [Orbit]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 example: Personal Projects
 *                 description: Name of the orbit
 *               description:
 *                 type: string
 *                 maxLength: 200
 *                 example: All my personal side projects
 *                 description: Optional description
 *               icon:
 *                 type: string
 *                 example: 🚀
 *                 description: Optional emoji icon
 *               color:
 *                 type: string
 *                 pattern: "^#[0-9A-Fa-f]{6}$"
 *                 example: "#10B981"
 *                 description: Optional hex color code
 *     responses:
 *       201:
 *         description: Orbit created successfully
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
 *                   example: Orbit created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: orbit_456
 *                     name:
 *                       type: string
 *                       example: Personal Projects
 *                     description:
 *                       type: string
 *                       example: All my personal side projects
 *                     icon:
 *                       type: string
 *                       example: 🚀
 *                     color:
 *                       type: string
 *                       example: "#10B981"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input or orbit limit reached
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
 */
router.post('/', orbitController.createOrbit);

/**
 * @swagger
 * /api/orbit/{id}:
 *   get:
 *     summary: Get Orbit by ID
 *     description: Retrieve detailed information about a specific orbit
 *     tags: [Orbit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: orbit_123
 *         description: Orbit ID
 *     responses:
 *       200:
 *         description: Orbit retrieved successfully
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
 *                     id:
 *                       type: string
 *                       example: orbit_123
 *                     name:
 *                       type: string
 *                       example: Work Projects
 *                     description:
 *                       type: string
 *                       example: All work-related conversations
 *                     icon:
 *                       type: string
 *                       example: 💼
 *                     color:
 *                       type: string
 *                       example: "#3B82F6"
 *                     isPinned:
 *                       type: boolean
 *                       example: true
 *                     isDefault:
 *                       type: boolean
 *                       example: false
 *                     conversations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: conv_789
 *                           title:
 *                             type: string
 *                             example: Project Planning Discussion
 *                           isPinned:
 *                             type: boolean
 *                             example: false
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: tag_001
 *                           name:
 *                             type: string
 *                             example: urgent
 *                           color:
 *                             type: string
 *                             example: "#EF4444"
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
 *         description: Orbit not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', orbitController.getOrbitById);

/**
 * @swagger
 * /api/orbit/{id}:
 *   patch:
 *     summary: Update Orbit
 *     description: Update orbit properties (name, description, icon, color, pinned status)
 *     tags: [Orbit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: orbit_123
 *         description: Orbit ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 example: Updated Work Projects
 *               description:
 *                 type: string
 *                 maxLength: 200
 *                 example: Updated description
 *               icon:
 *                 type: string
 *                 example: 🎯
 *               color:
 *                 type: string
 *                 pattern: "^#[0-9A-Fa-f]{6}$"
 *                 example: "#8B5CF6"
 *               isPinned:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Orbit updated successfully
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
 *                   example: Orbit updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: orbit_123
 *                     name:
 *                       type: string
 *                       example: Updated Work Projects
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid update data
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
 *         description: Orbit not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id', orbitController.updateOrbit);

/**
 * @swagger
 * /api/orbit/{id}:
 *   delete:
 *     summary: Delete Orbit
 *     description: Delete an orbit and optionally reassign its conversations (cannot delete default orbit)
 *     tags: [Orbit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: orbit_123
 *         description: Orbit ID
 *     responses:
 *       200:
 *         description: Orbit deleted successfully
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
 *                   example: Orbit deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedOrbitId:
 *                       type: string
 *                       example: orbit_123
 *                     conversationsReassigned:
 *                       type: integer
 *                       example: 5
 *                       description: Number of conversations moved to default orbit
 *       400:
 *         description: Cannot delete default orbit
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
 *         description: Orbit not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', orbitController.deleteOrbit);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONVERSATION MANAGEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * @swagger
 * /api/orbit/{id}/conversations:
 *   get:
 *     summary: Get Orbit Conversations
 *     description: Retrieve all conversations within a specific orbit
 *     tags: [Orbit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: orbit_123
 *         description: Orbit ID
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: conv_789
 *                       title:
 *                         type: string
 *                         example: Project Planning Discussion
 *                       isPinned:
 *                         type: boolean
 *                         example: false
 *                       messageCount:
 *                         type: integer
 *                         example: 24
 *                       lastMessageAt:
 *                         type: string
 *                         format: date-time
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Orbit not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id/conversations', orbitController.getConversations);

/**
 * @swagger
 * /api/orbit/{id}/conversations:
 *   post:
 *     summary: Add Conversation to Orbit
 *     description: Add an existing conversation to an orbit
 *     tags: [Orbit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: orbit_123
 *         description: Orbit ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversationId
 *             properties:
 *               conversationId:
 *                 type: string
 *                 example: conv_789
 *                 description: ID of conversation to add
 *               isPinned:
 *                 type: boolean
 *                 default: false
 *                 example: false
 *                 description: Whether to pin this conversation in the orbit
 *     responses:
 *       200:
 *         description: Conversation added successfully
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
 *                   example: Conversation added to orbit successfully
 *       400:
 *         description: Invalid conversation ID or already in orbit
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
 *         description: Orbit or conversation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/conversations', orbitController.addConversation);

/**
 * @swagger
 * /api/orbit/{id}/conversations/{conversationId}:
 *   delete:
 *     summary: Remove Conversation from Orbit
 *     description: Remove a conversation from an orbit (moves to default orbit)
 *     tags: [Orbit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: orbit_123
 *         description: Orbit ID
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *           example: conv_789
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: Conversation removed successfully
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
 *                   example: Conversation removed from orbit successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Orbit or conversation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id/conversations/:conversationId', orbitController.removeConversation);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TAG MANAGEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * @swagger
 * /api/orbit/{id}/tags:
 *   get:
 *     summary: Get Orbit Tags
 *     description: Retrieve all tags within a specific orbit
 *     tags: [Orbit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: orbit_123
 *         description: Orbit ID
 *     responses:
 *       200:
 *         description: Tags retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: tag_001
 *                       name:
 *                         type: string
 *                         example: urgent
 *                       color:
 *                         type: string
 *                         example: "#EF4444"
 *                       usageCount:
 *                         type: integer
 *                         example: 5
 *                         description: Number of conversations with this tag
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Orbit not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id/tags', orbitController.getTags);

/**
 * @swagger
 * /api/orbit/{id}/tags:
 *   post:
 *     summary: Create Tag in Orbit
 *     description: Create a new tag for organizing conversations within an orbit
 *     tags: [Orbit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: orbit_123
 *         description: Orbit ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 30
 *                 example: urgent
 *                 description: Tag name
 *               color:
 *                 type: string
 *                 pattern: "^#[0-9A-Fa-f]{6}$"
 *                 example: "#EF4444"
 *                 description: Optional hex color code
 *     responses:
 *       201:
 *         description: Tag created successfully
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
 *                   example: Tag created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: tag_001
 *                     name:
 *                       type: string
 *                       example: urgent
 *                     color:
 *                       type: string
 *                       example: "#EF4444"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input or tag already exists
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
 *         description: Orbit not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/tags', orbitController.createTag);

/**
 * @swagger
 * /api/orbit/tags/{tagId}:
 *   delete:
 *     summary: Delete Tag
 *     description: Delete a tag from the system
 *     tags: [Orbit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *           example: tag_001
 *         description: Tag ID
 *     responses:
 *       200:
 *         description: Tag deleted successfully
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
 *                   example: Tag deleted successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tag not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/tags/:tagId', orbitController.deleteTag);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT ROUTER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default router;