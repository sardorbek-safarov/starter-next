import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { httpClient } from '@/shared/lib/http-client';
import { User } from '@/entities/user/model';
import { API_ENDPOINTS } from '@/shared/config/api';
import { useToast } from '@/shared/hooks/useToast';

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  message?: string;
}

// Get current user query
export function useMe(enabled: boolean = true) {
  const { showGenericError } = useToast();

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async (): Promise<User> => {
      const response = await httpClient.get(API_ENDPOINTS.INTERNAL.AUTH.ME);
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        showGenericError();
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
  const { showAuthError, showAuthSuccess } = useToast();

  return useMutation({
    mutationFn: async (
      credentials: LoginCredentials
    ): Promise<AuthResponse> => {
      const response = await httpClient.post(
        API_ENDPOINTS.INTERNAL.AUTH.LOGIN,
        credentials
      );
      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: 'Login failed' }));
        // The error will be handled by onError callback with toast
        throw new Error(error.message || 'Login failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Update the user cache
      queryClient.setQueryData(authKeys.me(), data.user);

      // Invalidate and refetch any user-related queries
      queryClient.invalidateQueries({ queryKey: authKeys.all });

      // Show success toast
      showAuthSuccess('login');

      // Redirect to dashboard
      router.push('/');
    },
    onError: (error) => {
      showAuthError(error);
    },
  });
}

// Register mutation
export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { showAuthError, showAuthSuccess } = useToast();

  return useMutation({
    mutationFn: async (
      credentials: RegisterCredentials
    ): Promise<AuthResponse> => {
      const response = await httpClient.post(
        API_ENDPOINTS.INTERNAL.AUTH.REGISTER,
        credentials
      );
      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: 'Registration failed' }));
        // The error will be handled by onError callback with toast
        throw new Error(error.message || 'Registration failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Update the user cache
      queryClient.setQueryData(authKeys.me(), data.user);

      // Invalidate and refetch any user-related queries
      queryClient.invalidateQueries({ queryKey: authKeys.all });

      // Show success toast
      showAuthSuccess('register');

      // Redirect to dashboard
      router.push('/');
    },
    onError: (error) => {
      showAuthError(error);
    },
  });
}

// Logout mutation
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { showAuthError, showAuthSuccess } = useToast();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      const response = await httpClient.post(
        API_ENDPOINTS.INTERNAL.AUTH.LOGOUT
      );
      if (!response.ok) {
        // The error will be handled by onError callback with toast
        throw new Error('Logout failed');
      }
    },
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();

      // Or just clear auth-related queries
      queryClient.removeQueries({ queryKey: authKeys.all });

      // Show success toast
      showAuthSuccess('logout');

      // Redirect to login
      router.push('/login');
    },
    onError: (error) => {
      showAuthError(error);
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
      const response = await fetch(API_ENDPOINTS.INTERNAL.AUTH.REFRESH, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        // Token refresh failures should be silent - they'll redirect to login
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
