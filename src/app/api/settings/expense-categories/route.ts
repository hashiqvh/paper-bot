import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const expenseCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
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

    const categories = await prisma.expenseCategory.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { expenses: true },
        },
      },
    });

    // Mark default categories (first 4 created categories or specific ones)
    const defaultCategoryNames = ['Advertising', 'Office', 'Platform Fee', 'Other'];
    const categoriesWithDefaults = categories.map((category) => ({
      ...category,
      isDefault: defaultCategoryNames.includes(category.name),
    }));

    return NextResponse.json({ success: true, categories: categoriesWithDefaults }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch expense categories' },
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
    const data = expenseCategorySchema.parse(body);

    // Check if category with same name already exists
    const existingCategory = await prisma.expenseCategory.findUnique({
      where: { name: data.name },
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category with this name already exists' },
        { status: 409 }
      );
    }

    const category = await prisma.expenseCategory.create({
      data,
    });

    return NextResponse.json({ success: true, category: { ...category, isDefault: false } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create expense category' },
      { status: 500 }
    );
  }
}

