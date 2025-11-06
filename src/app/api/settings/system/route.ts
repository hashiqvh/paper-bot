import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { systemSettingsSchema } from '@/lib/validations/settings';
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
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get or create system settings (singleton)
    let settings = await prisma.systemSettings.findFirst();
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          taxEnabled: false,
          vatRate: 20,
        },
      });
    }

    return NextResponse.json({ success: true, settings }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch system settings' },
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
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = systemSettingsSchema.parse(body);

    // Get or create system settings (singleton)
    let settings = await prisma.systemSettings.findFirst();
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          taxEnabled: data.taxEnabled,
          vatRate: data.taxEnabled ? data.vatRate : null,
          updatedBy: payload.userId,
        },
      });
    } else {
      settings = await prisma.systemSettings.update({
        where: { id: settings.id },
        data: {
          taxEnabled: data.taxEnabled,
          vatRate: data.taxEnabled ? data.vatRate : null,
          updatedBy: payload.userId,
        },
      });
    }

    return NextResponse.json({ success: true, settings }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update system settings' },
      { status: 500 }
    );
  }
}

