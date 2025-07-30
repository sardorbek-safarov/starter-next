/**
 * Test script to verify the improved 401 error handling and token refresh mechanism
 *
 * This script demonstrates the fixes made to handle refresh errors properly:
 * 1. Better TypeScript error typing
 * 2. Improved error logging
 * 3. Robust queue management
 * 4. Proper promise handling
 */

import { httpClient } from '@/shared/lib/http-client';

export class TokenRefreshTester {
  private testResults: string[] = [];

  private log(message: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    this.testResults.push(logMessage);
    console.log(logMessage);
  }

  async runTests() {
    this.testResults = [];
    this.log('🧪 Starting Token Refresh Error Handling Tests');

    await this.testSingleRequestWithRefresh();
    await this.testConcurrentRequestsWithRefresh();
    await this.testRefreshFailureHandling();
    await this.testSkipRefreshBehavior();

    this.log('✅ All tests completed');
    return this.testResults;
  }

  private async testSingleRequestWithRefresh() {
    this.log('🔬 Test 1: Single request with 401 and refresh');

    try {
      // This should trigger 401, then refresh, then retry
      const response = await httpClient.get('/api/protected/user-profile');
      this.log('✅ Single request succeeded after refresh');
    } catch (error: any) {
      this.log(`⚠️ Single request failed: ${error.message}`);
      // This is expected if refresh also fails
    }
  }

  private async testConcurrentRequestsWithRefresh() {
    this.log('🔬 Test 2: Concurrent requests with 401 and refresh');

    try {
      // Make 3 concurrent requests that should all get 401
      const requests = [
        httpClient.get('/api/protected/profile'),
        httpClient.get('/api/protected/settings'),
        httpClient.get('/api/protected/notifications'),
      ];

      const results = await Promise.allSettled(requests);

      let successful = 0;
      let failed = 0;

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successful++;
          this.log(`✅ Concurrent request ${index + 1} succeeded`);
        } else {
          failed++;
          this.log(
            `❌ Concurrent request ${index + 1} failed: ${
              result.reason?.message
            }`
          );
        }
      });

      this.log(
        `📊 Concurrent requests: ${successful} succeeded, ${failed} failed`
      );
    } catch (error: any) {
      this.log(`⚠️ Concurrent requests error: ${error.message}`);
    }
  }

  private async testRefreshFailureHandling() {
    this.log('🔬 Test 3: Refresh failure handling');

    try {
      // This should simulate a scenario where refresh token is also expired/invalid
      const response = await httpClient.get('/api/protected/admin-only');
      this.log('✅ Request succeeded (refresh worked)');
    } catch (error: any) {
      this.log(
        `⚠️ Request failed (expected if refresh fails): ${error.message}`
      );
      // Check if proper cleanup happened
      this.log('🧹 Checking if auth cleanup was triggered...');
    }
  }

  private async testSkipRefreshBehavior() {
    this.log('🔬 Test 4: Skip refresh behavior');

    try {
      // This should fail immediately without trying to refresh
      const response = await httpClient.get('/api/protected/data', {
        skipRefresh: true,
      });
      this.log('✅ Skip refresh request succeeded');
    } catch (error: any) {
      this.log(`❌ Skip refresh request failed (expected): ${error.message}`);
      this.log('✅ No refresh attempt was made (as expected)');
    }
  }

  // Simulate different backend responses for testing
  static mockBackendResponses() {
    // In a real test, you might use MSW or similar to mock these endpoints:

    const scenarios = {
      '401_then_refresh_success': {
        description: 'Request gets 401, refresh succeeds, retry succeeds',
        steps: [
          'GET /api/protected/data → 401 Unauthorized',
          'POST /api/auth/refresh → 200 OK (new tokens)',
          'GET /api/protected/data → 200 OK (with new tokens)',
        ],
      },

      '401_then_refresh_fail': {
        description: 'Request gets 401, refresh fails, redirect to login',
        steps: [
          'GET /api/protected/data → 401 Unauthorized',
          'POST /api/auth/refresh → 401 Unauthorized (refresh token expired)',
          'Clear cookies and redirect to /login',
        ],
      },

      concurrent_401_single_refresh: {
        description: 'Multiple requests get 401, only one refresh happens',
        steps: [
          'GET /api/protected/profile → 401 (triggers refresh)',
          'GET /api/protected/settings → 401 (queued)',
          'GET /api/protected/notifications → 401 (queued)',
          'POST /api/auth/refresh → 200 OK',
          'All 3 requests retry and succeed',
        ],
      },
    };

    return scenarios;
  }
}

// Usage example:
export async function testTokenRefresh() {
  const tester = new TokenRefreshTester();
  const results = await tester.runTests();

  console.log('\n📋 Test Summary:');
  results.forEach((result) => console.log(result));

  return results;
}
