// src/modules/astrology/astrology.routes.ts

import { Router } from 'express';
import { astrologyServiceV2 } from '../../services/astrology/astrology.service';

const router = Router();

/**
 * POST /api/astrology/kundli
 * Generate Kundli based on birth details
 */
router.post('/kundli', async (req, res) => {
  try {
    const { date, time, latitude, longitude, timezone } = req.body;

    // Validation
    if (!date || !time || latitude === undefined || longitude === undefined) {
      res.status(400).json({
        success: false,
        message: 'Required fields: date (YYYY-MM-DD), time (HH:MM), latitude, longitude',
      });
      return;
    }

    const birthDetails = {
      date,
      time,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timezone: parseFloat(timezone) || 5.5, // Default IST
    };

    console.log('[Astrology API] 🔮 Generating Kundli for:', birthDetails);

    const result = await astrologyServiceV2.getKundli(birthDetails);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error: any) {
    console.error('[Astrology API] ❌ Error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
/**
 * GET /api/astrology/daily-horoscope/:sign
 * Get daily horoscope for a specific zodiac sign
 */
router.get('/daily-horoscope/:sign', async (req, res) => {
  try {
    const { sign } = req.params;

    if (!sign) {
      res.status(400).json({
        success: false,
        message: 'Sign is required (e.g., aries, taurus, gemini)',
      });
      return;
    }

    console.log('[Astrology API] 🔮 Getting daily horoscope for:', sign);

    const result = await astrologyServiceV2.getDailyHoroscope(sign);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error: any) {
    console.error('[Astrology API] ❌ Error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/astrology/health
/**
 * GET /api/astrology/health
 * Health check for astrology service
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Astrology service is running 🔮',
    version: '2.0',
    features: ['Kundli', 'Moon Sign', 'Nakshatra', 'Mahadasha', 'Planetary Positions'],
  });
});

export default router;