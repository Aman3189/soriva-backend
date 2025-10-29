import { prisma } from '../../config/prisma';
import { generateAccessToken } from '@shared/utils/jwt.util';

export class OAuthService {
  /**
   * Handle successful OAuth login
   * Generate JWT token and user data for frontend
   */
  async handleOAuthSuccess(userId: string) {
    try {
      // Fetch user details
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          googleAvatar: true,
          subscriptionPlan: true,
          planStatus: true,
          authProvider: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new Error('User not found after OAuth');
      }

      // Generate JWT token
      const token = generateAccessToken({
        userId: user.id,
        email: user.email,
        planType: user.subscriptionPlan, // ✅
      });

      return {
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.googleAvatar,
          subscriptionPlan: user.subscriptionPlan,
          planStatus: user.planStatus,
          authProvider: user.authProvider,
        },
      };
    } catch (error: any) {
      throw new Error(`OAuth success handler failed: ${error.message}`);
    }
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          googleAvatar: true,
          subscriptionPlan: true,
          planStatus: true,
          authProvider: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error: any) {
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }
  }
}
