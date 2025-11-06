import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

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

    const services = await prisma.service.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, services }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const data = serviceSchema.parse(body);

    // Check if service with same name already exists
    const existingService = await prisma.service.findUnique({
      where: { name: data.name },
    });

    if (existingService) {
      return NextResponse.json(
        { success: false, error: 'Service with this name already exists' },
        { status: 409 }
      );
    }

    const service = await prisma.service.create({
      data,
    });

    return NextResponse.json({ success: true, service }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create service' },
      { status: 500 }
    );
  }
}

