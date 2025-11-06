import { NextRequest, NextResponse } from 'next/server';
import { logoutUser } from '@/lib/auth';
import { verifyAccessToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;

    if (accessToken) {
      try {
        const payload = verifyAccessToken(accessToken);
        await logoutUser(payload.userId);
      } catch (error) {
        // Token might be expired, but we still want to clear cookies
      }
    }

    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear cookies
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Logout failed' },
      { status: 500 }
    );
  }
}

