'use client';

import React, { useState, useEffect } from 'react';
import { httpClient } from '@/shared/lib/http-client';
import { buildBackendUrl } from '@/shared/config/api';
import { useToast } from '@/shared/hooks/useToast';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  role?: string;
}

interface UsersResponse extends Array<User> {}

const UsersClient = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { showError, showSuccess } = useToast();

  const fetchUsers = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      setError(null);

      // Option 1: Using your HTTP client (recommended for authenticated requests)
      const response = await httpClient.get(buildBackendUrl(`users`), {
        headers: {
          isServer: 'false', // Indicate client-side request
        },
      });

      if (response.status >= 400) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data: UsersResponse = response.data;

      setUsers(data || []);

      showSuccess(`Loaded ${data?.length || 0} users`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch users';
      setError(errorMessage);
      showError(errorMessage);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRefresh = () => {
    fetchUsers();
  };

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-300 rounded w-1/4 mb-6'></div>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {[...Array(6)].map((_, i) => (
              <div key={i} className='bg-gray-300 h-32 rounded-lg'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Users (Client-Side)</h1>
        <button
          onClick={handleRefresh}
          className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className='bg-red-50 border border-red-200 rounded-md p-4 mb-6'>
          <p className='text-red-800'>❌ Error: {error}</p>
          <button
            onClick={handleRefresh}
            className='mt-2 text-sm text-red-600 hover:text-red-800 underline'
          >
            Try again
          </button>
        </div>
      )}

      {users.length === 0 && !loading ? (
        <div className='text-center py-8'>
          <p className='text-gray-500'>No users found</p>
          <button
            onClick={handleRefresh}
            className='mt-2 text-blue-600 hover:text-blue-800 underline'
          >
            Retry loading users
          </button>
        </div>
      ) : (
        <>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {users.map((user) => (
              <div
                key={user.id}
                className='bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow'
              >
                <div className='flex justify-between items-start mb-2'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    {user.name}
                  </h3>
                  {user.role && (
                    <span className='px-2 py-1 text-xs bg-green-100 text-green-800 rounded'>
                      {user.role}
                    </span>
                  )}
                </div>
                <p className='text-gray-600 mb-2'>{user.email}</p>
                {user.createdAt && (
                  <p className='text-sm text-gray-500'>
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <div className='mt-8 p-4 bg-gray-50 rounded-lg'>
        <h3 className='font-semibold mb-2'>Client-Side Rendering Features:</h3>
        <div className='text-xs text-gray-600 space-y-1'>
          <p>🔄 Real-time data updates</p>
          <p>⚡ Interactive loading states</p>
          <p>🔍 Client-side filtering and pagination</p>
          <p>🔒 Automatic authentication handling</p>
          <p>📱 Better for dynamic user interactions</p>
        </div>
      </div>
    </div>
  );
};

export default UsersClient;
