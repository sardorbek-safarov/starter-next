import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('access-token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      );
    }

    const response = await fetch(`${process.env.API_BASE_URL}/auth/me`, {
      headers: {
        Cookie: `access-token=${accessToken}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error) {
    console.error('Me API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
