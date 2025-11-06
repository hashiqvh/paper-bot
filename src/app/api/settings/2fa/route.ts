import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { twoFactorSchema } from '@/lib/validations/settings';
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
    const data = twoFactorSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: { twoFactorEnabled: data.enabled },
      select: {
        id: true,
        twoFactorEnabled: true,
      },
    });

    return NextResponse.json(
      { success: true, twoFactorEnabled: updatedUser.twoFactorEnabled },
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
      { success: false, error: error instanceof Error ? error.message : 'Failed to update 2FA' },
      { status: 500 }
    );
  }
}

