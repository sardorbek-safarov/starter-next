'use client';

import { useState } from 'react';
import { useUpdateUserProfile } from '@/shared/hooks/useQueries';
import { useAuth } from '@/features/auth/context/AuthContext';

export function UserProfileForm() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const updateProfileMutation = useUpdateUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      await updateProfileMutation.mutateAsync({
        userId: user.id,
        data: formData,
      });

      // Show success message
      alert('Profile updated successfully!');
    } catch (error) {
      // Error is handled by TanStack Query
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className='max-w-md mx-auto bg-white p-6 rounded-lg shadow'>
      <h2 className='text-xl font-semibold mb-4'>Update Profile</h2>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label
            htmlFor='name'
            className='block text-sm font-medium text-gray-700'
          >
            Name
          </label>
          <input
            type='text'
            id='name'
            name='name'
            value={formData.name}
            onChange={handleInputChange}
            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            required
          />
        </div>

        <div>
          <label
            htmlFor='email'
            className='block text-sm font-medium text-gray-700'
          >
            Email
          </label>
          <input
            type='email'
            id='email'
            name='email'
            value={formData.email}
            onChange={handleInputChange}
            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            required
          />
        </div>

        <button
          type='submit'
          disabled={updateProfileMutation.isPending}
          className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50'
        >
          {updateProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
        </button>

        {updateProfileMutation.error && (
          <div className='text-red-600 text-sm'>
            Error: {updateProfileMutation.error.message}
          </div>
        )}
      </form>
    </div>
  );
}
