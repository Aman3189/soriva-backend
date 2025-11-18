/**
 * ==========================================
 * OAUTH CONTROLLER - PKCE FLOW
 * ==========================================
 * Manual OAuth 2.0 with PKCE (No Passport)
 * Supports: Google, GitHub
 * Last Updated: November 18, 2025
 */

import { Request, Response } from 'express';
import { OAuthService } from './oauth.service';
import { Region, Currency } from '@prisma/client';

const oauthService = new OAuthService();

// Temporary in-memory store for PKCE parameters
// TODO: Move to Redis in production for scalability
const pkceStore = new Map<string, { codeVerifier: string; timestamp: number }>();

// Cleanup expired PKCE entries (10 minutes)
setInterval(() => {
  const now = Date.now();
  const TEN_MINUTES = 10 * 60 * 1000;
  
  for (const [state, data] of pkceStore.entries()) {
    if (now - data.timestamp > TEN_MINUTES) {
      pkceStore.delete(state);
    }
  }
}, 60000); // Run cleanup every minute

export class OAuthController {
  /**
   * ==========================================
   * GOOGLE OAUTH
   * ==========================================
   */

  /**
   * Step 1: Initiate Google OAuth with PKCE
   * Route: GET /api/auth/google
   * Generates auth URL and redirects user to Google
   */
  async googleAuth(req: Request, res: Response) {
    try {
      console.log('🔐 Initiating Google OAuth with PKCE...');

      // Generate Google OAuth URL with PKCE
      const { url, codeVerifier, state } = await oauthService.generateGoogleAuthUrl();

      // Store codeVerifier temporarily (linked to state)
      pkceStore.set(state, {
        codeVerifier,
        timestamp: Date.now(),
      });

      console.log('✅ Google OAuth URL generated');
      console.log('🔑 State stored:', state);

      // Redirect user to Google
      return res.redirect(url);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Google OAuth initiation failed:', errorMessage);
      return this.handleAuthError(res, errorMessage);
    }
  }

  /**
   * Step 2: Google OAuth Callback Handler
   * Route: GET /api/auth/google/callback
   * Handles OAuth callback from Google
   */
  async googleCallback(req: Request, res: Response) {
    try {
      console.log('🔄 Processing Google OAuth callback...');

      const { code, state, error } = req.query;

      // Handle OAuth errors
      if (error) {
        console.error('❌ Google OAuth error:', error);
        return this.handleAuthError(res, `Google OAuth error: ${error}`);
      }

      // Validate required parameters
      if (!code || typeof code !== 'string') {
        console.error('❌ Missing authorization code');
        return this.handleAuthError(res, 'Missing authorization code');
      }

      if (!state || typeof state !== 'string') {
        console.error('❌ Missing state parameter');
        return this.handleAuthError(res, 'Missing state parameter');
      }

      // Retrieve codeVerifier from store
      const pkceData = pkceStore.get(state);
      
      if (!pkceData) {
        console.error('❌ Invalid or expired state parameter');
        return this.handleAuthError(res, 'Invalid or expired state - please try again');
      }

      const { codeVerifier } = pkceData;

      // Delete used state (one-time use)
      pkceStore.delete(state);

      console.log('✅ State validated, exchanging code for tokens...');

      // Optional: Extract region data from query (if frontend passes it)
      const region = req.query.region as Region | undefined;
      const currency = req.query.currency as Currency | undefined;

      const regionData = region && currency ? { region, currency } : undefined;

      // Handle OAuth callback
      const result = await oauthService.handleGoogleCallback(
        code,
        codeVerifier,
        state,
        regionData
      );

      console.log('✅ Google OAuth successful:', result.user.email);

      // Redirect to frontend with token
      return this.handleAuthSuccess(res, result.token, result.user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Google callback error:', errorMessage);
      return this.handleAuthError(res, errorMessage);
    }
  }

  /**
   * ==========================================
   * GITHUB OAUTH
   * ==========================================
   */

  /**
   * Step 1: Initiate GitHub OAuth
   * Route: GET /api/auth/github
   */
  async githubAuth(req: Request, res: Response) {
    try {
      console.log('🔐 Initiating GitHub OAuth...');

      const { url, codeVerifier, state } = await oauthService.generateGitHubAuthUrl();

      // Store codeVerifier temporarily
      pkceStore.set(state, {
        codeVerifier,
        timestamp: Date.now(),
      });

      console.log('✅ GitHub OAuth URL generated');
      console.log('🔑 State stored:', state);

      return res.redirect(url);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ GitHub OAuth initiation failed:', errorMessage);
      return this.handleAuthError(res, errorMessage);
    }
  }

  /**
   * Step 2: GitHub OAuth Callback Handler
   * Route: GET /api/auth/github/callback
   */
  async githubCallback(req: Request, res: Response) {
    try {
      console.log('🔄 Processing GitHub OAuth callback...');

      const { code, state, error } = req.query;

      if (error) {
        console.error('❌ GitHub OAuth error:', error);
        return this.handleAuthError(res, `GitHub OAuth error: ${error}`);
      }

      if (!code || typeof code !== 'string') {
        console.error('❌ Missing authorization code');
        return this.handleAuthError(res, 'Missing authorization code');
      }

      if (!state || typeof state !== 'string') {
        console.error('❌ Missing state parameter');
        return this.handleAuthError(res, 'Missing state parameter');
      }

      // Retrieve and validate state
      const pkceData = pkceStore.get(state);
      
      if (!pkceData) {
        console.error('❌ Invalid or expired state parameter');
        return this.handleAuthError(res, 'Invalid or expired state - please try again');
      }

      // Delete used state
      pkceStore.delete(state);

      console.log('✅ State validated, exchanging code for tokens...');

      // Optional region data
      const region = req.query.region as Region | undefined;
      const currency = req.query.currency as Currency | undefined;
      const regionData = region && currency ? { region, currency } : undefined;

      // Handle OAuth callback
      const result = await oauthService.handleGitHubCallback(
        code,
        state,
        regionData
      );

      console.log('✅ GitHub OAuth successful:', result.user.email);

      return this.handleAuthSuccess(res, result.token, result.user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ GitHub callback error:', errorMessage);
      return this.handleAuthError(res, errorMessage);
    }
  }

  /**
   * ==========================================
   * USER PROFILE
   * ==========================================
   */

  /**
   * Get current user profile
   * Route: GET /api/auth/profile
   * Protected route - requires JWT token
   */
  async getProfile(req: Request, res: Response) {
    try {
      // User ID is attached by auth middleware
      const userId = (req as any).userId;

      if (!userId) {
        console.error('❌ Profile Error: No user ID in request');
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - No user ID found',
        });
      }

      console.log('📋 Fetching profile for user:', userId);

      const userProfile = await oauthService.getUserProfile(userId);

      console.log('✅ Profile fetched successfully');

      return res.status(200).json({
        success: true,
        user: userProfile,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Profile fetch error:', errorMessage);
      return res.status(500).json({
        success: false,
        message: errorMessage || 'Failed to fetch profile',
      });
    }
  }

  /**
   * ==========================================
   * HELPER METHODS
   * ==========================================
   */

  /**
   * Handle successful authentication
   * Redirects to frontend with JWT token
   */
  private handleAuthSuccess(res: Response, token: string, user: any) {
    const frontendUrl = process.env.FRONTEND_URL;
    const isDevelopment = process.env.NODE_ENV === 'development';

    // 🧪 DEVELOPMENT MODE: Return JSON for testing
    if (isDevelopment && !frontendUrl) {
      console.log('🧪 Development Mode: Returning JSON response');
      return res.status(200).json({
        success: true,
        message: 'Authentication successful! 🎉',
        token,
        user,
        note: 'In production, this will redirect to frontend with token',
      });
    }

    // 🚀 PRODUCTION MODE: Redirect to frontend
    const redirectUrl = `${frontendUrl}/auth/success?token=${token}`;
    console.log('🔄 Redirecting to frontend:', redirectUrl);
    return res.redirect(redirectUrl);
  }

  /**
   * Handle authentication errors
   * Redirects to frontend error page or returns JSON
   */
  private handleAuthError(res: Response, message: string) {
    const frontendUrl = process.env.FRONTEND_URL;
    const isDevelopment = process.env.NODE_ENV === 'development';

    // 🧪 Development mode: Return JSON
    if (isDevelopment && !frontendUrl) {
      return res.status(401).json({
        success: false,
        message,
        error: 'Authentication failed',
      });
    }

    // 🚀 Production mode: Redirect to frontend error page
    const errorUrl = `${frontendUrl}/auth/error?message=${encodeURIComponent(message)}`;
    return res.redirect(errorUrl);
  }

  /**
   * OAuth failure handler (legacy route)
   * Route: GET /api/auth/google/failure
   */
  googleFailure(req: Request, res: Response) {
    console.error('❌ Google OAuth failed (legacy route)');
    return this.handleAuthError(res, 'Google authentication failed');
  }

  /**
   * GitHub failure handler
   * Route: GET /api/auth/github/failure
   */
  githubFailure(req: Request, res: Response) {
    console.error('❌ GitHub OAuth failed (legacy route)');
    return this.handleAuthError(res, 'GitHub authentication failed');
  }
}