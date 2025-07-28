'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { User } from '../../../entities/user/model';
import {
  useLogin,
  useLogout,
  useMe,
  useRefreshToken,
} from '../hooks/useAuthQueries';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refetch: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  initialUser?: User | null;
  initialIsAuthenticated?: boolean;
}

export function AuthProvider({
  children,
  initialUser = null,
  initialIsAuthenticated = false,
}: AuthProviderProps) {
  // Only enable the useMe query if we have initial authentication or user data
  const shouldFetchUser = initialIsAuthenticated || !!initialUser;

  // Use TanStack Query hooks
  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
    refetch,
  } = useMe(shouldFetchUser);
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const refreshTokenMutation = useRefreshToken();

  // Use the query data if available, otherwise fall back to initial data
  const currentUser = user || initialUser;
  const isAuthenticated = !!currentUser;
  const isLoading =
    isUserLoading || loginMutation.isPending || logoutMutation.isPending;
  const error =
    userError?.message ||
    loginMutation.error?.message ||
    logoutMutation.error?.message ||
    null;

  // Set up automatic token refresh
  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;

    if (currentUser) {
      // Refresh token every 14 minutes (assuming 15-minute access token)
      refreshInterval = setInterval(async () => {
        try {
          await refreshTokenMutation.mutateAsync();
        } catch (error) {
          console.error('Automatic token refresh failed:', error);
        }
      }, 14 * 60 * 1000);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [currentUser, refreshTokenMutation]);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      await loginMutation.mutateAsync({ email, password });
    } catch (error) {
      throw error; // Re-throw to allow component to handle
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      await refreshTokenMutation.mutateAsync();
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  const refetchUser = async (): Promise<void> => {
    await refetch();
  };

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        isLoading,
        login,
        logout,
        refetch: refetchUser,
        refreshToken,
        isAuthenticated,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
