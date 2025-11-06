import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { notificationPreferencesSchema } from '@/lib/validations/settings';
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
      include: { notificationPreferences: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // If preferences don't exist, return defaults
    if (!user.notificationPreferences) {
      const defaults = {
        newClientAdded: true,
        proposalAccepted: true,
        invoiceOverdue: true,
        kycSubmission: true,
        activityLog: true,
        securityAlerts: true,
      };
      return NextResponse.json({ success: true, preferences: defaults }, { status: 200 });
    }

    return NextResponse.json(
      { success: true, preferences: user.notificationPreferences },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch notification preferences' },
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
    const data = notificationPreferencesSchema.parse(body);

    const preferences = await prisma.userNotificationPreferences.upsert({
      where: { userId: payload.userId },
      update: data,
      create: {
        userId: payload.userId,
        ...data,
      },
    });

    return NextResponse.json({ success: true, preferences }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
}

