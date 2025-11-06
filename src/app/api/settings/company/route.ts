import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { companySchema } from '@/lib/validations/settings';
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
      include: { company: true },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: true, company: user.company },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch company' },
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
    const data = companySchema.parse(body);

    // Upsert company (create if doesn't exist, update if exists)
    const company = await prisma.company.upsert({
      where: { userId: payload.userId },
      update: {
        name: data.name,
        licenseNumber: data.licenseNumber || null,
        address: data.address || null,
        supportEmail: data.supportEmail || null,
        supportPhone: data.supportPhone || null,
      },
      create: {
        userId: payload.userId,
        name: data.name,
        licenseNumber: data.licenseNumber || null,
        address: data.address || null,
        supportEmail: data.supportEmail || null,
        supportPhone: data.supportPhone || null,
      },
    });

    return NextResponse.json({ success: true, company }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update company' },
      { status: 500 }
    );
  }
}

