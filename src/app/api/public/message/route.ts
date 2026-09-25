import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { consumeRateLimit, getClientIp } from '@/lib/rateLimit';
import { sanitizeString, isValidEmail } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rateLimitKey = `contact:${clientIp}`;

  try {
    // 1. Rate limiting: Max 5 contact message transmissions per 10 minutes per IP
    const rateCheck = consumeRateLimit(rateLimitKey, 5, 10 * 60 * 1000);
    if (rateCheck.isLocked) {
      return NextResponse.json(
        {
          error: `Rate limit exceeded: Transmission channels throttled. Please wait ${rateCheck.retryAfterSeconds} seconds before sending another message.`,
          locked: true,
          retryAfter: rateCheck.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));

    // 2. Input sanitization & bounds checking
    const rawName = sanitizeString(body?.name, 100);
    const rawEmail = typeof body?.email === 'string' ? body.email.trim().toLowerCase().slice(0, 120) : '';
    const rawSubject = sanitizeString(body?.subject, 200);
    const rawMessage = sanitizeString(body?.message, 5000);

    if (!rawName || rawName.length < 2) {
      return NextResponse.json(
        { error: 'Name is required (minimum 2 characters).' },
        { status: 400 }
      );
    }

    if (!isValidEmail(rawEmail)) {
      return NextResponse.json(
        { error: 'A valid email address is required for transmission delivery.' },
        { status: 400 }
      );
    }

    if (!rawSubject || rawSubject.length < 2) {
      return NextResponse.json(
        { error: 'Subject is required (minimum 2 characters).' },
        { status: 400 }
      );
    }

    if (!rawMessage || rawMessage.length < 5) {
      return NextResponse.json(
        { error: 'Message payload is required (minimum 5 characters).' },
        { status: 400 }
      );
    }

    // 3. Persist sanitized record to database
    const newMessage = await prisma.message.create({
      data: {
        name: rawName,
        email: rawEmail,
        subject: rawSubject,
        message: rawMessage,
      },
    });

    // 4. Audit logging
    try {
      await prisma.visitorLog.create({
        data: {
          ipAddress: clientIp,
          page: '/contact [TRANSMISSION_SENT]',
          device: 'Contact Channel',
          browser: 'Message Relay',
          os: 'Encrypted Form',
          userAgent: request.headers.get('user-agent')?.slice(0, 200) || 'Browser Client',
          visitCount: 1,
        },
      });
    } catch {
      // Non-critical audit logging
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Transmission successfully received and encrypted in security ledger.',
        data: newMessage,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Contact message API error:', error);
    return NextResponse.json(
      { error: 'Failed to transmit message due to internal security processor error.' },
      { status: 500 }
    );
  }
}
