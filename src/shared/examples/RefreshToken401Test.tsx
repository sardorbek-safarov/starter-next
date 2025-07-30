'use client';

import { useState } from 'react';
import { httpClient } from '@/shared/lib/http-client';

/**
 * Component to test the refresh token 401 handling
 * This demonstrates the fix where a 401 response from the refresh endpoint
 * properly redirects to login instead of causing a page reload
 */
export function RefreshToken401Test() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `${timestamp}: ${message}`;
    setTestResults((prev) => [...prev, logMessage]);
    console.log(logMessage);
  };

  const simulateExpiredRefreshToken = async () => {
    setIsLoading(true);
    setTestResults([]);

    addResult('🧪 Simulating scenario where refresh token is expired (401)');
    addResult('📝 Expected behavior: Navigate to login page (not reload)');

    try {
      // This should trigger:
      // 1. Initial request gets 401
      // 2. Refresh token request also gets 401 (expired refresh token)
      // 3. System should redirect to login page

      addResult('🔄 Making request that will trigger 401...');
      const response = await httpClient.get(
        '/api/protected/expired-tokens-test'
      );

      addResult(
        '✅ Request succeeded (unexpected - refresh token should have been expired)'
      );
    } catch (error: any) {
      addResult(`❌ Request failed: ${error.message}`);
      addResult('🔍 Check browser console for redirect logs');
      addResult(
        '⚠️ If you see this message, the redirect should have happened'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const testCurrentBehavior = async () => {
    setIsLoading(true);
    setTestResults([]);

    addResult('🧪 Testing current refresh token behavior');

    try {
      // Make a request that might need token refresh
      addResult('🔄 Making authenticated request...');
      const response = await httpClient.get('/api/user/profile');

      addResult('✅ Request succeeded - tokens are valid');
    } catch (error: any) {
      addResult(`❌ Request failed: ${error.message}`);

      // Check if we're being redirected
      if (
        error.message.includes('refresh') ||
        error.message.includes('token')
      ) {
        addResult('🚪 Token refresh process was triggered');
        addResult('📋 Check browser console for detailed logs');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <h2 className='text-2xl font-bold mb-4'>Refresh Token 401 Test</h2>

      <div className='space-y-4 mb-6'>
        <div className='bg-blue-50 p-4 rounded-lg'>
          <h3 className='font-semibold text-blue-800 mb-2'>What this tests:</h3>
          <ul className='text-sm text-blue-700 space-y-1'>
            <li>
              • <strong>Before fix:</strong> When refresh token returns 401,
              page would reload
            </li>
            <li>
              • <strong>After fix:</strong> When refresh token returns 401, user
              is redirected to login page
            </li>
            <li>
              • <strong>Behavior:</strong> Uses window.location.replace() to
              avoid history pollution
            </li>
            <li>
              • <strong>Cleanup:</strong> Clears all auth cookies, localStorage,
              and sessionStorage
            </li>
          </ul>
        </div>

        <div className='bg-yellow-50 p-4 rounded-lg'>
          <h3 className='font-semibold text-yellow-800 mb-2'>
            How it works now:
          </h3>
          <ol className='text-sm text-yellow-700 space-y-1'>
            <li>1. Request gets 401 → Triggers refresh token request</li>
            <li>
              2. Refresh token request gets 401/403 → Refresh token is expired
            </li>
            <li>3. System throws error "Refresh token expired"</li>
            <li>4. handleAuthFailure() is called</li>
            <li>5. All auth data is cleared</li>
            <li>6. User is redirected to /login?redirect=currentPage</li>
          </ol>
        </div>

        <div className='flex gap-2 flex-wrap'>
          <button
            onClick={simulateExpiredRefreshToken}
            disabled={isLoading}
            className='px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50'
          >
            Simulate Expired Refresh Token
          </button>

          <button
            onClick={testCurrentBehavior}
            disabled={isLoading}
            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50'
          >
            Test Current Behavior
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
          <span className='text-sm text-gray-600'>Running test...</span>
        </div>
      )}

      <div className='bg-gray-50 p-4 rounded-lg'>
        <h3 className='font-semibold mb-2'>Test Results:</h3>
        <div className='space-y-1 text-sm font-mono max-h-64 overflow-y-auto'>
          {testResults.length === 0 ? (
            <div className='text-gray-500'>No tests run yet...</div>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className='text-gray-700'>
                {result}
              </div>
            ))
          )}
        </div>
      </div>

      <div className='mt-6 p-4 bg-green-50 rounded-lg'>
        <h3 className='font-semibold text-green-800 mb-2'>
          Console Messages to Watch For:
        </h3>
        <ul className='text-sm text-green-700 space-y-1'>
          <li>
            • <code>🔄 Attempting token refresh...</code>
          </li>
          <li>
            • <code>🚫 Token refresh failed: {'{status: 401}'}</code>
          </li>
          <li>
            •{' '}
            <code>🚪 Refresh token expired, triggering login redirect...</code>
          </li>
          <li>
            •{' '}
            <code>
              🚪 Handling authentication failure - redirecting to login
            </code>
          </li>
          <li>
            • <code>🧹 Clearing authentication data</code>
          </li>
          <li>
            • <code>🔄 Redirecting to: /login?redirect=...</code>
          </li>
        </ul>
      </div>
    </div>
  );
}
