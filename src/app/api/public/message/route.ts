import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const newMessage = await prisma.message.create({
      data: {
        name,
        email,
        subject,
        message,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Transmission received. Message logged in database.',
      data: newMessage,
    });
  } catch (error: any) {
    console.error('Contact message API error:', error);
    return NextResponse.json(
      { error: 'Failed to transmit message' },
      { status: 500 }
    );
  }
}
