// ═══════════════════════════════════════════════════════════════
// CURRENCY ROUTES - Exchange Rate API Routes
// ═══════════════════════════════════════════════════════════════

import { Router } from 'express';
import currencyController from '../controllers/currency.controller';

const router = Router();

// ─────────────────────────────────────────────────────────────
// PUBLIC ROUTES (No authentication required)
// ─────────────────────────────────────────────────────────────

// GET /api/currency/rates - Get all exchange rates
router.get('/rates', currencyController.getExchangeRates);

// GET /api/currency/detect - Detect user's currency from country
router.get('/detect', currencyController.detectCurrency);

// GET /api/currency/pricing - Get pricing in local currency
router.get('/pricing', currencyController.getLocalizedPricing);

// POST /api/currency/convert - Convert between currencies
router.post('/convert', currencyController.convertCurrency);

// ─────────────────────────────────────────────────────────────
// ADMIN/INTERNAL ROUTES
// ─────────────────────────────────────────────────────────────

// POST /api/currency/refresh - Manually refresh rates (for cron/admin)
router.post('/refresh', currencyController.refreshExchangeRates);

export default router;