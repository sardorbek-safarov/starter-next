'use client';

import { useState } from 'react';
import { httpClient } from '@/shared/lib/http-client';
import { useToast } from '@/shared/hooks/useToast';

/**
 * Demo component showing how the token refresh retry mechanism works
 *
 * This component demonstrates:
 * 1. Multiple concurrent requests that get 401 responses
 * 2. Automatic token refresh attempt
 * 3. Request queuing during refresh
 * 4. Retry of original requests after successful refresh
 * 5. Automatic redirect to login if refresh fails
 */
export function TokenRefreshDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const { showSuccess, showError } = useToast();

  const addResult = (message: string) => {
    setResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const testSingleRequest = async () => {
    setIsLoading(true);
    setResults([]);

    try {
      addResult('Making single request that might trigger 401...');

      const response = await httpClient.get('/api/protected-endpoint');

      addResult(`✅ Request successful: ${JSON.stringify(response.data)}`);
      showSuccess('Request completed successfully');
    } catch (error: any) {
      addResult(`❌ Request failed: ${error.message}`);
      showError('Request failed');
    } finally {
      setIsLoading(false);
    }
  };

  const testConcurrentRequests = async () => {
    setIsLoading(true);
    setResults([]);

    addResult('Making 3 concurrent requests that might trigger 401...');

    // Make 3 concurrent requests that might all get 401
    const requests = [
      httpClient.get('/api/protected-endpoint-1'),
      httpClient.get('/api/protected-endpoint-2'),
      httpClient.get('/api/protected-endpoint-3'),
    ];

    try {
      const responses = await Promise.allSettled(requests);

      responses.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          addResult(`✅ Request ${index + 1} successful`);
        } else {
          addResult(`❌ Request ${index + 1} failed: ${result.reason.message}`);
        }
      });

      showSuccess('All requests completed');
    } catch (error: any) {
      addResult(`❌ Concurrent requests failed: ${error.message}`);
      showError('Requests failed');
    } finally {
      setIsLoading(false);
    }
  };

  const testSkipRefresh = async () => {
    setIsLoading(true);
    setResults([]);

    try {
      addResult('Making request with skipRefresh=true...');

      const response = await httpClient.get('/api/protected-endpoint', {
        skipRefresh: true,
      });

      addResult(`✅ Request successful: ${JSON.stringify(response.data)}`);
      showSuccess('Request completed successfully');
    } catch (error: any) {
      addResult(`❌ Request failed (no refresh attempted): ${error.message}`);
      showError('Request failed without refresh');
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <h2 className='text-2xl font-bold mb-4'>Token Refresh Demo</h2>

      <div className='space-y-4 mb-6'>
        <div className='bg-blue-50 p-4 rounded-lg'>
          <h3 className='font-semibold text-blue-800 mb-2'>How it works:</h3>
          <ul className='text-sm text-blue-700 space-y-1'>
            <li>
              • When a request gets 401 (Unauthorized), the system automatically
              tries to refresh the token
            </li>
            <li>
              • During refresh, other 401 requests are queued and retried after
              refresh completes
            </li>
            <li>
              • If refresh succeeds, all queued requests are retried with the
              new token
            </li>
            <li>
              • If refresh fails, user is automatically redirected to login page
            </li>
            <li>
              • Use skipRefresh=true to bypass this behavior for specific
              requests
            </li>
          </ul>
        </div>

        <div className='flex gap-2 flex-wrap'>
          <button
            onClick={testSingleRequest}
            disabled={isLoading}
            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50'
          >
            Test Single Request
          </button>

          <button
            onClick={testConcurrentRequests}
            disabled={isLoading}
            className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50'
          >
            Test Concurrent Requests
          </button>

          <button
            onClick={testSkipRefresh}
            disabled={isLoading}
            className='px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50'
          >
            Test Skip Refresh
          </button>

          <button
            onClick={clearResults}
            className='px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600'
          >
            Clear Results
          </button>
        </div>
      </div>

      {isLoading && (
        <div className='flex items-center gap-2 mb-4'>
          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500'></div>
          <span className='text-sm text-gray-600'>Testing requests...</span>
        </div>
      )}

      <div className='bg-gray-50 p-4 rounded-lg'>
        <h3 className='font-semibold mb-2'>Request Log:</h3>
        <div className='space-y-1 text-sm font-mono max-h-64 overflow-y-auto'>
          {results.length === 0 ? (
            <div className='text-gray-500'>No requests made yet...</div>
          ) : (
            results.map((result, index) => (
              <div key={index} className='text-gray-700'>
                {result}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
