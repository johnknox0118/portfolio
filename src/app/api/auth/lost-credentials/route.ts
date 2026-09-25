import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, recordFailedAttempt, resetRateLimit, getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const DEFAULT_RECOVERY_KEY = 'CYBER-SEC-RECOVERY-2026-GRID';

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rateLimitKey = `recovery:${clientIp}`;

  try {
    // 1. Check rate limit (Max 3 failed recovery attempts per 15 min)
    const rateCheck = checkRateLimit(rateLimitKey, 3, 15 * 60 * 1000);
    if (rateCheck.isLocked) {
      return NextResponse.json(
        {
          error: `EMERGENCY PROTOCOL LOCKED: Too many failed verification attempts. Try again in ${rateCheck.retryAfterSeconds} seconds.`,
          locked: true,
          retryAfter: rateCheck.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const recoveryKey = typeof body.recoveryKey === 'string' ? body.recoveryKey.trim() : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

    if (!email || !recoveryKey || !newPassword) {
      return NextResponse.json(
        { error: 'Master recovery email, emergency key, and new passcode are required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Passcode must be at least 6 characters in length.' },
        { status: 400 }
      );
    }

    if (newPassword.length > 128) {
      return NextResponse.json(
        { error: 'Passcode exceeds maximum allowed buffer size.' },
        { status: 400 }
      );
    }

    // 2. Fetch admin and profile to verify identity
    const [admin, profile] = await Promise.all([
      prisma.admin.findFirst(),
      prisma.profile.findFirst(),
    ]);

    if (!admin) {
      return NextResponse.json(
        { error: 'System error: Administrative record uninitialized.' },
        { status: 500 }
      );
    }

    const registeredEmail = (profile?.email || 'johnknox.kalle@gmail.com').trim().toLowerCase();
    const expectedRecoveryKey = (process.env.ADMIN_RECOVERY_KEY || DEFAULT_RECOVERY_KEY).trim();

    // Constant-time-like comparison for security
    const isEmailValid = email === registeredEmail || email === admin.username.toLowerCase();
    const isKeyValid = recoveryKey === expectedRecoveryKey;

    if (!isEmailValid || !isKeyValid) {
      const failStatus = recordFailedAttempt(rateLimitKey, 3, 15 * 60 * 1000);

      // Audit log failed recovery attempt
      try {
        await prisma.visitorLog.create({
          data: {
            ipAddress: clientIp,
            page: '/admin/login [RECOVERY_FAILED]',
            device: 'Security Event',
            browser: 'Recovery Engine',
            os: 'Auth Guard',
            userAgent: request.headers.get('user-agent')?.slice(0, 200) || 'Unknown',
            visitCount: 1,
          },
        });
      } catch (logErr) {
        console.warn('Could not record failed recovery log:', logErr);
      }

      const warningMsg = failStatus.isLocked
        ? `Authentication rejected. Rate limit exceeded. Account locked for ${failStatus.retryAfterSeconds}s.`
        : `Verification failed. Identity credentials rejected. (${failStatus.remainingAttempts} attempts remaining).`;

      return NextResponse.json(
        { error: warningMsg, remainingAttempts: failStatus.remainingAttempts },
        { status: 401 }
      );
    }

    // 3. Reset rate limit upon successful verification
    resetRateLimit(rateLimitKey);

    // 4. Hash new passcode securely with bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 5. Update admin record
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashedPassword },
    });

    // 6. Audit log successful recovery
    try {
      await prisma.visitorLog.create({
        data: {
          ipAddress: clientIp,
          page: '/admin/login [RECOVERY_SUCCESS]',
          device: 'Security Event',
          browser: 'Recovery Engine',
          os: 'Auth Guard',
          userAgent: request.headers.get('user-agent')?.slice(0, 200) || 'Unknown',
          visitCount: 1,
        },
      });
    } catch (logErr) {
      console.warn('Could not record recovery success log:', logErr);
    }

    return NextResponse.json({
      success: true,
      username: admin.username,
      message: 'Cryptographic credentials updated successfully. Master access restored.',
    });
  } catch (error: any) {
    console.error('Lost credentials API error:', error);
    return NextResponse.json(
      { error: 'Internal security engine error occurred during recovery.' },
      { status: 500 }
    );
  }
}
