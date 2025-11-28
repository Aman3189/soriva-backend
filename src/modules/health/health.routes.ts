// ============================================
// SORIVA HEALTH - ROUTES
// Path: src/modules/health/health.routes.ts
// ============================================

import { Router } from 'express';
import multer from 'multer';
import { healthController } from './health.controller';
import { FILE_LIMITS } from './health.constants';
import { authMiddleware } from '../../modules/auth/middleware/auth.middleware';
const router = Router();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MULTER CONFIG (File Upload)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: FILE_LIMITS.MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    if (FILE_LIMITS.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: JPG, PNG, PDF'));
    }
  },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DASHBOARD & STATS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// GET /health/stats - Dashboard statistics
router.get('/stats', authMiddleware, (req, res, next) => healthController.getDashboardStats(req, res, next));

// GET /health/usage - Current usage and limits
router.get('/usage', (req, res, next) => healthController.getUsage(req, res, next));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// POST /health/reports - Upload and analyze report
router.post('/reports', upload.single('file'), (req, res, next) => healthController.uploadReport(req, res, next));

// GET /health/reports - Get all reports
router.get('/reports', (req, res, next) => healthController.getReports(req, res, next));

// GET /health/reports/:id - Get single report
router.get('/reports/:id', (req, res, next) => healthController.getReportById(req, res, next));

// DELETE /health/reports/:id - Delete report
router.delete('/reports/:id', (req, res, next) => healthController.deleteReport(req, res, next));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEALTH CHAT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// POST /health/chat - Send chat message
router.post('/chat', (req, res, next) => healthController.sendChatMessage(req, res, next));

// GET /health/chat - Get chat history
router.get('/chat', (req, res, next) => healthController.getChatHistory(req, res, next));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPARE REPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// POST /health/compare - Compare two reports
router.post('/compare', (req, res, next) => healthController.compareReports(req, res, next));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DOCTOR SUMMARY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// POST /health/summary - Generate doctor summary PDF
router.post('/summary', (req, res, next) => healthController.generateSummary(req, res, next));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FAMILY MEMBERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// GET /health/family - Get family members
router.get('/family', (req, res, next) => healthController.getFamilyMembers(req, res, next));

// POST /health/family - Add family member
router.post('/family', (req, res, next) => healthController.addFamilyMember(req, res, next));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ALERTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// GET /health/alerts - Get alerts
router.get('/alerts', (req, res, next) => healthController.getAlerts(req, res, next));

// PATCH /health/alerts/:id/read - Mark alert as read
router.patch('/alerts/:id/read', (req, res, next) => healthController.markAlertRead(req, res, next));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default router;