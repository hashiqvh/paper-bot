import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { profileSchema } from '@/lib/validations/settings';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(accessToken);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        timezone: true,
        signature: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

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
    const data = profileSchema.parse(body);

    // Check if email is being changed and if it's already taken
    if (data.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingUser && existingUser.id !== payload.userId) {
        return NextResponse.json(
          { success: false, error: 'Email already in use' },
          { status: 409 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        timezone: data.timezone || 'UTC',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        timezone: true,
        signature: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update profile' },
      { status: 500 }
    );
  }
}

