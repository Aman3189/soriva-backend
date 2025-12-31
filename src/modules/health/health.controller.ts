// ============================================
// SORIVA HEALTH - CONTROLLER LAYER
// Path: src/modules/health/health.controller.ts
// ============================================
// REFOCUSED: Safe operations only
// NO: Diagnosis, Scores, Risk, Predictions
// YES: Storage, Organization, Education, Q&A
// ============================================

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { healthService } from './health.service';
import { 
  UPLOAD_LIMITS, 
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES,
  DISCLAIMERS,
} from './health.constants';
import { 
  HealthPlan, 
  HealthRegion, 
  ReportType,
  HealthErrorCode,
} from './health.types';
import { getPlanLimits } from '../../config/health-plans.config';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VALIDATION SCHEMAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const REPORT_TYPES = [
  'BLOOD_TEST', 'XRAY', 'MRI', 'CT_SCAN', 
  'ULTRASOUND', 'ECG', 'PRESCRIPTION', 
  'DISCHARGE_SUMMARY', 'OTHER'
] as const;

const uploadReportSchema = z.object({
  title: z.string().min(1).max(200),
  reportType: z.enum(REPORT_TYPES),
  reportDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  familyMemberId: z.string().uuid().optional(),
  labName: z.string().max(200).optional(),
  doctorName: z.string().max(200).optional(),
  userNotes: z.string().max(2000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

const listReportsSchema = z.object({
  familyMemberId: z.string().uuid().optional(),
  reportType: z.enum(REPORT_TYPES).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  reportId: z.string().uuid().optional(),
  sessionId: z.string().optional(),
});

const termExplanationSchema = z.object({
  term: z.string().min(1).max(100),
  context: z.string().max(500).optional(),
  reportId: z.string().uuid().optional(),
});

const doctorQuestionsSchema = z.object({
  reportId: z.string().uuid(),
  userConcerns: z.string().max(1000).optional(),
});

const compareReportsSchema = z.object({
  reportId1: z.string().uuid(),
  reportId2: z.string().uuid(),
});

const updateNotesSchema = z.object({
  notes: z.string().max(5000),
});

const timelineSchema = z.object({
  familyMemberId: z.string().uuid().optional(),
  year: z.coerce.number().min(2000).max(2100).optional(),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MULTER CONFIG FOR FILE UPLOADS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request, 
  file: Express.Multer.File, 
  cb: multer.FileFilterCallback
) => {
  if (UPLOAD_LIMITS.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(ERROR_MESSAGES.INVALID_FILE_TYPE));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: UPLOAD_LIMITS.MAX_FILE_SIZE_BYTES,
  },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Get user's health plan and region from request
 */
function getUserHealthContext(req: Request): { 
  plan: HealthPlan; 
  region: HealthRegion;
  userId: string;
} {
  const user = (req as any).user;
  
  // Map main Soriva plan to Health plan
  // FREE/STARTER Soriva users get FREE Health
  // PLUS/PRO get PERSONAL Health
  // APEX gets FAMILY Health
  let plan: HealthPlan = 'FREE';
  
  const userPlan = user.planType || user.plan;
  
  if (userPlan === 'APEX') {
    plan = 'FAMILY';
  } else if (['PLUS', 'PRO'].includes(userPlan)) {
    plan = 'PERSONAL';
  }

  // Determine region from user's billing country or locale
  const userCountry = user.country || 'IN';
  const region: HealthRegion = userCountry === 'IN' ? 'IN' : 'INTERNATIONAL';

  return {
    plan,
    region,
    userId: user.userId || user.id,
  };
}

/**
 * Standard error response
 */
function sendError(
  res: Response, 
  status: number, 
  code: HealthErrorCode, 
  message: string,
  suggestion?: string
) {
  return res.status(status).json({
    success: false,
    error: {
      code,
      message,
      suggestion,
    },
  });
}

/**
 * Get first Zod error message
 */
function getZodErrorMessage(error: z.ZodError): string {
  return error.issues[0]?.message || 'Validation failed';
}

/**
 * Async handler wrapper
 */
function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTER SETUP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const router = Router();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// USAGE & LIMITS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * GET /health/usage
 * Get current usage and limits
 */
router.get('/usage', asyncHandler(async (req: Request, res: Response) => {
  const { userId, plan, region } = getUserHealthContext(req);
  
  const usage = await healthService.getUsage(userId);
  const limits = getPlanLimits(plan, region);

  return res.json({
    success: true,
    data: {
      plan,
      region,
      usage: {
        pages: {
          used: usage.pagesUploaded,
          limit: limits.pagesPerMonth,
          remaining: Math.max(0, limits.pagesPerMonth - usage.pagesUploaded),
          percentUsed: Math.round((usage.pagesUploaded / limits.pagesPerMonth) * 100),
        },
        tokens: {
          used: usage.tokensUsed,
          limit: limits.usesTokenPool ? 'shared' : limits.monthlyTokens,
          remaining: limits.usesTokenPool ? 'shared' : Math.max(0, limits.monthlyTokens - usage.tokensUsed),
          percentUsed: limits.usesTokenPool ? 0 : Math.round((usage.tokensUsed / limits.monthlyTokens) * 100),
        },
        comparisons: {
          used: usage.comparisonsUsed,
          limit: limits.comparisonsPerMonth,
          remaining: Math.max(0, limits.comparisonsPerMonth - usage.comparisonsUsed),
        },
      },
      features: limits.features,
      periodEnd: usage.periodEnd,
    },
    disclaimer: DISCLAIMERS.MAIN,
  });
}));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REPORT MANAGEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * POST /health/reports
 * Upload a new health report
 * - Uploads to Cloudinary
 * - Extracts text using Gemini Vision OCR
 * - Creates report record
 */
router.post(
  '/reports',
  upload.single('file'),
  asyncHandler(async (req: Request, res: Response) => {
    const { userId, plan, region } = getUserHealthContext(req);

    // Validate file
    if (!req.file) {
      return sendError(res, 400, 'UPLOAD_FAILED', 'No file provided');
    }

    // Validate body
    const parseResult = uploadReportSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, 400, 'UPLOAD_FAILED', getZodErrorMessage(parseResult.error));
    }

    const reportData = parseResult.data;

    // Use the new uploadReportWithFile method
    // This handles: Cloudinary upload + Gemini OCR + DB record
    const result = await healthService.uploadReportWithFile(
      userId,
      plan,
      region,
      {
        buffer: req.file.buffer,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
      reportData
    );

    if (!result.success) {
      const errorCode: HealthErrorCode = result.error?.includes('limit') 
        ? 'LIMIT_EXCEEDED' 
        : 'UPLOAD_FAILED';
      return sendError(res, 400, errorCode, result.error!);
    }

    return res.status(201).json({
      success: true,
      data: result.report,
      usage: result.usage,
      message: SUCCESS_MESSAGES.REPORT_UPLOADED,
      disclaimer: DISCLAIMERS.MAIN,
    });
  })
);

/**
 * GET /health/reports
 * List user's reports
 */
router.get('/reports', asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getUserHealthContext(req);

  const parseResult = listReportsSchema.safeParse(req.query);
  if (!parseResult.success) {
    return sendError(res, 400, 'UPLOAD_FAILED', getZodErrorMessage(parseResult.error));
  }

  const result = await healthService.listReports(userId, parseResult.data);

  return res.json({
    success: true,
    data: result.reports,
    pagination: result.pagination,
    disclaimer: DISCLAIMERS.MAIN,
  });
}));

/**
 * GET /health/reports/:id
 * Get single report
 */
router.get('/reports/:id', asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getUserHealthContext(req);
  const reportId = req.params.id;

  const report = await healthService.getReport(userId, reportId);

  if (!report) {
    return sendError(res, 404, 'REPORT_NOT_FOUND', ERROR_MESSAGES.REPORT_NOT_FOUND);
  }

  return res.json({
    success: true,
    data: report,
    disclaimer: DISCLAIMERS.MAIN,
  });
}));

/**
 * DELETE /health/reports/:id
 * Delete a report (also removes from Cloudinary)
 */
router.delete('/reports/:id', asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getUserHealthContext(req);
  const reportId = req.params.id;

  const deleted = await healthService.deleteReport(userId, reportId);

  if (!deleted) {
    return sendError(res, 404, 'REPORT_NOT_FOUND', ERROR_MESSAGES.REPORT_NOT_FOUND);
  }

  return res.json({
    success: true,
    message: SUCCESS_MESSAGES.REPORT_DELETED,
  });
}));

/**
 * PATCH /health/reports/:id/notes
 * Update report notes
 */
router.patch(
  '/reports/:id/notes',
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = getUserHealthContext(req);
    const reportId = req.params.id;

    const parseResult = updateNotesSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, 400, 'UPLOAD_FAILED', getZodErrorMessage(parseResult.error));
    }

    const updated = await healthService.updateReportNotes(
      userId,
      reportId,
      parseResult.data.notes
    );

    if (!updated) {
      return sendError(res, 404, 'REPORT_NOT_FOUND', ERROR_MESSAGES.REPORT_NOT_FOUND);
    }

    return res.json({
      success: true,
      message: SUCCESS_MESSAGES.NOTES_SAVED,
    });
  })
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEALTH CHAT (Educational Q&A)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * POST /health/chat
 * Send chat message about health reports
 * - Educational Q&A only
 * - No diagnosis or medical advice
 */
router.post(
  '/chat',
  asyncHandler(async (req: Request, res: Response) => {
    const { userId, plan, region } = getUserHealthContext(req);

    const parseResult = chatSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, 400, 'CHAT_ERROR', getZodErrorMessage(parseResult.error));
    }

    const result = await healthService.chat(
      userId,
      plan,
      region,
      parseResult.data
    );

    if (!result.success) {
      return sendError(res, 400, 'LIMIT_EXCEEDED', result.message);
    }

    return res.json({
      success: true,
      data: {
        message: result.message,
        sessionId: result.sessionId,
        tokensUsed: result.tokensUsed,
      },
      usage: result.usage,
      disclaimer: result.disclaimer,
    });
  })
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TERM EXPLANATION (Educational)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * POST /health/explain
 * Get plain-English explanation of medical term
 */
router.post(
  '/explain',
  asyncHandler(async (req: Request, res: Response) => {
    const { userId, plan, region } = getUserHealthContext(req);

    const parseResult = termExplanationSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, 400, 'CHAT_ERROR', getZodErrorMessage(parseResult.error));
    }

    const result = await healthService.explainTerm(
      userId,
      plan,
      region,
      parseResult.data
    );

    return res.json({
      success: true,
      data: {
        term: result.term,
        explanation: result.explanation,
        relatedTerms: result.relatedTerms,
      },
      disclaimer: result.disclaimer,
    });
  })
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DOCTOR QUESTIONS GENERATOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * POST /health/doctor-questions
 * Generate questions to ask doctor
 */
router.post(
  '/doctor-questions',
  asyncHandler(async (req: Request, res: Response) => {
    const { userId, plan, region } = getUserHealthContext(req);

    // Check feature availability first
    const limits = getPlanLimits(plan, region);
    if (!limits.features.questionGenerator) {
      return sendError(
        res, 
        403, 
        'FEATURE_NOT_AVAILABLE', 
        ERROR_MESSAGES.FEATURE_NOT_AVAILABLE,
        'Upgrade to Personal or Family plan to unlock this feature'
      );
    }

    const parseResult = doctorQuestionsSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, 400, 'CHAT_ERROR', getZodErrorMessage(parseResult.error));
    }

    const result = await healthService.generateDoctorQuestions(
      userId,
      plan,
      region,
      parseResult.data
    );

    return res.json({
      success: true,
      data: {
        questions: result.questions,
        note: result.note,
      },
      disclaimer: result.disclaimer,
    });
  })
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REPORT COMPARISON (Side-by-Side View)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * POST /health/compare
 * Compare two reports side-by-side
 * - Factual summary only
 * - NO analysis or interpretation
 */
router.post(
  '/compare',
  asyncHandler(async (req: Request, res: Response) => {
    const { userId, plan, region } = getUserHealthContext(req);

    // Check feature availability
    const limits = getPlanLimits(plan, region);
    if (!limits.features.compareReports) {
      return sendError(
        res, 
        403, 
        'FEATURE_NOT_AVAILABLE', 
        ERROR_MESSAGES.FEATURE_NOT_AVAILABLE,
        'Upgrade to Personal or Family plan to compare reports'
      );
    }

    const parseResult = compareReportsSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, 400, 'CHAT_ERROR', getZodErrorMessage(parseResult.error));
    }

    try {
      const result = await healthService.compareReports(
        userId,
        plan,
        region,
        parseResult.data
      );

      return res.json({
        success: true,
        data: {
          report1: result.report1,
          report2: result.report2,
          suggestion: result.suggestion,
        },
        disclaimer: result.disclaimer,
      });
    } catch (error: any) {
      if (error.message === ERROR_MESSAGES.REPORT_NOT_FOUND) {
        return sendError(res, 404, 'REPORT_NOT_FOUND', error.message);
      }
      if (error.message.includes('limit')) {
        return sendError(res, 400, 'LIMIT_EXCEEDED', error.message);
      }
      throw error;
    }
  })
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TIMELINE VIEW
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * GET /health/timeline
 * Get reports organized by timeline
 */
router.get('/timeline', asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getUserHealthContext(req);

  const parseResult = timelineSchema.safeParse(req.query);
  if (!parseResult.success) {
    return sendError(res, 400, 'CHAT_ERROR', getZodErrorMessage(parseResult.error));
  }

  const result = await healthService.getTimeline(userId, parseResult.data);

  return res.json({
    success: true,
    data: result.timeline,
    disclaimer: DISCLAIMERS.MAIN,
  });
}));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ERROR HANDLER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Health Controller Error:', err);

  // Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 400, 'FILE_TOO_LARGE', ERROR_MESSAGES.FILE_TOO_LARGE);
    }
    return sendError(res, 400, 'UPLOAD_FAILED', err.message);
  }

  // File type error
  if (err.message === ERROR_MESSAGES.INVALID_FILE_TYPE) {
    return sendError(res, 400, 'INVALID_FILE_TYPE', err.message);
  }

  // Generic error
  return sendError(
    res, 
    500, 
    'UPLOAD_FAILED', 
    'Something went wrong. Please try again.',
    'If the problem persists, contact support.'
  );
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export { router as healthController };