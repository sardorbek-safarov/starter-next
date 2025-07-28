import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { httpClient } from '../../../shared/lib/http-client';
import { User } from '../../../entities/user/model';

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  message?: string;
}

// Get current user query
export function useMe(enabled: boolean = true) {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async (): Promise<User> => {
      const response = await httpClient.get('/api/auth/me');
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      return response.json();
    },
    enabled, // Only run when enabled
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.message?.includes('401') || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Login mutation
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (
      credentials: LoginCredentials
    ): Promise<AuthResponse> => {
      const response = await httpClient.post('/api/auth/login', credentials);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Update the user cache
      queryClient.setQueryData(authKeys.me(), data.user);

      // Invalidate and refetch any user-related queries
      queryClient.invalidateQueries({ queryKey: authKeys.all });

      // Redirect to dashboard
      router.push('/dashboard');
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
}

// Logout mutation
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      const response = await httpClient.post('/api/auth/logout');
      if (!response.ok) {
        throw new Error('Logout failed');
      }
    },
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();

      // Or just clear auth-related queries
      queryClient.removeQueries({ queryKey: authKeys.all });

      // Redirect to login
      router.push('/login');
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      // Still clear cache and redirect even if logout API fails
      queryClient.clear();
      router.push('/login');
    },
  });
}

// Token refresh mutation
export function useRefreshToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<AuthResponse> => {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.user) {
        // Update user cache
        queryClient.setQueryData(authKeys.me(), data.user);
      }
    },
    onError: () => {
      // Clear cache and redirect to login on refresh failure
      queryClient.clear();
    },
  });
}
