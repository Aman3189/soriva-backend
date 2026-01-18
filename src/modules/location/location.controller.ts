/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA LOCATION CONTROLLER v2.0
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * API endpoints for location intelligence
 * Matches location.service.ts v2.0 function names
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { Request, Response } from 'express';
import { locationService } from './location.service';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LOCATION CONTROLLER CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class LocationController {

  /**
   * POST /api/location/update
   * Update user's current location
   */
  async updateLocation(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      
      if (!user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const { latitude, longitude } = req.body;

      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        res.status(400).json({ success: false, error: 'Invalid coordinates' });
        return;
      }

      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        res.status(400).json({ success: false, error: 'Invalid coordinate range' });
        return;
      }

      const result = await locationService.updateLocation(user.userId, { latitude, longitude });

      if (!result.success) {
        res.status(500).json({ success: false, error: result.error });
        return;
      }

      res.json({
        success: true,
        location: result.location,
        isFirstTime: result.isFirstTime,
      });

    } catch (error) {
      console.error('[LocationController] Update error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * GET /api/location/current
   */
  async getCurrentLocation(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      
      if (!user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const location = await locationService.getCurrentLocation(user.userId);

      res.json({
        success: true,
        hasLocation: !!location,
        location,
      });

    } catch (error) {
      console.error('[LocationController] Get current error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * GET /api/location/travel-context
   */
  async getTravelContext(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      
      if (!user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const travelContext = await locationService.getTravelContext(user.userId);

      res.json({ success: true, ...travelContext });

    } catch (error) {
      console.error('[LocationController] Travel context error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * POST /api/location/permission-denied
   */
  async permissionDenied(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      
      if (!user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      await locationService.setPermissionDenied(user.userId);

      res.json({ success: true, message: 'Permission status updated' });

    } catch (error) {
      console.error('[LocationController] Permission denied error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * GET /api/location/should-ask
   * Uses optional auth - returns shouldAsk: false if not logged in
   */
  async shouldAskPermission(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      
      // If no user (optional auth), return shouldAsk: false with 200 OK
      if (!user) {
        res.status(200).json({ success: false, shouldAsk: false });
        return;
      }

      const shouldAsk = await locationService.shouldAskPermission(user.userId);

      res.json({ success: true, shouldAsk });

    } catch (error) {
      console.error('[LocationController] Should ask error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SINGLETON EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const locationController = new LocationController();