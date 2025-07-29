import React from 'react';
import { buildBackendUrl } from '@/shared/config/api';
import { getServerAuth } from '@/shared/lib/auth-server';
import { cookies } from 'next/headers';

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

// Server-side data fetching with authentication
async function fetchUsersWithAuth(): Promise<UsersResponse> {
  try {
    // Get authentication from server-side cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;

    const backendUrl = buildBackendUrl('users');
    const response = await fetch(backendUrl, {
      cache: 'no-store', // Always fetch fresh data
      headers: {
        'Content-Type': 'application/json',
        // Include authentication header if available
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
        // Include cookies for session-based auth
        Cookie: cookieStore.toString(),
      },
    });

    if (!response.ok) {
      // Handle different error scenarios
      if (response.status === 401) {
        throw new Error('Unauthorized - Please log in');
      }
      if (response.status === 403) {
        throw new Error('Access denied - Insufficient permissions');
      }
      if (response.status === 404) {
        throw new Error('Users endpoint not found');
      }
      throw new Error(
        `Failed to fetch users: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Adapt the response based on your backend structure
    return {
      users: data.users || data.data || data,
      total: data.total || data.count || 0,
      page: data.page || data.currentPage || 1,
      pageSize: data.pageSize || data.limit || data.per_page || 10,
      totalPages:
        data.totalPages || Math.ceil((data.total || 0) / (data.pageSize || 10)),
    };
  } catch (error) {
    console.error('Error fetching users from backend:', error);

    // Return empty data structure with error info
    return {
      users: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
    };
  }
}

// Alternative: Fetch with query parameters
async function fetchUsersWithParams(
  page = 1,
  pageSize = 10,
  search = ''
): Promise<UsersResponse> {
  try {
    // Build URL with query parameters
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(search && { search }),
    });

    const backendUrl = buildBackendUrl(`users?${params.toString()}`);

    const response = await fetch(backendUrl, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    return {
      users: [],
      total: 0,
      page,
      pageSize,
    };
  }
}

const UsersServerAdvanced = async ({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  // Get search parameters from URL
  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const pageSize = Number(params?.pageSize) || 10;
  const search = (params?.search as string) || '';

  // Check if user is authenticated (optional)
  const { isAuthenticated, user } = await getServerAuth();

  // Fetch users data
  const { users, total, totalPages } = await fetchUsersWithAuth();

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Users Management</h1>
        {isAuthenticated && (
          <div className='text-sm text-gray-600'>
            Welcome, {user?.name || 'User'}
          </div>
        )}
      </div>

      <div className='mb-4 text-sm text-gray-600'>
        Showing {users.length} of {total} users
        {totalPages && totalPages > 1 && (
          <span>
            {' '}
            (Page {page} of {totalPages})
          </span>
        )}
      </div>

      {!isAuthenticated && (
        <div className='bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6'>
          <p className='text-yellow-800'>
            ⚠️ You are not authenticated. Some data may be limited.
          </p>
        </div>
      )}

      {users.length === 0 ? (
        <div className='text-center py-8'>
          <p className='text-gray-500'>No users found. This could be due to:</p>
          <ul className='mt-2 text-sm text-gray-400'>
            <li>• Backend API is not running</li>
            <li>• Network connectivity issues</li>
            <li>• Authentication required</li>
            <li>• No users in the database</li>
          </ul>
        </div>
      ) : (
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
                  <span className='px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded'>
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
      )}

      <div className='mt-8 p-4 bg-gray-50 rounded-lg'>
        <h3 className='font-semibold mb-2'>Server-Side Rendering Benefits:</h3>
        <div className='text-xs text-gray-600 space-y-1'>
          <p>✅ Data fetched on server - faster initial page load</p>
          <p>✅ SEO-friendly - search engines can index the content</p>
          <p>✅ No loading states needed - data is available immediately</p>
          <p>✅ Secure - API calls happen on server, not exposed to client</p>
          <p>✅ Better performance for users with slow connections</p>
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
            <strong>Environment:</strong> {process.env.NODE_ENV}
          </p>
          <p>
            <strong>API Base URL:</strong>{' '}
            {process.env.API_BASE_URL || 'http://localhost:8080'}
          </p>
          <p>
            <strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
          </p>
        </div>
      </details>
    </div>
  );
};

export default UsersServerAdvanced;
