import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export const JWT_SECRET = process.env.JWT_SECRET || 'cybersecurity_portfolio_secret_key_2026_jwt';

export interface AuthSession {
  id: number;
  username: string;
}

/**
 * Server-side session verification helper for App Router API routes
 * Cryptographically verifies JWT HMAC-SHA256 signature and expiration
 */
export async function verifyAdminSession(
  request?: Request
): Promise<{ authenticated: boolean; session?: AuthSession; error?: string }> {
  try {
    let token: string | undefined;

    // 1. Try reading from Next.js cookie store
    try {
      const cookieStore = await cookies();
      token = cookieStore.get('cyber_token')?.value;
    } catch {
      // Context where cookies() might not be available
    }

    // 2. Fallback to raw request headers
    if (!token && request) {
      const cookieHeader = request.headers.get('cookie') || '';
      const match = cookieHeader.match(/cyber_token=([^;]+)/);
      if (match) {
        token = decodeURIComponent(match[1]);
      }
      if (!token) {
        const authHeader = request.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7).trim();
        }
      }
    }

    if (!token) {
      return { authenticated: false, error: 'Unauthorized: Authentication required.' };
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthSession;
    return { authenticated: true, session: decoded };
  } catch (err: any) {
    return { authenticated: false, error: 'Unauthorized: Invalid or expired security token.' };
  }
}

/**
 * Sanitize strings by stripping HTML tags and trimming excess whitespace
 */
export function sanitizeString(input: unknown, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Strip angle brackets to prevent script/tag injection
    .slice(0, maxLength);
}

/**
 * Validate standard email addresses with RFC-compliant syntax
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.length > 150) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}
