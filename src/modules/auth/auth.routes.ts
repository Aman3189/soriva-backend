import { Router } from 'express';
import { AuthController } from './auth.controller';
import { OAuthController } from './oauth.controller';
import { authenticateToken } from './auth.middleware';
import passport from '../../config/passport.config';

const router = Router();
const authController = new AuthController();
const oauthController = new OAuthController();

// ===========================
// EMAIL/PASSWORD ROUTES
// ===========================

/**
 * @route   POST /api/auth/register
 * @desc    Register with email & password
 * @access  Public
 */
router.post('/register', (req, res) => authController.register(req, res));

/**
 * @route   POST /api/auth/login
 * @desc    Login with email & password
 * @access  Public
 */
router.post('/login', (req, res) => authController.login(req, res));

// ===========================
// GOOGLE OAUTH ROUTES
// ===========================

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth flow
 * @access  Public
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false, // We use JWT, not sessions
  })
);

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public (called by Google)
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/api/auth/google/failure',
    session: false,
  }),
  (req, res, next) => oauthController.googleCallback(req, res, next)
);

/**
 * @route   GET /api/auth/google/failure
 * @desc    OAuth failure redirect
 * @access  Public
 */
router.get('/google/failure', (req, res) => oauthController.googleFailure(req, res));

// ===========================
// PROTECTED ROUTES
// ===========================

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private (requires JWT)
 */
router.get('/profile', authenticateToken, (req, res) => oauthController.getProfile(req, res));

export default router;
