'use client';

import { ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

interface AuthWrapperProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireGuest?: boolean;
}

export function AuthWrapper({ 
  children, 
  requireAuth = false, 
  requireGuest = false 
}: AuthWrapperProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Don't do anything while loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const isAuthenticated = !!user;

  // For pages that require authentication
  if (requireAuth && !isAuthenticated) {
    const redirectUrl = encodeURIComponent(pathname);
    router.replace(`/login?redirect=${redirectUrl}`);
    return null;
  }

  // For pages that require guest access (login/register)
  if (requireGuest && isAuthenticated) {
    router.replace('/dashboard');
    return null;
  }

  return <>{children}</>;
}
