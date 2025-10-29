import { Request, Response, NextFunction } from 'express';
import { OAuthService } from './oauth.service';

const oauthService = new OAuthService();

export class OAuthController {
  /**
   * Initiates Google OAuth flow
   * Route: GET /api/auth/google
   * Passport will redirect to Google login page
   */
  googleAuth() {
    // This is handled by Passport middleware in routes
    // No logic needed here - just a placeholder
  }

  /**
   * Google OAuth callback handler
   * Route: GET /api/auth/google/callback
   * Called after user authorizes on Google
   */
  async googleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      // User is attached to req by Passport
      const user = req.user as any;

      if (!user) {
        console.error('❌ OAuth Error: No user found in request');
        return this.handleAuthError(res, 'Authentication failed - No user found');
      }

      console.log('✅ OAuth Success: User authenticated:', user.email);

      // Generate JWT token and user data
      const result = await oauthService.handleOAuthSuccess(user.id);

      console.log('✅ JWT Token generated successfully');

      // 🔍 Check if frontend is available
      const frontendUrl = process.env.FRONTEND_URL;
      const isDevelopment = process.env.NODE_ENV === 'development';

      // 📱 DEVELOPMENT MODE: Return JSON for testing
      if (isDevelopment && !frontendUrl) {
        console.log('🧪 Development Mode: Returning JSON response');
        return res.status(200).json({
          success: true,
          message: 'Authentication successful! 🎉',
          token: result.token,
          user: result.user,
          note: 'In production, this will redirect to frontend with token',
        });
      }

      // 🚀 PRODUCTION MODE: Redirect to frontend
      const redirectUrl = `${frontendUrl}/auth/success?token=${result.token}`;
      console.log('🔄 Redirecting to frontend:', redirectUrl);
      return res.redirect(redirectUrl);
    } catch (error: any) {
      console.error('❌ OAuth callback error:', error.message);
      console.error(error.stack);
      return this.handleAuthError(res, error.message);
    }
  }

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
    } catch (error: any) {
      console.error('❌ Profile fetch error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch profile',
      });
    }
  }

  /**
   * OAuth failure handler
   * Route: GET /api/auth/google/failure
   */
  googleFailure(req: Request, res: Response) {
    console.error('❌ Google OAuth failed');
    return this.handleAuthError(res, 'Google authentication failed');
  }

  /**
   * Private helper: Handle authentication errors
   * Redirects to frontend in production, returns JSON in development
   */
  private handleAuthError(res: Response, message: string) {
    const frontendUrl = process.env.FRONTEND_URL;
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Development mode: Return JSON
    if (isDevelopment && !frontendUrl) {
      return res.status(401).json({
        success: false,
        message,
        error: 'Authentication failed',
      });
    }

    // Production mode: Redirect to frontend error page
    const errorUrl = `${frontendUrl}/auth/error?message=${encodeURIComponent(message)}`;
    return res.redirect(errorUrl);
  }
}
