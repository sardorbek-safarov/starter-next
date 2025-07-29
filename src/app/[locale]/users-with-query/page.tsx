'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { buildBackendUrl } from '@/shared/config/api';
import { httpClient } from '@/shared/lib/http-client';
import { useToast } from '@/shared/hooks/useToast';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}

// Query key factory
const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (filters: string) => [...usersKeys.lists(), { filters }] as const,
};

// Custom hook using useQuery
function useUsers() {
  const { showError } = useToast();

  return useQuery({
    queryKey: usersKeys.lists(),
    queryFn: async (): Promise<UsersResponse> => {
      try {
        const backendUrl = buildBackendUrl('users');
        const response = await httpClient.get(backendUrl);

        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.status}`);
        }

        const data = await response.json();

        return {
          users: data.users || data.data || data,
          total: data.total || data.users?.length || 0,
          page: data.page || 1,
          pageSize: data.pageSize || 10,
        };
      } catch (error) {
        showError('Failed to load users');
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
}

const UsersClientWithQuery = () => {
  const { data, isLoading, error, refetch } = useUsers();

  if (isLoading) {
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

  if (error) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='bg-red-50 border border-red-200 rounded-md p-4'>
          <p className='text-red-800'>❌ Error: {error.message}</p>
          <button
            onClick={() => refetch()}
            className='mt-2 text-sm text-red-600 hover:text-red-800 underline'
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const { users = [], total = 0, page = 1, pageSize = 10 } = data || {};

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Users (Client with useQuery)</h1>
        <button
          onClick={() => refetch()}
          className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
        >
          Refresh
        </button>
      </div>

      <div className='mb-4 text-sm text-gray-600'>
        Showing {users.length} of {total} users (Page {page})
      </div>

      {users.length === 0 ? (
        <div className='text-center py-8'>
          <p className='text-gray-500'>No users found.</p>
        </div>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {users.map((user) => (
            <div
              key={user.id}
              className='bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow'
            >
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                {user.name}
              </h3>
              <p className='text-gray-600 mb-2'>{user.email}</p>
              {user.createdAt && (
                <p className='text-sm text-gray-500'>
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className='mt-8 p-4 bg-blue-50 rounded-lg'>
        <h3 className='font-semibold mb-2'>useQuery Benefits:</h3>
        <div className='text-xs text-blue-800 space-y-1'>
          <p>🔄 Automatic background refetching</p>
          <p>📦 Built-in caching (5min stale time)</p>
          <p>🔁 Automatic retries (3 attempts)</p>
          <p>⚡ Loading and error states</p>
          <p>🎯 Toast notifications on errors</p>
        </div>
      </div>
    </div>
  );
};

export default UsersClientWithQuery;
