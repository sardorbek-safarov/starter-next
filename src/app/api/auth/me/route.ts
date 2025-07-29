import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '../../../../shared/config/api';

export async function POST(request: NextRequest) {
  try {
    // Get cookies from the request
    const accessToken = request.cookies.get('access-token')?.value;
    const refreshToken = request.cookies.get('refresh-token')?.value;

    if (!accessToken && !refreshToken) {
      return NextResponse.json({ message: 'No auth tokens' }, { status: 401 });
    }

    // Forward the request to backend
    const response = await fetch(API_ENDPOINTS.BACKEND.AUTH.ME, {
      method: 'GET',
      headers: {
        Cookie: `access-token=${accessToken}; refresh-token=${refreshToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok) {
      // Forward the successful response
      return NextResponse.json(data);
    } else {
      // Forward the error response
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error) {
    console.error('API /me error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
