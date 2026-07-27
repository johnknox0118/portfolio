import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'cybersecurity_portfolio_secret_key_2026_jwt';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('cyber_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json();

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

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long.' },
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
      return NextResponse.json(
        { error: 'Verification failed: Current password is incorrect.' },
        { status: 400 }
      );
    }

    // Hash new password and save to database
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: 'Admin security credentials updated successfully.',
    });
  } catch (error: any) {
    console.error('Change password API error:', error);
    return NextResponse.json(
      { error: 'Failed to update security credentials' },
      { status: 500 }
    );
  }
}
