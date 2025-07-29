import React from 'react';
import { buildBackendUrl } from '@/shared/config/api';

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

// Server-side data fetching function
async function fetchUsers(): Promise<UsersResponse> {
  try {
    // Fetch from your actual backend API
    const backendUrl = buildBackendUrl('users');
    const response = await fetch(backendUrl, {
      // Server-side fetch options
      cache: 'no-store', // Always fetch fresh data
      headers: {
        'Content-Type': 'application/json',
        // Add any authentication headers if needed
        // 'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch users: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Adapt the response to match your interface
    // Adjust this based on your actual backend response structure
    return {
      users: data.users || data.data || data, // Handle different response formats
      total:
        data.total ||
        data.users?.length ||
        data.data?.length ||
        data.length ||
        0,
      page: data.page || 1,
      pageSize: data.pageSize || data.limit || 10,
    };
  } catch (error) {
    console.error('Error fetching users from backend:', error);
    // Return empty data structure if fetch fails
    return {
      users: [],
      total: 0,
      page: 1,
      pageSize: 10,
    };
  }
}

const UsersServer = async () => {
  const { users, total, page, pageSize } = await fetchUsers();

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-6'>Users (Server-Side)</h1>

      <div className='mb-4 text-sm text-gray-600'>
        Showing {users.length} of {total} users (Page {page})
      </div>

      {users.length === 0 ? (
        <div className='text-center py-8'>
          <p className='text-gray-500'>
            No users found or failed to fetch users.
          </p>
        </div>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {users.map((user) => (
            <div
              key={user.id}
              className='bg-white rounded-lg shadow-md p-6 border border-gray-200'
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

      <div className='mt-8 text-xs text-gray-400'>
        <p>✅ This data was fetched on the server</p>
        <p>✅ SEO-friendly and fast initial load</p>
        <p>✅ No loading states needed</p>
      </div>
    </div>
  );
};

export default UsersServer;
