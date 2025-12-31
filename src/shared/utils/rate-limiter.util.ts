// src/shared/utils/rate-limiter.util.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// In-Memory Rate Limiter Utility
// Pattern: FUNCTIONAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const requests: Map<string, number[]> = new Map();

const cleanup = (windowMs: number): void => {
  const now = Date.now();
  for (const [userId, timestamps] of requests.entries()) {
    const recentRequests = timestamps.filter((ts) => now - ts < windowMs);
    if (recentRequests.length === 0) {
      requests.delete(userId);
    } else {
      requests.set(userId, recentRequests);
    }
  }
};

export const check = (userId: string, maxRequests: number, windowMs: number): boolean => {
  const now = Date.now();
  const userRequests = requests.get(userId) || [];

  // Filter out old requests outside the window
  const recentRequests = userRequests.filter((timestamp) => now - timestamp < windowMs);

  // Check if limit exceeded
  if (recentRequests.length >= maxRequests) {
    return false;
  }

  // Add current request
  recentRequests.push(now);
  requests.set(userId, recentRequests);

  // Cleanup old entries periodically (1% chance)
  if (Math.random() < 0.01) {
    cleanup(windowMs);
  }

  return true;
};

export const reset = (userId: string): void => {
  requests.delete(userId);
};

export const resetAll = (): void => {
  requests.clear();
};

export const getRequestCount = (userId: string, windowMs: number): number => {
  const now = Date.now();
  const userRequests = requests.get(userId) || [];
  return userRequests.filter((ts) => now - ts < windowMs).length;
};

// Namespace export for backward compatibility
export const RateLimiter = {
  check,
  reset,
  resetAll,
  getRequestCount,
} as const;

export default RateLimiter;