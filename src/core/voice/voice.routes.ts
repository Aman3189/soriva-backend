/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * VOICE ROUTES - SORIVA ONAIR
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Purpose: Define voice-related API routes for Soriva OnAir
 * Updated: December 2025 - Migrated to Gemini Live API
 * 
 * Routes:
 * - POST /api/voice/process        - Main voice endpoint (audio in → audio out)
 * - POST /api/voice/wake-word      - Wake word activation
 * - POST /api/voice/text-to-speech - Text to speech conversion
 * - GET  /api/voice/stats          - Voice usage statistics
 * - GET  /api/voice/limits         - Voice limits for user's plan
 * - GET  /api/voice/voices         - Available voice options
 * - GET  /api/voice/bonus          - 🆕 Bonus minutes status
 * - GET  /api/voice/pricing        - 🆕 Pricing info (internal)
 * 
 * Legacy (backward compatibility):
 * - POST /api/voice/transcribe     - Redirects to /process
 * - POST /api/voice/synthesize     - Redirects to /text-to-speech
 * 
 * Author: Aman (Risenex Global)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { Router } from 'express';
import VoiceController from './voice.controller';
import { authMiddleware as authenticate } from '../../modules/auth/middleware/auth.middleware';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTER INITIALIZATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const router = Router();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SORIVA ONAIR ROUTES (Primary)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * POST /api/voice/process
 * Main voice processing endpoint
 * - Receives audio input
 * - Returns audio response from Soriva
 * 
 * Body: { audio: base64String, mimeType?: string, voice?: string }
 * Response: { success, audio, inputTranscript, outputTranscript, duration, cost }
 */
router.post(
  '/process',
  authenticate,
  VoiceController.processVoice.bind(VoiceController)
);

/**
 * POST /api/voice/wake-word
 * Wake word activation endpoint
 * - Triggered when user says "Listen, Soriva" or "Hey Soriva"
 * - Returns personalized greeting
 * 
 * Body: { greeting?: string }
 * Response: { success, audio, message, duration, cost }
 */
router.post(
  '/wake-word',
  authenticate,
  VoiceController.handleWakeWord.bind(VoiceController)
);

/**
 * POST /api/voice/text-to-speech
 * Convert text to natural speech
 * 
 * Body: { text: string, voice?: string }
 * Response: { success, audio, text, duration, cost }
 */
router.post(
  '/text-to-speech',
  authenticate,
  VoiceController.textToSpeech.bind(VoiceController)
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INFORMATION ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * GET /api/voice/stats
 * Get voice usage statistics for current user
 * 
 * Response: { success, stats }
 */
router.get(
  '/stats',
  authenticate,
  VoiceController.getVoiceStats.bind(VoiceController)
);

/**
 * GET /api/voice/limits
 * Get voice limits based on user's plan
 * 
 * Response: { success, limits, status, features }
 */
router.get(
  '/limits',
  authenticate,
  VoiceController.getVoiceLimits.bind(VoiceController)
);

/**
 * GET /api/voice/voices
 * Get available voice options
 * 
 * Response: { success, voices, default, recommended }
 */
router.get(
  '/voices',
  authenticate,
  VoiceController.getAvailableVoices.bind(VoiceController)
);

/**
 * GET /api/voice/bonus
 * Get bonus minutes status for current user
 * 
 * Response: { success, bonus, message }
 */
router.get(
  '/bonus',
  authenticate,
  VoiceController.getBonusStatus.bind(VoiceController)
);

/**
 * GET /api/voice/pricing
 * Get voice pricing information (internal/admin use)
 * 
 * Response: { success, pricing, breakdown, examples }
 */
router.get(
  '/pricing',
  authenticate,
  VoiceController.getPricingInfo.bind(VoiceController)
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LEGACY ROUTES (Backward Compatibility)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * POST /api/voice/transcribe
 * LEGACY: Speech-to-Text
 * Redirects to /process for OnAir handling
 * 
 * @deprecated Use /process instead
 */
router.post(
  '/transcribe',
  authenticate,
  VoiceController.transcribeAudio.bind(VoiceController)
);

/**
 * POST /api/voice/synthesize
 * LEGACY: Text-to-Speech
 * Redirects to /text-to-speech for OnAir handling
 * 
 * @deprecated Use /text-to-speech instead
 */
router.post(
  '/synthesize',
  authenticate,
  VoiceController.synthesizeSpeech.bind(VoiceController)
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEALTH CHECK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * GET /api/voice/health
 * Voice service health check (no auth required)
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'Soriva OnAir',
    technology: 'Gemini Live API',
    status: 'operational',
    version: '2.0.0',
    features: [
      'Real-time voice conversations',
      'Natural language understanding',
      'Multi-language support (EN/HI)',
      'Voice activity detection',
      'Low-latency responses',
      'Dynamic bonus minutes'
    ]
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default router;