/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * VOICE ROUTES
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Purpose: Define voice-related API routes
 * 
 * Routes:
 * - POST   /api/voice/wake-word   - Wake word activation ("Listen, Soriva")
 * - POST   /api/voice/transcribe  - Speech-to-Text (audio → text)
 * - POST   /api/voice/synthesize  - Text-to-Speech (text → audio)
 * - GET    /api/voice/stats       - Usage statistics
 * - GET    /api/voice/limits      - Voice limits info
 * 
 * All routes require authentication middleware
 * 
 * Author: Aman (Risenex Global)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import express, { Router } from 'express';
import voiceController from './voice.controller';
import { authMiddleware } from '../../modules/auth/middleware/auth.middleware';

const router: Router = express.Router();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VOICE ROUTES (All require authentication)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * POST /api/voice/wake-word
 * 
 * Handle wake word activation: "Listen, Soriva"
 * Returns personalized TTS response: "Yes, [User Name]"
 * 
 * Auth: Required
 * Body: None (uses authenticated user's name)
 * Response: { success, audio, message, duration, cost }
 */
router.post('/wake-word', authMiddleware, (req, res) => {
  voiceController.handleWakeWord(req, res);
});

/**
 * POST /api/voice/transcribe
 * 
 * Transcribe audio to text using Whisper API
 * 
 * Auth: Required
 * Body: { audio: base64String, mimeType: string }
 * Response: { success, text, duration, cost }
 * 
 * Limits:
 * - Max 15 seconds per request
 * - 9 minutes total STT per month
 */
router.post('/transcribe', authMiddleware, (req, res) => {
  voiceController.transcribeAudio(req, res);
});

/**
 * POST /api/voice/synthesize
 * 
 * Synthesize text to speech using Azure Neural TTS
 * 
 * Auth: Required
 * Body: { text: string }
 * Response: { success, audio, text, characterCount, duration, cost }
 * 
 * Limits:
 * - Max 30 seconds per response (~450 characters)
 * - 36 minutes total TTS per month
 */
router.post('/synthesize', authMiddleware, (req, res) => {
  voiceController.synthesizeSpeech(req, res);
});

/**
 * GET /api/voice/stats
 * 
 * Get voice usage statistics for authenticated user
 * 
 * Auth: Required
 * Response: { success, stats }
 * 
 * Stats include:
 * - totalMinutesUsed, sttSecondsUsed, ttsSecondsUsed
 * - requestCount, lastUsedAt
 * - limits (monthly, STT, TTS)
 * - remaining (total, STT, TTS)
 * - percentageUsed
 */
router.get('/stats', authMiddleware, (req, res) => {
  voiceController.getVoiceStats(req, res);
});

/**
 * GET /api/voice/limits
 * 
 * Get voice limits configuration (public info)
 * 
 * Auth: Required
 * Response: { success, limits }
 * 
 * Limits include:
 * - monthlyMinutes: 45
 * - sttMinutes: 9
 * - ttsMinutes: 36
 * - maxSttSecondsPerRequest: 15
 * - maxTtsSecondsPerRequest: 30
 */
router.get('/limits', authMiddleware, (req, res) => {
  voiceController.getVoiceLimits(req, res);
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default router;