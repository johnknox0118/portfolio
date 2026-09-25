import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, recordFailedAttempt, resetRateLimit, getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'cybersecurity_portfolio_secret_key_2026_jwt';

// Pre-computed dummy hash to mitigate timing-based user enumeration attacks
const DUMMY_HASH = '$2a$10$e8wE4zFwzKkJ7m9p0q1r2u3v4w5x6y7z8a9b0c1d2e3f4g5h6i7j8';

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rateLimitKey = `login:${clientIp}`;

  try {
    // 1. Sliding window brute-force protection (Max 5 failed attempts per 15 min)
    const rateCheck = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
    if (rateCheck.isLocked) {
      return NextResponse.json(
        {
          error: `BRUTE-FORCE LOCKOUT: Excessive authentication failures. Access suspended for ${rateCheck.retryAfterSeconds}s.`,
          locked: true,
          retryAfter: rateCheck.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const rememberMe = Boolean(body.rememberMe);

    // 2. Strict Input validation
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Agent Identifier and Cryptographic Key are required.' },
        { status: 400 }
      );
    }

    if (username.length > 50 || password.length > 128) {
      return NextResponse.json(
        { error: 'Security payload exceeds maximum allowed size.' },
        { status: 400 }
      );
    }

    // 3. Constant-time user lookup & authentication
    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    let isMatch = false;
    if (admin) {
      isMatch = await bcrypt.compare(password, admin.password);
    } else {
      // Execute dummy bcrypt to match timing of existing user verification
      await bcrypt.compare(password, DUMMY_HASH);
    }

    if (!admin || !isMatch) {
      const failStatus = recordFailedAttempt(rateLimitKey, 5, 15 * 60 * 1000);

      // Security audit log for failed login attempt
      try {
        await prisma.visitorLog.create({
          data: {
            ipAddress: clientIp,
            page: '/admin/login [FAILED_LOGIN]',
            device: 'Security Telemetry',
            browser: 'Auth Shield',
            os: 'Firewall Layer',
            userAgent: request.headers.get('user-agent')?.slice(0, 200) || 'Unknown',
            visitCount: 1,
          },
        });
      } catch (logErr) {
        console.warn('Could not record failed login audit log:', logErr);
      }

      const message = failStatus.isLocked
        ? `Access denied. Rate limit reached: System lockdown engaged for ${failStatus.retryAfterSeconds}s.`
        : `Invalid security credentials. (${failStatus.remainingAttempts} attempts remaining).`;

      return NextResponse.json(
        {
          error: message,
          remainingAttempts: failStatus.remainingAttempts,
          locked: failStatus.isLocked,
          retryAfter: failStatus.retryAfterSeconds,
        },
        { status: 401 }
      );
    }

    // 4. Reset rate-limiter upon successful authentication
    resetRateLimit(rateLimitKey);

    // 5. Generate JWT token with variable lifespan depending on rememberMe
    const expiresIn = rememberMe ? '30d' : '1d';
    const cookieMaxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days vs 1 day

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      JWT_SECRET,
      { expiresIn }
    );

    // 6. Audit log for authorized session initiation
    try {
      await prisma.visitorLog.create({
        data: {
          ipAddress: clientIp,
          page: '/admin/login [AUTHORIZED]',
          device: 'Security Telemetry',
          browser: 'Auth Shield',
          os: 'Clearance Granted',
          userAgent: request.headers.get('user-agent')?.slice(0, 200) || 'Unknown',
          visitCount: 1,
        },
      });
    } catch (logErr) {
      console.warn('Could not record login success audit log:', logErr);
    }

    // 7. Secure HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: 'Access granted. Session initialized.',
      rememberMe,
      expiresIn,
    });

    response.cookies.set('cyber_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: cookieMaxAge,
      path: '/',
      sameSite: 'strict',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal security engine error. Telemetry logged.' },
      { status: 500 }
    );
  }
}
