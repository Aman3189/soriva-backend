/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA LOCATION ROUTES
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Base path: /api/location
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { Router } from 'express';
import { locationController } from './location.controller';
import { authMiddleware, optionalAuthMiddleware } from '../auth/middleware/auth.middleware';

const router = Router();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ALL ROUTES REQUIRE AUTH
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * POST /api/location/update
 * Update user's current location
 * Body: { latitude: number, longitude: number }
 */
router.post(
  '/update',
  authMiddleware,
  locationController.updateLocation.bind(locationController)
);

/**
 * GET /api/location/current
 * Get user's current saved location
 */
router.get(
  '/current',
  authMiddleware,
  locationController.getCurrentLocation.bind(locationController)
);

/**
 * GET /api/location/travel-context
 * Get travel context (is traveling, from/to cities)
 */
router.get(
  '/travel-context',
  authMiddleware,
  locationController.getTravelContext.bind(locationController)
);

/**
 * POST /api/location/permission-denied
 * Mark that user denied location permission
 */
router.post(
  '/permission-denied',
  authMiddleware,
  locationController.permissionDenied.bind(locationController)
);

/**
 * GET /api/location/should-ask
 * Check if should ask user for location permission
 * Uses optional auth - returns shouldAsk: false if not logged in
 */
router.get(
'/should-ask',
optionalAuthMiddleware,
locationController.shouldAskPermission.bind(locationController)
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default router;