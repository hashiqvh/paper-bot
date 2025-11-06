import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { passwordSchema } from '@/lib/validations/settings';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function PATCH(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(accessToken);
    const body = await request.json();
    const data = passwordSchema.parse(body);

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(data.currentPassword, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: payload.userId },
      data: { password: hashedPassword },
    });

    return NextResponse.json(
      { success: true, message: 'Password updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update password' },
      { status: 500 }
    );
  }
}

