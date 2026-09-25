/**
 * In-memory sliding-window security rate limiter
 * Protects authentication endpoints from brute-force and credential stuffing attacks
 */

interface RateLimitRecord {
  attempts: number;
  firstAttemptAt: number;
  lockedUntil?: number;
}

const store = new Map<string, RateLimitRecord>();

// Clean up stale entries every 10 minutes to prevent memory leak
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (record.lockedUntil && record.lockedUntil < now) {
        store.delete(key);
      } else if (!record.lockedUntil && now - record.firstAttemptAt > 60 * 60 * 1000) {
        store.delete(key);
      }
    }
  }, 10 * 60 * 1000);
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const ip = forwarded.split(',')[0].trim();
    if (ip) return ip;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();
  return '127.0.0.1';
}

export interface RateLimitResult {
  isLocked: boolean;
  remainingAttempts: number;
  retryAfterSeconds?: number;
}

export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  lockoutDurationMs: number = 15 * 60 * 1000
): RateLimitResult {
  const now = Date.now();
  const record = store.get(key);

  if (!record) {
    return {
      isLocked: false,
      remainingAttempts: maxAttempts,
    };
  }

  // Check if currently in locked period
  if (record.lockedUntil && record.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      isLocked: true,
      remainingAttempts: 0,
      retryAfterSeconds,
    };
  }

  // If lockout has expired, reset record
  if (record.lockedUntil && record.lockedUntil <= now) {
    store.delete(key);
    return {
      isLocked: false,
      remainingAttempts: maxAttempts,
    };
  }

  // Check if current attempts window has expired (1 hour window)
  if (now - record.firstAttemptAt > lockoutDurationMs) {
    store.delete(key);
    return {
      isLocked: false,
      remainingAttempts: maxAttempts,
    };
  }

  const remaining = Math.max(0, maxAttempts - record.attempts);
  return {
    isLocked: remaining <= 0,
    remainingAttempts: remaining,
  };
}

export function recordFailedAttempt(
  key: string,
  maxAttempts: number = 5,
  lockoutDurationMs: number = 15 * 60 * 1000
): RateLimitResult {
  const now = Date.now();
  let record = store.get(key);

  if (!record || now - record.firstAttemptAt > lockoutDurationMs) {
    record = {
      attempts: 1,
      firstAttemptAt: now,
    };
  } else {
    record.attempts += 1;
  }

  if (record.attempts >= maxAttempts) {
    record.lockedUntil = now + lockoutDurationMs;
    store.set(key, record);
    return {
      isLocked: true,
      remainingAttempts: 0,
      retryAfterSeconds: Math.ceil(lockoutDurationMs / 1000),
    };
  }

  store.set(key, record);
  return {
    isLocked: false,
    remainingAttempts: Math.max(0, maxAttempts - record.attempts),
  };
}

export function resetRateLimit(key: string): void {
  store.delete(key);
}

/**
 * Sliding window consumption rate limiter for general API endpoints
 * (e.g. contact forms, AI chat, public submissions)
 */
export function consumeRateLimit(
  key: string,
  maxRequests: number = 20,
  windowMs: number = 60 * 1000
): RateLimitResult {
  const now = Date.now();
  let record = store.get(key);

  if (!record || now - record.firstAttemptAt > windowMs) {
    record = {
      attempts: 1,
      firstAttemptAt: now,
    };
    store.set(key, record);
    return {
      isLocked: false,
      remainingAttempts: maxRequests - 1,
    };
  }

  record.attempts += 1;
  store.set(key, record);

  if (record.attempts > maxRequests) {
    const retryAfterSeconds = Math.ceil((record.firstAttemptAt + windowMs - now) / 1000);
    return {
      isLocked: true,
      remainingAttempts: 0,
      retryAfterSeconds: Math.max(1, retryAfterSeconds),
    };
  }

  return {
    isLocked: false,
    remainingAttempts: Math.max(0, maxRequests - record.attempts),
  };
}

