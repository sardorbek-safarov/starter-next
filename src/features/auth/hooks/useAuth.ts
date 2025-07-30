'use client';

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

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  // Simple user query - React Query handles all state management
  const {
    data: user,
    isLoading,
    error: userError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: authKeys.me(),
    queryFn: async (): Promise<User | null> => {
      try {
        const response = await httpClient.get(
          API_ENDPOINTS.BACKEND.AUTH.PROFILE
        );
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 401) {
          return null; // Not authenticated
        }
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Derived state - no context needed!
  const isAuthenticated = !!user;

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await httpClient.post(
        API_ENDPOINTS.BACKEND.AUTH.LOGIN,
        credentials
      );
      if (response.status >= 400) {
        throw new Error(response.data?.message || 'Login failed');
      }
      return response.data as AuthResponse;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me(), data.user);
      showSuccess(data.message || 'Successfully logged in!');
      router.push('/');
    },
    onError: (error: any) => {
      console.error('Login failed:', error);
      showError(
        error.response?.data?.message || error.message || 'Login failed'
      );
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      const response = await httpClient.post(
        API_ENDPOINTS.BACKEND.AUTH.REGISTER,
        credentials
      );
      if (response.status >= 400) {
        throw new Error(response.data?.message || 'Registration failed');
      }
      return response.data as AuthResponse;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me(), data.user);
      showSuccess(data.message || 'Account created successfully!');
      router.push('/');
    },
    onError: (error: any) => {
      console.error('Registration failed:', error);
      showError(
        error.response?.data?.message || error.message || 'Registration failed'
      );
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await httpClient.post(API_ENDPOINTS.BACKEND.AUTH.LOGOUT);
      if (response.status >= 400) {
        console.warn('Logout request failed, but clearing local state anyway');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.setQueryData(authKeys.me(), null);
      queryClient.removeQueries({ queryKey: authKeys.all });
      showSuccess('Successfully logged out!');
      router.push('/login');
    },
    onError: (error: any) => {
      console.error('Logout failed:', error);
      queryClient.setQueryData(authKeys.me(), null);
      queryClient.removeQueries({ queryKey: authKeys.all });
      showError('Logout failed, but you have been signed out locally');
      router.push('/login');
    },
  });

  // Refresh token function
  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await httpClient.post(
        API_ENDPOINTS.BACKEND.AUTH.REFRESH
      );
      if (response.status >= 200 && response.status < 300) {
        await refetchUser();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  return {
    // State - directly from React Query
    user,
    isAuthenticated,
    isLoading,
    error: userError?.message || null,

    // Actions
    login: async (credentials: LoginCredentials) =>
      loginMutation.mutateAsync(credentials),
    register: async (credentials: RegisterCredentials) =>
      registerMutation.mutateAsync(credentials),
    logout: async () => logoutMutation.mutateAsync(),
    refreshToken,
    refetch: refetchUser,

    // Loading states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
