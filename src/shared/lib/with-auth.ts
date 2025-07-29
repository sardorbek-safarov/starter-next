import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '../config/api';

interface AuthenticatedRequest extends NextRequest {
  user?: any;
}

type AuthenticatedHandler = (
  request: AuthenticatedRequest,
  context: any
) => Promise<NextResponse>;

export function withAuth(handler: AuthenticatedHandler) {
  return async (request: NextRequest, context: any) => {
    const accessToken = request.cookies.get('access-token')?.value;
    const refreshToken = request.cookies.get('refresh-token')?.value;

    if (!accessToken && !refreshToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Try to verify access token
    let user = null;
    if (accessToken) {
      user = await verifyAccessToken(accessToken);
    }

    // If access token is invalid but we have refresh token, try refresh
    if (!user && refreshToken) {
      const refreshResult = await refreshAccessToken(refreshToken);
      if (refreshResult.success) {
        user = refreshResult.user;

        // Set new tokens in response
        const response = await handler(
          Object.assign(request, { user }),
          context
        );

        // Add new cookies to response
        if (refreshResult.newTokens) {
          response.cookies.set(
            'access-token',
            refreshResult.newTokens.accessToken,
            {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              maxAge: 15 * 60, // 15 minutes
            }
          );
          response.cookies.set(
            'refresh-token',
            refreshResult.newTokens.refreshToken,
            {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              maxAge: 7 * 24 * 60 * 60, // 7 days
            }
          );
        }

        return response;
      }
    }

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Add user to request
    const authenticatedRequest = Object.assign(request, { user });
    return handler(authenticatedRequest, context);
  };
}

async function verifyAccessToken(token: string) {
  try {
    const response = await fetch(API_ENDPOINTS.BACKEND.AUTH.VERIFY, {
      headers: {
        Cookie: `access-token=${token}`,
      },
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Token verification failed:', error);
  }
  return null;
}

async function refreshAccessToken(refreshToken: string) {
  try {
    const response = await fetch(API_ENDPOINTS.BACKEND.AUTH.REFRESH, {
      method: 'POST',
      headers: {
        Cookie: `refresh-token=${refreshToken}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const cookies = response.headers.get('set-cookie');

      return {
        success: true,
        user: data.user,
        newTokens: data.tokens, // Assuming backend returns new tokens
      };
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }

  return { success: false };
}
