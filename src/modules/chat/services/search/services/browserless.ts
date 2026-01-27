/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SEARCH - BROWSERLESS SERVICE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Path: services/search/services/browserless.ts
 * 
 * PURPOSE:
 * Fetch content from JS-heavy sites like Zomato, JustDial, etc.
 * Uses Browserless.io cloud service (1000 free units/month)
 * 
 * WHEN TO USE:
 * - Local business queries (restaurants, hotels, hospitals)
 * - Sites where normal WebFetch fails (< 300 chars)
 * - JS-rendered content
 * 
 * COST:
 * - Free tier: 1000 units/month
 * - 1 unit = 30 seconds browser time
 * - Most fetches = 1 unit (< 30 sec)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import puppeteer, { Page, Browser } from 'puppeteer-core';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface BrowserlessResult {
  success: boolean;
  url: string;
  title: string;
  content: string;
  contentLength: number;
  promptTokens: number;
  timeMs: number;
  error?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const BROWSERLESS_TOKEN = process.env.BROWSERLESS_API_KEY || '';
const BROWSERLESS_ENDPOINT = `wss://production-sfo.browserless.io?token=${BROWSERLESS_TOKEN}`;

// Sites that need Browserless (JS-heavy local business sites)
const BROWSERLESS_SITES = [
  'zomato.com',
  'justdial.com',
  'practo.com',
  'swiggy.com',
  'magicpin.com',
  'yelp.com',
  'tripadvisor.com',
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UTILITIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return '';
  }
}

function sanitize(text: string): string {
  return text
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN SERVICE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const BrowserlessService = {
  
  /**
   * Check if URL needs Browserless
   */
  needsBrowserless(url: string): boolean {
    const host = getHostname(url);
    if (!host) return false;
    return BROWSERLESS_SITES.some(site => host.includes(site));
  },

  /**
   * Check if Browserless is configured
   */
  isConfigured(): boolean {
    return !!BROWSERLESS_TOKEN && BROWSERLESS_TOKEN.length > 10;
  },

  /**
   * Fetch content using Browserless (headless Chrome)
   */
  async fetch(url: string, maxChars = 1500): Promise<BrowserlessResult> {
    const start = Date.now();

    // Check if token is configured
    if (!this.isConfigured()) {
      console.log('[Browserless] ⚠️ API key not configured');
      return this.fail(url, start, 'API key not configured');
    }

    let browser: Browser | null = null;

    try {
      console.log(`[Browserless] 🌐 Connecting to cloud browser...`);
      
      // Connect to Browserless cloud
      browser = await puppeteer.connect({
        browserWSEndpoint: BROWSERLESS_ENDPOINT,
      });

      const page: Page = await browser.newPage();
      
      // Set viewport and user agent
      await page.setViewport({ width: 1280, height: 800 });
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      );

      // Navigate to URL
      console.log(`[Browserless] 📄 Loading: ${url}`);
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 20000,
      });

      // Wait a bit for dynamic content (using evaluate instead of deprecated waitForTimeout)
      await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));

      // Extract content based on site type
      const host = getHostname(url);
      let content = '';
      let title = '';

      if (host.includes('zomato.com')) {
        content = await this.extractZomato(page);
        title = await page.title();
      } else if (host.includes('justdial.com')) {
        content = await this.extractJustDial(page);
        title = await page.title();
      } else {
        // Generic extraction
        const result = await page.evaluate(() => {
          const title = document.title || '';
          const paragraphs = Array.from(document.querySelectorAll('p, h1, h2, h3, li'));
          const text = paragraphs
            .map(el => el.textContent?.trim())
            .filter((t): t is string => !!t && t.length > 20)
            .join('\n');
          return { title, text };
        });
        title = result.title;
        content = result.text;
      }

      // Close browser
      await browser.close();

      // Sanitize and truncate
      content = sanitize(content).slice(0, maxChars);

      if (content.length < 100) {
        console.log(`[Browserless] ⚠️ Insufficient content: ${content.length} chars`);
        return this.fail(url, start, 'Insufficient content');
      }

      const timeMs = Date.now() - start;
      console.log(`[Browserless] ✅ Extracted ${content.length} chars in ${timeMs}ms`);

      return {
        success: true,
        url,
        title: title.slice(0, 200),
        content,
        contentLength: content.length,
        promptTokens: Math.ceil(content.length / 4),
        timeMs,
      };

    } catch (error: any) {
      if (browser) {
        try { await browser.close(); } catch {}
      }
      console.error(`[Browserless] ❌ Error:`, error.message);
      return this.fail(url, start, error.message);
    }
  },

  /**
   * Extract restaurant data from Zomato
   */
  async extractZomato(page: Page): Promise<string> {
    return page.evaluate(() => {
      const results: string[] = [];
      
      // Try multiple extraction strategies
      
      // Strategy 1: Look for restaurant name patterns in any element
      const allText = document.body.innerText;
      const lines = allText.split('\n').filter(line => line.trim().length > 3);
      
      // Strategy 2: Find elements with rating patterns (4.2, 3.8, etc)
      const ratingPattern = /^\d\.\d$/;
      
      // Strategy 3: Get all heading-like elements
      const headings = document.querySelectorAll('h1, h2, h3, h4, [role="heading"]');
      headings.forEach((el: Element, index: number) => {
        if (index >= 15) return;
        const text = el.textContent?.trim();
        if (text && text.length > 3 && text.length < 100) {
          // Skip common UI text
          if (!text.match(/login|sign|menu|filter|sort|home|search|delivery/i)) {
            results.push(text);
          }
        }
      });

      // Strategy 4: Look for divs/sections that might contain restaurant cards
      const cards = document.querySelectorAll('[class*="card"], [class*="item"], [class*="result"], [class*="resto"], [class*="restaurant"]');
      cards.forEach((card: Element, index: number) => {
        if (index >= 10) return;
        const text = card.textContent?.trim().slice(0, 200);
        if (text && text.length > 20) {
          results.push(text);
        }
      });

      // Strategy 5: If nothing found, get meaningful text blocks
      if (results.length === 0) {
        const paragraphs = document.querySelectorAll('p, span, div');
        const seen = new Set<string>();
        paragraphs.forEach((el: Element) => {
          const text = el.textContent?.trim();
          if (text && text.length > 30 && text.length < 150 && !seen.has(text)) {
            if (!text.match(/cookie|privacy|terms|login|sign up/i)) {
              seen.add(text);
              if (results.length < 15) results.push(text);
            }
          }
        });
      }

      // Deduplicate and clean
      const unique = [...new Set(results)].slice(0, 10);
      
      return unique.length > 0 
        ? unique.join('\n')
        : document.body.innerText.slice(0, 1500);
    });
  },

  /**
   * Extract business data from JustDial
   */
  async extractJustDial(page: Page): Promise<string> {
    return page.evaluate(() => {
      const results: string[] = [];
      
      // Strategy 1: Get all text content and parse it
      const allText = document.body.innerText;
      
      // Strategy 2: Look for listing-like patterns
      const headings = document.querySelectorAll('h2, h3, [class*="name"], [class*="title"], [class*="heading"]');
      headings.forEach((el: Element, index: number) => {
        if (index >= 15) return;
        const text = el.textContent?.trim();
        if (text && text.length > 3 && text.length < 100) {
          if (!text.match(/login|sign|filter|sort|home|justdial/i)) {
            results.push(text);
          }
        }
      });

      // Strategy 3: Find any rating/review patterns
      const ratings = document.querySelectorAll('[class*="rating"], [class*="star"], [class*="review"]');
      ratings.forEach((el: Element, index: number) => {
        if (index >= 10) return;
        const parent = el.closest('div, section, article');
        if (parent) {
          const text = parent.textContent?.trim().slice(0, 200);
          if (text && text.length > 20) {
            results.push(text);
          }
        }
      });

      // Strategy 4: Generic card extraction
      if (results.length === 0) {
        const cards = document.querySelectorAll('[class*="card"], [class*="list"], [class*="item"], [class*="result"]');
        cards.forEach((card: Element, index: number) => {
          if (index >= 10) return;
          const text = card.textContent?.trim().slice(0, 200);
          if (text && text.length > 30) {
            results.push(text);
          }
        });
      }

      // Deduplicate
      const unique = [...new Set(results)].slice(0, 10);
      
      return unique.length > 0 
        ? unique.join('\n')
        : allText.slice(0, 1500);
    });
  },

  /**
   * Helper: Return failure result
   */
  fail(url: string, start: number, error: string): BrowserlessResult {
    return {
      success: false,
      url,
      title: '',
      content: '',
      contentLength: 0,
      promptTokens: 0,
      timeMs: Date.now() - start,
      error,
    };
  },
};

export default BrowserlessService;