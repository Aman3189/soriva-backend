// src/modules/chatbot-api/utils/chatbot.helpers.ts

import type { QuickReplyOption } from '../chatbot.types';

/**
 * Generate unique visitor ID
 */
export function generateVisitorId(): string {
  return `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .slice(0, 2000) // Max 2000 chars
    .replace(/<[^>]*>/g, ''); // Strip HTML tags
}

/**
 * Parse quick reply options from AI response
 */
export function parseQuickReplies(content: string): {
  cleanContent: string;
  options: QuickReplyOption[];
} {
  const optionRegex = /\[OPTION:(.*?)\|(.*?)\]/g;
  const options: QuickReplyOption[] = [];
  let match;
  let index = 0;

  while ((match = optionRegex.exec(content)) !== null) {
    options.push({
      id: `opt_${index++}`,
      label: match[1].trim(),
      value: match[2].trim(),
      action: 'send_message'
    });
  }

  const cleanContent = content.replace(optionRegex, '').trim();

  return { cleanContent, options };
}

/**
 * Format latency for logging
 */
export function formatLatency(startTime: number): number {
  return Math.round(performance.now() - startTime);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone format (basic)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-+()]{8,20}$/;
  return phoneRegex.test(phone);
}

/**
 * Mask sensitive data for logging
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  return `${local.slice(0, 2)}***@${domain}`;
}

/**
 * Calculate simple lead score based on data completeness
 */
export function calculateLeadScore(data: {
  name?: string;
  email?: string;
  phone?: string;
  customFields?: Record<string, unknown>;
}): number {
  let score = 0;
  
  if (data.name) score += 25;
  if (data.email && isValidEmail(data.email)) score += 35;
  if (data.phone && isValidPhone(data.phone)) score += 25;
  if (data.customFields && Object.keys(data.customFields).length > 0) score += 15;
  
  return score;
}