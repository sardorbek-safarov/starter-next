import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Call your backend API
    const response = await fetch(`${process.env.API_BASE_URL}/auth/login`, {
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
    console.error('Login API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
