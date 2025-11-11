import { Router } from 'express';
import { UserController } from './user.controller';

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
 */
router.get('/profile', userController.getProfile.bind(userController));

/**
 * @route   PUT /api/user/profile
 * @desc    Update user profile
 * @access  Private (requires authentication)
 */
router.put('/profile', userController.updateProfile.bind(userController));

/**
 * @route   GET /api/user/:userId
 * @desc    Get user by ID
 * @access  Private (Admin only - add auth middleware later)
 */
router.get('/:userId', userController.getUserById.bind(userController));

/**
 * @route   GET /api/user/exists/:userId
 * @desc    Check if user exists
 * @access  Public
 */
router.get('/exists/:userId', userController.checkUserExists.bind(userController));

export default router;