'use client';

import { useAuth } from '../features/auth/context/AuthContext';

export function AuthDebugInfo() {
  const { user, isAuthenticated, isLoading, error } = useAuth();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className='fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg text-sm max-w-xs'>
      <h4 className='font-bold mb-2'>Auth Debug Info</h4>
      <div className='space-y-1'>
        <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
        <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
        <div>User: {user ? user.name : 'None'}</div>
        <div>Error: {error || 'None'}</div>
      </div>
    </div>
  );
}
