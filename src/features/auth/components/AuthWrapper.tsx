'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface AuthWrapperProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireGuest?: boolean;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function AuthWrapper({
  children,
  requireAuth = false,
  requireGuest = false,
  fallback,
  redirectTo,
}: AuthWrapperProps) {
  const { isAuthenticated, isLoading, user, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // If there's an auth error (like 401), treat as not authenticated
    const isActuallyAuthenticated = isAuthenticated && !error;

    if (requireAuth && !isActuallyAuthenticated) {
      console.log('Redirecting to login - not authenticated');
      router.push(redirectTo || '/login');
      return;
    }

    if (requireGuest && isActuallyAuthenticated) {
      console.log('Redirecting to dashboard - already authenticated');
      router.push(redirectTo || '/');
      return;
    }
  }, [
    isAuthenticated,
    isLoading,
    requireAuth,
    requireGuest,
    router,
    redirectTo,
    error,
  ]);

  // Show loading state
  if (isLoading) {
    return (
      fallback || <div className='flex justify-center p-8'>Loading...</div>
    );
  }

  // If there's an auth error, treat as not authenticated
  const isActuallyAuthenticated = isAuthenticated && !error;

  // Show nothing while redirecting
  if (
    (requireAuth && !isActuallyAuthenticated) ||
    (requireGuest && isActuallyAuthenticated)
  ) {
    return null;
  }

  return <>{children}</>;
}
