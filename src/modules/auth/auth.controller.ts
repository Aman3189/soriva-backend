import { Request, Response } from 'express';
import authService from './auth.service';
import { z } from 'zod';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export class AuthController {
  /**
   * POST /api/auth/register
   * Register a new user
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const { email, password, name } = registerSchema.parse(req.body);

      // Register user - pass individual parameters
      const result = await authService.register(email, password, name);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.issues,
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: error.message || 'Registration failed',
      });
    }
  }

  /**
   * POST /api/auth/login
   * Login user
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const { email, password } = loginSchema.parse(req.body);

      // Login user - pass individual parameters
      const result = await authService.login(email, password);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.issues,
        });
        return;
      }

      res.status(401).json({
        success: false,
        message: error.message || 'Login failed',
      });
    }
  }
}

export default new AuthController();
