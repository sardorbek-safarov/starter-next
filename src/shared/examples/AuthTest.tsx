'use client';

import { useAuth } from '@/features/auth';

/**
 * Simple component to verify that the AuthProvider is working correctly
 * This can be used for testing and debugging auth context issues
 */
export function AuthTest() {
  try {
    const { user, isAuthenticated, isLoading } = useAuth();

    return (
      <div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
        <h3 className='text-green-800 font-semibold mb-2'>
          ✅ Auth Context Working
        </h3>
        <div className='text-sm text-green-700 space-y-1'>
          <div>• Auth Provider: Connected</div>
          <div>• User: {user ? user.name || user.email : 'Not logged in'}</div>
          <div>• Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
          <div>• Loading: {isLoading ? 'Yes' : 'No'}</div>
        </div>
      </div>
    );
  } catch (error: any) {
    return (
      <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
        <h3 className='text-red-800 font-semibold mb-2'>
          ❌ Auth Context Error
        </h3>
        <div className='text-sm text-red-700'>{error.message}</div>
      </div>
    );
  }
}
