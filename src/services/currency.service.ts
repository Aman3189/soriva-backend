// ═══════════════════════════════════════════════════════════════
// CURRENCY SERVICE - Exchange Rate Management
// ═══════════════════════════════════════════════════════════════

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Supported currencies with their details
export const SUPPORTED_CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
  INR: { symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  GBP: { symbol: '£', name: 'British Pound', locale: 'en-GB' },
  EUR: { symbol: '€', name: 'Euro', locale: 'de-DE' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
} as const;

export type SupportedCurrency = keyof typeof SUPPORTED_CURRENCIES;

// Country to Currency mapping
export const COUNTRY_CURRENCY_MAP: Record<string, SupportedCurrency> = {
  // India
  IN: 'INR',
  // USA
  US: 'USD',
  // UK
  GB: 'GBP',
  // Europe
  DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR', BE: 'EUR',
  AT: 'EUR', PT: 'EUR', IE: 'EUR', FI: 'EUR', GR: 'EUR',
  // Middle East
  AE: 'AED', SA: 'AED', QA: 'AED', KW: 'AED', BH: 'AED', OM: 'AED',
  // Canada
  CA: 'CAD',
  // Australia
  AU: 'AUD',
  // Singapore
  SG: 'SGD',
};

// ─────────────────────────────────────────────────────────────
// API RESPONSE TYPE
// ─────────────────────────────────────────────────────────────

interface ExchangeRateAPIResponse {
  result: string;
  'error-type'?: string;
  conversion_rates: Record<string, number>;
}

// ─────────────────────────────────────────────────────────────
// FETCH RATES FROM EXTERNAL API
// ─────────────────────────────────────────────────────────────

export async function fetchExchangeRatesFromAPI(): Promise<Record<string, number>> {
  try {
    // Using ExchangeRate-API (free tier: 1500 requests/month)
    // Sign up at: https://www.exchangerate-api.com/
    const API_KEY = process.env.EXCHANGE_RATE_API_KEY;
    
    if (!API_KEY) {
      console.warn('EXCHANGE_RATE_API_KEY not set, using fallback rates');
      return getFallbackRates();
    }

    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json() as ExchangeRateAPIResponse;

    if (data.result !== 'success') {
      throw new Error(`API error: ${data['error-type']}`);
    }

    // Extract only supported currencies
    const rates: Record<string, number> = { USD: 1 };
    
    for (const currency of Object.keys(SUPPORTED_CURRENCIES)) {
      if (data.conversion_rates[currency]) {
        rates[currency] = data.conversion_rates[currency];
      }
    }

    return rates;
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    return getFallbackRates();
  }
}

// Fallback rates (approximate) - used when API fails
function getFallbackRates(): Record<string, number> {
  return {
    USD: 1,
    INR: 83.5,
    GBP: 0.79,
    EUR: 0.92,
    AED: 3.67,
    CAD: 1.36,
    AUD: 1.53,
    SGD: 1.34,
  };
}

// ─────────────────────────────────────────────────────────────
// DATABASE OPERATIONS
// ─────────────────────────────────────────────────────────────

export async function updateExchangeRatesInDB(): Promise<void> {
  const rates = await fetchExchangeRatesFromAPI();

  for (const [currency, rate] of Object.entries(rates)) {
    await prisma.exchangeRate.upsert({
      where: { currency },
      update: { rate },
      create: { currency, rate },
    });
  }

  console.log(`✅ Exchange rates updated at ${new Date().toISOString()}`);
}

export async function getExchangeRatesFromDB(): Promise<Record<string, number>> {
  const rates = await prisma.exchangeRate.findMany();

  if (rates.length === 0) {
    // If DB is empty, fetch and store rates first
    await updateExchangeRatesInDB();
    return getExchangeRatesFromDB();
  }

  const rateMap: Record<string, number> = {};
  for (const rate of rates) {
    rateMap[rate.currency] = rate.rate;
  }

  return rateMap;
}

export async function getLastUpdatedTime(): Promise<Date | null> {
  const rate = await prisma.exchangeRate.findFirst({
    orderBy: { updatedAt: 'desc' },
  });

  return rate?.updatedAt || null;
}

// ─────────────────────────────────────────────────────────────
// CONVERSION UTILITIES
// ─────────────────────────────────────────────────────────────

export async function convertCurrency(
  amount: number,
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency
): Promise<number> {
  if (fromCurrency === toCurrency) return amount;

  const rates = await getExchangeRatesFromDB();

  // Convert to USD first, then to target currency
  const amountInUSD = amount / rates[fromCurrency];
  const convertedAmount = amountInUSD * rates[toCurrency];

  // Round to 2 decimal places
  return Math.round(convertedAmount * 100) / 100;
}

export function formatCurrency(
  amount: number,
  currency: SupportedCurrency
): string {
  const { locale } = SUPPORTED_CURRENCIES[currency];

  // Special handling for INR
  if (currency === 'INR') {
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getCurrencyFromCountry(countryCode: string): SupportedCurrency {
  return COUNTRY_CURRENCY_MAP[countryCode.toUpperCase()] || 'USD';
}

// ─────────────────────────────────────────────────────────────
// EXPORT ALL
// ─────────────────────────────────────────────────────────────

export default {
  fetchExchangeRatesFromAPI,
  updateExchangeRatesInDB,
  getExchangeRatesFromDB,
  getLastUpdatedTime,
  convertCurrency,
  formatCurrency,
  getCurrencyFromCountry,
  SUPPORTED_CURRENCIES,
  COUNTRY_CURRENCY_MAP,
};