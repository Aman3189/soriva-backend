// Location: src/modules/user/user.routes.ts

import { Router } from 'express';
import { UserController } from './user.controller';
import { cacheMiddleware } from '../../middleware/cache.middleware';
import { CacheTTL } from '../../types/cache.types';

const router = Router();
const userController = new UserController();

/**
 * User Routes
 * Base path: /api/user
 */

/**
 * @route   GET /api/user/profile
 * @desc    Get current user profile
 * @access  Private (requires authentication)
 * @cache   5 minutes (user-specific)
 */
router.get(
  '/profile',
  cacheMiddleware.cacheByUser(CacheTTL.SHORT), // 5 minutes cache
  userController.getProfile.bind(userController)
);

/**
 * @route   PUT /api/user/profile
 * @desc    Update user profile
 * @access  Private (requires authentication)
 * @cache   NO CACHE (write operation)
 */
router.put('/profile', userController.updateProfile.bind(userController));

/**
 * @route   GET /api/user/:userId
 * @desc    Get user by ID
 * @access  Private (Admin only - add auth middleware later)
 * @cache   5 minutes (user-specific)
 */
router.get(
  '/:userId',
  cacheMiddleware.cacheByUser(CacheTTL.SHORT), // 5 minutes cache
  userController.getUserById.bind(userController)
);

/**
 * @route   GET /api/user/exists/:userId
 * @desc    Check if user exists
 * @access  Public
 * @cache   15 minutes (public data)
 */
router.get(
  '/exists/:userId',
  cacheMiddleware.cachePublic(CacheTTL.MEDIUM), // 15 minutes cache
  userController.checkUserExists.bind(userController)
);

export default router;