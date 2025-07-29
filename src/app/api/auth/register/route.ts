import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/shared/config/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Call your backend API
    const response = await fetch(API_ENDPOINTS.BACKEND.AUTH.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (response.ok) {
      // Get the cookie from backend response
      const cookies = response.headers.get('set-cookie');

      // Create the response
      const nextResponse = NextResponse.json(data);

      // Forward the cookie to the client
      if (cookies) {
        nextResponse.headers.set('set-cookie', cookies);
      }

      return nextResponse;
    } else {
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
