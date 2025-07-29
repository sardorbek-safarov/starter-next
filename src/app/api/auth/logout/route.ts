import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/shared/config/api';

export async function POST(request: NextRequest) {
  try {
    // Get the auth cookie to forward to backend
    const authToken = request.cookies.get('auth-token')?.value;

    const response = await fetch(API_ENDPOINTS.BACKEND.AUTH.LOGOUT, {
      method: 'POST',
      headers: {
        Cookie: authToken ? `auth-token=${authToken}` : '',
      },
    });

    // Create response
    const nextResponse = NextResponse.json({ message: 'Logged out' });

    // Clear the cookies on the client
    nextResponse.cookies.delete('access-token');
    nextResponse.cookies.delete('refresh-token');

    return nextResponse;
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json({ message: 'Logout failed' }, { status: 500 });
  }
}
