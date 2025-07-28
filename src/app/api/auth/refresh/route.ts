import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh-token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { message: 'No refresh token' },
        { status: 401 }
      );
    }

    // Call backend refresh endpoint
    const response = await fetch(`${process.env.API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        Cookie: `refresh-token=${refreshToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();

      // Get new cookies from backend
      const setCookieHeader = response.headers.get('set-cookie');

      const nextResponse = NextResponse.json(data);

      // Forward the new cookies to client
      if (setCookieHeader) {
        nextResponse.headers.set('set-cookie', setCookieHeader);
      }

      return nextResponse;
    } else {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { message: 'Token refresh failed' },
      { status: 500 }
    );
  }
}
