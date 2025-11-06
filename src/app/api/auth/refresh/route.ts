import { NextRequest, NextResponse } from 'next/server';
import { refreshUserToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'Refresh token not found' },
        { status: 401 }
      );
    }

    const result = await refreshUserToken(refreshToken);

    const response = NextResponse.json(
      {
        success: true,
        user: result.user,
        accessToken: result.accessToken,
      },
      { status: 200 }
    );

    // Update access token cookie
    response.cookies.set('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutes
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Token refresh failed' },
      { status: 401 }
    );
  }
}

