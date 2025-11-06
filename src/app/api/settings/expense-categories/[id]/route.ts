import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const updateExpenseCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').optional(),
  description: z.string().optional(),
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
    const data = updateExpenseCategorySchema.parse(body);

    // If name is being updated, check if it already exists
    if (data.name) {
      const existingCategory = await prisma.expenseCategory.findUnique({
        where: { name: data.name },
      });

      if (existingCategory && existingCategory.id !== id) {
        return NextResponse.json(
          { success: false, error: 'Category with this name already exists' },
          { status: 409 }
        );
      }
    }

    const category = await prisma.expenseCategory.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, category }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('Record to update does not exist')) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update expense category' },
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

    // Check if category has expenses
    const category = await prisma.expenseCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { expenses: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Prevent deletion of default categories
    const defaultCategoryNames = ['Advertising', 'Office', 'Platform Fee', 'Other'];
    if (defaultCategoryNames.includes(category.name)) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete default categories' },
        { status: 400 }
      );
    }

    // Check if category has expenses
    if (category._count.expenses > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete category with associated expenses' },
        { status: 400 }
      );
    }

    await prisma.expenseCategory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Category deleted successfully' }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete expense category' },
      { status: 500 }
    );
  }
}

