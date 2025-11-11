import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { UpdateUserDTO } from './dto/user.dto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

const userService = new UserService();

/**
 * UserController - Handles HTTP requests for user operations
 */
export class UserController {
  /**
   * Get current user profile
   * GET /api/user/profile
   */
  async getProfile(req: any, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - User not authenticated'
        });
      }

      const profile = await userService.getUserProfile(userId);

      return res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error: any) {
      console.error('Get profile error:', error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to fetch profile'
      });
    }
  }

  /**
   * Update user profile
   * PUT /api/user/profile
   */
  async updateProfile(req: any, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - User not authenticated'
        });
      }

      // Transform and validate DTO
      const updateData = plainToClass(UpdateUserDTO, req.body);
      const errors = await validate(updateData);

      if (errors.length > 0) {
        const formattedErrors = errors.map(error => ({
          field: error.property,
          messages: Object.values(error.constraints || {})
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: formattedErrors
        });
      }

      const updatedProfile = await userService.updateUserProfile(userId, updateData);

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile
      });
    } catch (error: any) {
      console.error('Update profile error:', error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to update profile'
      });
    }
  }

  /**
   * Get user by ID (Admin only - you can add auth middleware later)
   * GET /api/user/:userId
   */
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const profile = await userService.getUserProfile(userId);

      return res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error: any) {
      console.error('Get user by ID error:', error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to fetch user'
      });
    }
  }

  /**
   * Check if user exists
   * GET /api/user/exists/:userId
   */
  async checkUserExists(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const exists = await userService.userExists(userId);

      return res.status(200).json({
        success: true,
        exists
      });
    } catch (error: any) {
      console.error('Check user exists error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to check user existence'
      });
    }
  }
}