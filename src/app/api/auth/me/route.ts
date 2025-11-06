import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    // If no access token, try to refresh using refresh token
    if (!accessToken && refreshToken) {
      try {
        const { refreshUserToken } = await import('@/lib/auth');
        const result = await refreshUserToken(refreshToken);

        const response = NextResponse.json(
          { success: true, user: result.user },
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
          { success: false, error: 'Token refresh failed' },
          { status: 401 }
        );
      }
    }

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    let payload;
    try {
      payload = verifyAccessToken(accessToken);
    } catch (error) {
      // If access token is expired, try to refresh
      if (refreshToken) {
        try {
          const { refreshUserToken } = await import('@/lib/auth');
          const result = await refreshUserToken(refreshToken);

          const response = NextResponse.json(
            { success: true, user: result.user },
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
        } catch (refreshError) {
          return NextResponse.json(
            { success: false, error: 'Token expired and refresh failed' },
            { status: 401 }
          );
        }
      }
      throw error;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        twoFactorEnabled: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, user },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Authentication failed' },
      { status: 401 }
    );
  }
}

