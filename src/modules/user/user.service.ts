import { PrismaClient } from '@prisma/client';
import { UpdateUserDTO, UserProfileDTO } from './dto/user.dto';
const prisma = new PrismaClient();

/**
 * Custom Error Class
 */
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

/**
 * UserService - Handles all user-related business logic
 */
export class UserService {
  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserProfileDTO> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          planType: true,
          planStatus: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Map to DTO format
      return new UserProfileDTO({
        ...user,
        profilePicture: user.avatar,
        username: null,
        bio: null,
        creditsRemaining: 0 // You can calculate this from another table if needed
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error fetching user profile:', error);
      throw new AppError('Failed to fetch user profile', 500);
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    updateData: UpdateUserDTO
  ): Promise<UserProfileDTO> {
    try {
      // Only update fields that exist in the schema
      const allowedUpdates: any = {};
      
      if (updateData.name !== undefined) {
        allowedUpdates.name = updateData.name;
      }

      // Update user profile
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...allowedUpdates,
          updatedAt: new Date()
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          planType: true,
          planStatus: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return new UserProfileDTO({
        ...updatedUser,
        profilePicture: updatedUser.avatar,
        username: null,
        bio: null,
        creditsRemaining: 0
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error updating user profile:', error);
      throw new AppError('Failed to update user profile', 500);
    }
  }

  /**
   * Get user by email (useful for internal checks)
   */
  async getUserByEmail(email: string): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      return user;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw new AppError('Failed to fetch user', 500);
    }
  }

  /**
   * Check if user exists by ID
   */
  async userExists(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true }
      });

      return !!user;
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  }
}