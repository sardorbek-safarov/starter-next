'use client';

import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { buildBackendUrl } from '@/shared/config/api';
import { httpClient } from '@/shared/lib/http-client';

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

interface UsersClientWrapperProps {
  initialData: UsersResponse;
}

const UsersClientWrapper = ({ initialData }: UsersClientWrapperProps) => {
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<UsersResponse> => {
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
    },
    initialData, // Use server data as initial data
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { users = [], total = 0, page = 1 } = data || initialData;

  const handleRefresh = () => {
    refetch();
  };

  const handleInvalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  };

  return (
    <>
      <div className='flex justify-between items-center mb-4'>
        <div className='text-sm text-gray-600'>
          Showing {users.length} of {total} users (Page {page})
          {isFetching && (
            <span className='ml-2 text-blue-600'>🔄 Updating...</span>
          )}
        </div>

        <div className='space-x-2'>
          <button
            onClick={handleRefresh}
            disabled={isLoading || isFetching}
            className='px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm'
          >
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </button>

          <button
            onClick={handleInvalidate}
            className='px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm'
          >
            Invalidate Cache
          </button>
        </div>
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

      <div className='mt-6 p-3 bg-blue-50 rounded-lg text-sm'>
        <p>
          <strong>Query Status:</strong>
        </p>
        <p>• Loading: {isLoading ? 'Yes' : 'No'}</p>
        <p>• Fetching: {isFetching ? 'Yes' : 'No'}</p>
        <p>
          • Data Source:{' '}
          {data === initialData ? 'Server (initial)' : 'Client (refetched)'}
        </p>
      </div>
    </>
  );
};

export default UsersClientWrapper;
