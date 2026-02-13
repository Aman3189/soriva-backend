/**
 * Type extensions for @google/generative-ai
 * Google Grounding tool support
 */

import '@google/generative-ai';

declare module '@google/generative-ai' {
  interface GoogleSearchTool {
    googleSearch: Record<string, never>;
  }

  interface Tool {
    googleSearch?: Record<string, never>;
  }
}