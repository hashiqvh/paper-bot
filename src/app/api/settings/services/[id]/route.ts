import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const updateServiceSchema = z.object({
  name: z.string().min(1, 'Service name is required').optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const data = updateServiceSchema.parse(body);

    // If name is being updated, check if it already exists
    if (data.name) {
      const existingService = await prisma.service.findUnique({
        where: { name: data.name },
      });

      if (existingService && existingService.id !== id) {
        return NextResponse.json(
          { success: false, error: 'Service with this name already exists' },
          { status: 409 }
        );
      }
    }

    const service = await prisma.service.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, service }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('Record to update does not exist')) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update service' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Service deleted successfully' }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete service' },
      { status: 500 }
    );
  }
}

