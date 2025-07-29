'use client';

import { useState } from 'react';
import { useErrorHandler, useThrowError } from '@/shared/hooks';

export function ErrorTestComponent() {
  const [count, setCount] = useState(0);
  const { handleError } = useErrorHandler();
  const throwError = useThrowError();

  const triggerError = () => {
    throwError('This is a test error triggered manually');
  };

  const triggerAsyncError = async () => {
    try {
      // Simulate an async operation that fails
      await new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Async operation failed')), 1000);
      });
    } catch (error) {
      handleError(error);
    }
  };

  const triggerUnhandledPromise = () => {
    // This will be caught by AsyncErrorBoundary
    Promise.reject(new Error('Unhandled promise rejection'));
  };

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div className='p-4 border border-gray-300 rounded-md bg-yellow-50'>
      <h3 className='text-lg font-semibold mb-4'>Error Testing (Dev Only)</h3>
      <div className='space-y-2'>
        <button
          onClick={triggerError}
          className='px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mr-2'
        >
          Trigger Sync Error
        </button>
        <button
          onClick={triggerAsyncError}
          className='px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 mr-2'
        >
          Trigger Async Error
        </button>
        <button
          onClick={triggerUnhandledPromise}
          className='px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 mr-2'
        >
          Trigger Unhandled Promise
        </button>
        <div className='mt-2'>
          <p className='text-sm text-gray-600'>
            Count: {count}
            <button
              onClick={() => setCount((c) => c + 1)}
              className='ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs'
            >
              +
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
