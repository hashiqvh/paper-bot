import { authenticateUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const result = await authenticateUser(email, password);

    const response = NextResponse.json(
      {
        success: true,
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
      { status: 200 }
    );

    // Set HTTP-only cookies
    response.cookies.set('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutes
    });

    response.cookies.set('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues.map((issue) => issue.message)     },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Authentication failed' },
      { status: 401 }
    );
  }
}

