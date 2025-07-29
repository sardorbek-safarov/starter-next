import React from 'react';
import { buildBackendUrl } from '@/shared/config/api';
import UsersClientWrapper from './UsersClientWrapper';

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

// Server-side initial data fetch
async function fetchInitialUsers(): Promise<UsersResponse> {
  try {
    const backendUrl = buildBackendUrl('users');
    const response = await fetch(backendUrl, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

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
    console.error('Error fetching initial users:', error);
    return {
      users: [],
      total: 0,
      page: 1,
      pageSize: 10,
    };
  }
}

const UsersHybrid = async () => {
  // Get initial data on server
  const initialData = await fetchInitialUsers();

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-6'>
        Users (Hybrid: Server + Client)
      </h1>

      <div className='mb-4 p-3 bg-green-50 rounded-lg'>
        <p className='text-sm text-green-800'>
          ⚡ Initial data loaded on server, then client takes over with useQuery
        </p>
      </div>

      {/* Client component that uses the server data as initial data */}
      <UsersClientWrapper initialData={initialData} />

      <div className='mt-8 p-4 bg-gray-50 rounded-lg'>
        <h3 className='font-semibold mb-2'>Hybrid Approach Benefits:</h3>
        <div className='text-xs text-gray-600 space-y-1'>
          <p>🚀 Fast initial load (server-rendered)</p>
          <p>🔄 Interactive features (client-side)</p>
          <p>📱 Best of both worlds</p>
          <p>🎯 SEO-friendly with dynamic updates</p>
        </div>
      </div>
    </div>
  );
};

export default UsersHybrid;
