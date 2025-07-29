import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { User } from '@/entities/user/model';
import { API_ENDPOINTS } from '../config/api';

interface AuthResponse {
  user: User | null;
  isAuthenticated: boolean;
  needsRefresh?: boolean;
}

export async function getServerAuth(): Promise<AuthResponse> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access-token')?.value;
    const refreshToken = cookieStore.get('refresh-token')?.value;

    if (!accessToken && !refreshToken) {
      return { user: null, isAuthenticated: false };
    }

    // Try with access token first
    if (accessToken) {
      try {
        const response = await fetch(API_ENDPOINTS.BACKEND.AUTH.ME, {
          headers: {
            Cookie: `access-token=${accessToken}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });

        if (response.ok) {
          const user = await response.json();
          return { user, isAuthenticated: true };
        }
      } catch (error) {
        console.error('Access token validation failed:', error);
      }
    }

    // If access token failed but we have refresh token, try refresh
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(
          API_ENDPOINTS.BACKEND.AUTH.REFRESH,
          {
            method: 'POST',
            headers: {
              Cookie: `refresh-token=${refreshToken}`,
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          }
        );

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();

          // Update cookies with new tokens
          const newCookies = refreshResponse.headers.get('set-cookie');
          if (newCookies) {
            // Parse and set new cookies
            // Note: This is complex in server components, better handled in API routes
            return {
              user: data.user,
              isAuthenticated: true,
              needsRefresh: true,
            };
          }
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }

    return { user: null, isAuthenticated: false };
  } catch (error) {
    console.error('Server auth check failed:', error);
    return { user: null, isAuthenticated: false };
  }
}

export async function requireAuth(redirectTo: string = '/login') {
  const { isAuthenticated } = await getServerAuth();

  if (!isAuthenticated) {
    redirect(redirectTo);
  }
}

export async function requireGuest(redirectTo: string = '/') {
  const { isAuthenticated } = await getServerAuth();

  if (isAuthenticated) {
    redirect(redirectTo);
  }
}
