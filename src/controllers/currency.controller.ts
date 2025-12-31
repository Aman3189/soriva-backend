// ═══════════════════════════════════════════════════════════════
// CURRENCY CONTROLLER - Exchange Rate API Endpoints
// ═══════════════════════════════════════════════════════════════

import { Request, Response } from 'express';
import currencyService, {
  SupportedCurrency,
  SUPPORTED_CURRENCIES,
  COUNTRY_CURRENCY_MAP,
} from '../services/currency.service';

// ─────────────────────────────────────────────────────────────
// GET /api/currency/rates
// Get all cached exchange rates
// ─────────────────────────────────────────────────────────────

export async function getExchangeRates(req: Request, res: Response) {
  try {
    const rates = await currencyService.getExchangeRatesFromDB();
    const lastUpdated = await currencyService.getLastUpdatedTime();

    res.json({
      success: true,
      data: {
        base: 'USD',
        rates,
        currencies: SUPPORTED_CURRENCIES,
        lastUpdated: lastUpdated?.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch exchange rates',
    });
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/currency/refresh
// Manually refresh exchange rates (admin only)
// ─────────────────────────────────────────────────────────────

export async function refreshExchangeRates(req: Request, res: Response) {
  try {
    // Optional: Add admin authentication check here
    // if (!req.user?.isAdmin) {
    //   return res.status(403).json({ success: false, error: 'Unauthorized' });
    // }

    await currencyService.updateExchangeRatesInDB();
    const rates = await currencyService.getExchangeRatesFromDB();

    res.json({
      success: true,
      message: 'Exchange rates refreshed successfully',
      data: { rates },
    });
  } catch (error) {
    console.error('Error refreshing exchange rates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh exchange rates',
    });
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/currency/convert
// Convert amount between currencies
// ─────────────────────────────────────────────────────────────

export async function convertCurrency(req: Request, res: Response) {
  try {
    const { amount, from, to } = req.body;

    // Validation
    if (typeof amount !== 'number' || amount < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount',
      });
    }

    if (!SUPPORTED_CURRENCIES[from as SupportedCurrency]) {
      return res.status(400).json({
        success: false,
        error: `Unsupported currency: ${from}`,
      });
    }

    if (!SUPPORTED_CURRENCIES[to as SupportedCurrency]) {
      return res.status(400).json({
        success: false,
        error: `Unsupported currency: ${to}`,
      });
    }

    const convertedAmount = await currencyService.convertCurrency(
      amount,
      from as SupportedCurrency,
      to as SupportedCurrency
    );

    const formattedAmount = currencyService.formatCurrency(
      convertedAmount,
      to as SupportedCurrency
    );

    res.json({
      success: true,
      data: {
        originalAmount: amount,
        originalCurrency: from,
        convertedAmount,
        convertedCurrency: to,
        formatted: formattedAmount,
      },
    });
  } catch (error) {
    console.error('Error converting currency:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to convert currency',
    });
  }
}

// ─────────────────────────────────────────────────────────────
// GET /api/currency/detect
// Detect currency from country code or IP
// ─────────────────────────────────────────────────────────────

export async function detectCurrency(req: Request, res: Response) {
  try {
    // Get country from query param or IP-based detection
    const countryCode = req.query.country as string || 
                        req.headers['cf-ipcountry'] as string ||  // Cloudflare
                        req.headers['x-vercel-ip-country'] as string ||  // Vercel
                        'US';  // Default

    const currency = currencyService.getCurrencyFromCountry(countryCode);
    const currencyInfo = SUPPORTED_CURRENCIES[currency];

    res.json({
      success: true,
      data: {
        countryCode: countryCode.toUpperCase(),
        currency,
        symbol: currencyInfo.symbol,
        name: currencyInfo.name,
      },
    });
  } catch (error) {
    console.error('Error detecting currency:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to detect currency',
    });
  }
}

// ─────────────────────────────────────────────────────────────
// GET /api/currency/pricing
// Get pricing in user's local currency
// ─────────────────────────────────────────────────────────────

export async function getLocalizedPricing(req: Request, res: Response) {
  try {
    const countryCode = req.query.country as string ||
                        req.headers['cf-ipcountry'] as string ||
                        req.headers['x-vercel-ip-country'] as string ||
                        'US';

    const currency = currencyService.getCurrencyFromCountry(countryCode);
    const rates = await currencyService.getExchangeRatesFromDB();
    const rate = rates[currency] || 1;

    // Base pricing in USD
    const basePricing = {
      SUBSCRIPTION: {
        STARTER: { monthly: 0, yearly: 0 },
        PLUS: { monthly: 15.99, yearly: 159.99 },
        PRO: { monthly: 29.99, yearly: 299.99 },
        APEX: { monthly: 49.99, yearly: 499.99 },
      },
      HEALTH: {
        FREE: { monthly: 0, yearly: 0 },
        PERSONAL: { monthly: 4.99, yearly: 49.90 },
        FAMILY: { monthly: 9.99, yearly: 99.90 },
      },
      STUDIO_BOOSTER: {
        LITE: 2.99,
        PRO: 7.99,
        MAX: 14.99,
      },
      VOICE_PACK: {
        SMALL: 4.99,
        MEDIUM: 8.99,
        LARGE: 14.99,
        PER_MINUTE: 0.05,
      },
    };

    // Convert to local currency
    const convertPrice = (price: number) => Math.round(price * rate * 100) / 100;
    const formatPrice = (price: number) => currencyService.formatCurrency(price, currency);

    const localizedPricing = {
      currency,
      symbol: SUPPORTED_CURRENCIES[currency].symbol,
      rate,
      SUBSCRIPTION: {
        STARTER: {
          monthly: { amount: 0, formatted: formatPrice(0) },
          yearly: { amount: 0, formatted: formatPrice(0) },
        },
        PLUS: {
          monthly: { amount: convertPrice(15.99), formatted: formatPrice(convertPrice(15.99)) },
          yearly: { amount: convertPrice(159.99), formatted: formatPrice(convertPrice(159.99)) },
        },
        PRO: {
          monthly: { amount: convertPrice(29.99), formatted: formatPrice(convertPrice(29.99)) },
          yearly: { amount: convertPrice(299.99), formatted: formatPrice(convertPrice(299.99)) },
        },
        APEX: {
          monthly: { amount: convertPrice(49.99), formatted: formatPrice(convertPrice(49.99)) },
          yearly: { amount: convertPrice(499.99), formatted: formatPrice(convertPrice(499.99)) },
        },
      },
      HEALTH: {
        FREE: {
          monthly: { amount: 0, formatted: formatPrice(0) },
          yearly: { amount: 0, formatted: formatPrice(0) },
        },
        PERSONAL: {
          monthly: { amount: convertPrice(4.99), formatted: formatPrice(convertPrice(4.99)) },
          yearly: { amount: convertPrice(49.90), formatted: formatPrice(convertPrice(49.90)) },
        },
        FAMILY: {
          monthly: { amount: convertPrice(9.99), formatted: formatPrice(convertPrice(9.99)) },
          yearly: { amount: convertPrice(99.90), formatted: formatPrice(convertPrice(99.90)) },
        },
      },
      STUDIO_BOOSTER: {
        LITE: { amount: convertPrice(2.99), formatted: formatPrice(convertPrice(2.99)) },
        PRO: { amount: convertPrice(7.99), formatted: formatPrice(convertPrice(7.99)) },
        MAX: { amount: convertPrice(14.99), formatted: formatPrice(convertPrice(14.99)) },
      },
      VOICE_PACK: {
        SMALL: { amount: convertPrice(4.99), formatted: formatPrice(convertPrice(4.99)) },
        MEDIUM: { amount: convertPrice(8.99), formatted: formatPrice(convertPrice(8.99)) },
        LARGE: { amount: convertPrice(14.99), formatted: formatPrice(convertPrice(14.99)) },
        PER_MINUTE: { amount: convertPrice(0.05), formatted: formatPrice(convertPrice(0.05)) },
      },
    };

    res.json({
      success: true,
      data: localizedPricing,
    });
  } catch (error) {
    console.error('Error getting localized pricing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get localized pricing',
    });
  }
}

export default {
  getExchangeRates,
  refreshExchangeRates,
  convertCurrency,
  detectCurrency,
  getLocalizedPricing,
};