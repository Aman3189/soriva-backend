// src/modules/auth/auth.routes.ts
/**
 * ==========================================
 * AUTH ROUTES - UPDATED WITH PKCE OAUTH
 * ==========================================
 * Email/Password + OAuth (Google, GitHub)
 * No Passport - Manual PKCE Flow
 * Last Updated: November 18, 2025
 */

import { Router } from 'express';
import { AuthController } from './auth.controller';
import { OAuthController } from './oauth.controller';
import { authMiddleware } from './middleware/auth.middleware';
import { detectRegion } from './middleware/region.middleware';

import {
  strictAuthLimiter,
  oauthLimiter,
  generalApiLimiter,
} from '../../config/rate-limiter.config';

const router = Router();
const authController = new AuthController();
const oauthController = new OAuthController();

// ===========================
// EMAIL/PASSWORD ROUTES
// ===========================

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: SecurePass123!
 *               name:
 *                 type: string
 *                 example: John Doe
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request - Invalid input
 *       409:
 *         description: User already exists
 */
router.post('/register', strictAuthLimiter, detectRegion, (req, res) => authController.register(req, res));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123!
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 */
router.post('/login', strictAuthLimiter, (req, res) => authController.login(req, res));

// ===========================
// GOOGLE OAUTH ROUTES (PKCE)
// ===========================

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Initiate Google OAuth with PKCE
 *     description: Generate OAuth URL and redirect user to Google consent screen
 *     tags: [Auth - OAuth]
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth
 *       500:
 *         description: Failed to generate OAuth URL
 */
router.get('/google', oauthLimiter, (req, res) => oauthController.googleAuth(req, res));

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback handler
 *     description: Handle OAuth callback, validate PKCE, and issue JWT token
 *     tags: [Auth - OAuth]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization code from Google
 *       - in: query
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *         description: CSRF protection state parameter
 *       - in: query
 *         name: error
 *         schema:
 *           type: string
 *         description: Error from OAuth provider (if any)
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *           enum: [IN, INTL]
 *         description: User's region (optional)
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *           enum: [INR, USD]
 *         description: User's currency (optional)
 *     responses:
 *       302:
 *         description: Redirect to frontend with JWT token
 *       401:
 *         description: OAuth authentication failed
 */
router.get('/google/callback', oauthLimiter, (req, res) => oauthController.googleCallback(req, res));

/**
 * @swagger
 * /api/auth/google/failure:
 *   get:
 *     summary: Google OAuth failure handler
 *     description: Handle OAuth authentication failure
 *     tags: [Auth - OAuth]
 *     responses:
 *       401:
 *         description: OAuth authentication failed
 */
router.get('/google/failure', (req, res) => oauthController.googleFailure(req, res));

// ===========================
// GITHUB OAUTH ROUTES (NEW)
// ===========================

/**
 * @swagger
 * /api/auth/github:
 *   get:
 *     summary: Initiate GitHub OAuth
 *     description: Generate OAuth URL and redirect user to GitHub consent screen
 *     tags: [Auth - OAuth]
 *     responses:
 *       302:
 *         description: Redirect to GitHub OAuth
 *       500:
 *         description: Failed to generate OAuth URL
 */
router.get('/github', oauthLimiter, (req, res) => oauthController.githubAuth(req, res));

/**
 * @swagger
 * /api/auth/github/callback:
 *   get:
 *     summary: GitHub OAuth callback handler
 *     description: Handle OAuth callback and issue JWT token
 *     tags: [Auth - OAuth]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization code from GitHub
 *       - in: query
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *         description: CSRF protection state parameter
 *       - in: query
 *         name: error
 *         schema:
 *           type: string
 *         description: Error from OAuth provider (if any)
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *           enum: [IN, INTL]
 *         description: User's region (optional)
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *           enum: [INR, USD]
 *         description: User's currency (optional)
 *     responses:
 *       302:
 *         description: Redirect to frontend with JWT token
 *       401:
 *         description: OAuth authentication failed
 */
router.get('/github/callback', oauthLimiter, (req, res) => oauthController.githubCallback(req, res));

/**
 * @swagger
 * /api/auth/github/failure:
 *   get:
 *     summary: GitHub OAuth failure handler
 *     description: Handle OAuth authentication failure
 *     tags: [Auth - OAuth]
 *     responses:
 *       401:
 *         description: OAuth authentication failed
 */
router.get('/github/failure', (req, res) => oauthController.githubFailure(req, res));

// ===========================
// PROTECTED ROUTES
// ===========================

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve authenticated user's profile information
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.get('/profile', generalApiLimiter, authMiddleware, (req, res) => authController.getProfile(req, res));

/**
 * @swagger
 * /api/auth/region:
 *   patch:
 *     summary: Update user's region
 *     description: Manually update user's region/currency (e.g., user moved countries)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - country
 *             properties:
 *               country:
 *                 type: string
 *                 example: US
 *                 description: ISO country code (IN, US, GB, etc.)
 *     responses:
 *       200:
 *         description: Region updated successfully
 *       401:
 *         description: Unauthorized
 */
router.patch('/region', generalApiLimiter, authMiddleware, (req, res) => authController.updateRegion(req, res));

export default router;