/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SOVEREIGN CONTROLLER
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Handles Sovereign mode activation for Risenex founders
 * Password protected internal access
 * 
 * Author: Aman (Risenex Global)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { Request, Response } from 'express';
import { PrismaClient, PlanType } from '@prisma/client';

const prisma = new PrismaClient();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Sovereign password - Move to .env in production!
const SOVEREIGN_PASSWORD = process.env.SOVEREIGN_PASSWORD || '9815999474';

// Rate limiting storage (in-memory, use Redis in production)
const failedAttempts: Map<string, { count: number; lastAttempt: Date }> = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 30;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTROLLER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class SovereignController {

  /**
   * Activate Sovereign mode for authenticated user
   * POST /api/auth/sovereign-access
   */
  async activateSovereign(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const userEmail = (req as any).user?.email;
      const { password } = req.body;

      // ─────────────────────────────────────────────────────────────────
      // Authentication Check
      // ─────────────────────────────────────────────────────────────────
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Please login first'
        });
        return;
      }

      // ─────────────────────────────────────────────────────────────────
      // Rate Limiting Check
      // ─────────────────────────────────────────────────────────────────
      const attemptKey = userId;
      const attempts = failedAttempts.get(attemptKey);

      if (attempts) {
        const timeSinceLastAttempt = Date.now() - attempts.lastAttempt.getTime();
        const lockoutMs = LOCKOUT_MINUTES * 60 * 1000;

        // Check if still locked out
        if (attempts.count >= MAX_ATTEMPTS && timeSinceLastAttempt < lockoutMs) {
          const remainingMins = Math.ceil((lockoutMs - timeSinceLastAttempt) / 60000);
          res.status(429).json({
            success: false,
            error: `Too many attempts. Try again in ${remainingMins} minutes.`
          });
          return;
        }

        // Reset if lockout expired
        if (timeSinceLastAttempt >= lockoutMs) {
          failedAttempts.delete(attemptKey);
        }
      }

      // ─────────────────────────────────────────────────────────────────
      // Password Validation
      // ─────────────────────────────────────────────────────────────────
      if (!password) {
        res.status(400).json({
          success: false,
          error: 'Authorization code required'
        });
        return;
      }

      if (password !== SOVEREIGN_PASSWORD) {
        // Track failed attempt
        const currentAttempts = failedAttempts.get(attemptKey) || { count: 0, lastAttempt: new Date() };
        currentAttempts.count += 1;
        currentAttempts.lastAttempt = new Date();
        failedAttempts.set(attemptKey, currentAttempts);

        console.log(`⚠️ Sovereign: Failed attempt for user ${userEmail} (${currentAttempts.count}/${MAX_ATTEMPTS})`);

        res.status(403).json({
          success: false,
          error: 'Invalid authorization code'
        });
        return;
      }

      // ─────────────────────────────────────────────────────────────────
      // Activate Sovereign Mode
      // ─────────────────────────────────────────────────────────────────
      await prisma.user.update({
        where: { id: userId },
        data: {
          planType: PlanType.SOVEREIGN,
        }
      });

      // Clear failed attempts on success
      failedAttempts.delete(attemptKey);

      console.log(`👑 Sovereign: Activated for user ${userEmail}`);

      // ─────────────────────────────────────────────────────────────────
      // Success Response
      // ─────────────────────────────────────────────────────────────────
      res.status(200).json({
        success: true,
        message: 'Sovereign mode activated!',
        plan: 'SOVEREIGN',
        features: {
          voice: 'unlimited',
          studio: 'unlimited',
          tokens: 'unlimited',
          documents: 'unlimited',
        }
      });

    } catch (error: any) {
      console.error('❌ Sovereign activation error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Check if user has Sovereign status
   * GET /api/auth/sovereign-status
   */
  async checkSovereignStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          planType: true,
        }
      });

      const isSovereign = user?.planType === PlanType.SOVEREIGN;

      res.status(200).json({
        success: true,
        isSovereign,
        planType: user?.planType,
      });

    } catch (error: any) {
      console.error('❌ Sovereign status check error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

export default new SovereignController();
