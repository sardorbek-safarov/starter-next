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

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

const UsersClient = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  });

  const { showError, showSuccess } = useToast();

  const fetchUsers = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      setError(null);

      // Option 1: Using your HTTP client (recommended for authenticated requests)
      const response = await httpClient.get(
        buildBackendUrl(`users?page=${page}&pageSize=${pageSize}`)
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data: UsersResponse = await response.json();

      setUsers(data.users || []);
      setPagination({
        total: data.total || 0,
        page: data.page || 1,
        pageSize: data.pageSize || 10,
        totalPages:
          data.totalPages ||
          Math.ceil((data.total || 0) / (data.pageSize || 10)),
      });

      showSuccess(`Loaded ${data.users?.length || 0} users`);
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

  // Alternative fetch function using direct fetch
  const fetchUsersDirectly = async () => {
    try {
      setLoading(true);

      const response = await fetch(buildBackendUrl('users'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers if needed
        },
        credentials: 'include', // Include cookies
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setUsers(data.users || data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePageChange = (newPage: number) => {
    fetchUsers(newPage, pagination.pageSize);
  };

  const handleRefresh = () => {
    fetchUsers(pagination.page, pagination.pageSize);
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

      <div className='mb-4 text-sm text-gray-600'>
        Showing {users.length} of {pagination.total} users
        {pagination.totalPages > 1 && (
          <span>
            {' '}
            (Page {pagination.page} of {pagination.totalPages})
          </span>
        )}
      </div>

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

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className='mt-8 flex justify-center space-x-2'>
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className='px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
              >
                Previous
              </button>

              {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 border rounded ${
                      pagination.page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className='px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
              >
                Next
              </button>
            </div>
          )}
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

      {/* Debug information */}
      <details className='mt-4'>
        <summary className='text-sm text-gray-500 cursor-pointer'>
          Debug Information
        </summary>
        <div className='mt-2 p-3 bg-gray-100 rounded text-xs'>
          <p>
            <strong>Backend URL:</strong> {buildBackendUrl('users')}
          </p>
          <p>
            <strong>Current Page:</strong> {pagination.page}
          </p>
          <p>
            <strong>Page Size:</strong> {pagination.pageSize}
          </p>
          <p>
            <strong>Total Users:</strong> {pagination.total}
          </p>
          <p>
            <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
          </p>
          <p>
            <strong>Error:</strong> {error || 'None'}
          </p>
        </div>
      </details>
    </div>
  );
};

export default UsersClient;
