import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, recordFailedAttempt, resetRateLimit, getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'cybersecurity_portfolio_secret_key_2026_jwt';

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rateLimitKey = `pwd_change:${clientIp}`;

  try {
    // 1. Rate limiting: Max 5 failed attempts per 15 min
    const rateCheck = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
    if (rateCheck.isLocked) {
      return NextResponse.json(
        {
          error: `CREDENTIAL DEFENSE LOCKOUT: Excessive password change attempts. Suspended for ${rateCheck.retryAfterSeconds}s.`,
          locked: true,
          retryAfter: rateCheck.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('cyber_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: 'Unauthorized: Invalid or expired token' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'Current password, new password, and confirmation are required.' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'New password and confirm password do not match.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long for enhanced security.' },
        { status: 400 }
      );
    }

    if (newPassword.length > 128) {
      return NextResponse.json(
        { error: 'Password exceeds maximum buffer limit.' },
        { status: 400 }
      );
    }

    // Find admin user from token ID or default admin record
    let admin = null;
    if (decoded && decoded.id) {
      admin = await prisma.admin.findUnique({
        where: { id: Number(decoded.id) },
      });
    }

    if (!admin) {
      admin = await prisma.admin.findFirst();
    }

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin account record not found.' },
        { status: 404 }
      );
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      const failStatus = recordFailedAttempt(rateLimitKey, 5, 15 * 60 * 1000);
      return NextResponse.json(
        {
          error: `Verification failed: Current password is incorrect (${failStatus.remainingAttempts} attempts remaining).`,
          remainingAttempts: failStatus.remainingAttempts,
        },
        { status: 400 }
      );
    }

    // Reset rate limit on success
    resetRateLimit(rateLimitKey);

    // Hash new password and save to database
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashedPassword },
    });

    // Security audit log
    try {
      await prisma.visitorLog.create({
        data: {
          ipAddress: clientIp,
          page: '/admin/change-password [CREDENTIALS_UPDATED]',
          device: 'Security Telemetry',
          browser: 'Auth Shield',
          os: 'Key Rotation',
          userAgent: request.headers.get('user-agent')?.slice(0, 200) || 'Admin Session',
          visitCount: 1,
        },
      });
    } catch {
      // Non-critical audit logging
    }

    return NextResponse.json({
      success: true,
      message: 'Admin security credentials updated successfully. Key rotated.',
    });
  } catch (error: any) {
    console.error('Change password API error:', error);
    return NextResponse.json(
      { error: 'Failed to update security credentials' },
      { status: 500 }
    );
  }
}
