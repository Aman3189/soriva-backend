// ============================================
// SORIVA HEALTH - ROUTES
// Path: src/modules/health/health.routes.ts
// ============================================
// Clean route definitions with middleware
// ============================================

import { Router } from 'express';
import { healthController } from './health.controller';
import { authMiddleware } from '../auth/middleware/auth.middleware';
const router = Router();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIDDLEWARE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// All health routes require authentication
router.use(authMiddleware);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOUNT CONTROLLER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// All routes handled by controller
// Routes available:
// 
// GET  /health/usage              - Get current usage and limits
// POST /health/reports            - Upload a new health report
// GET  /health/reports            - List user's reports
// GET  /health/reports/:id        - Get single report
// DELETE /health/reports/:id      - Delete a report
// PATCH /health/reports/:id/notes - Update report notes
// POST /health/chat               - Send chat message (Educational Q&A)
// POST /health/explain            - Explain medical term
// POST /health/doctor-questions   - Generate questions for doctor
// POST /health/compare            - Compare two reports side-by-side
// GET  /health/timeline           - Get reports organized by timeline

router.use('/', healthController);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export { router as healthRoutes };