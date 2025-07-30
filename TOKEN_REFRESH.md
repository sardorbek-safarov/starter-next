# Enhanced Token Refresh & Retry Mechanism

## Overview

Your application now includes a robust token refresh and retry mechanism that automatically handles expired authentication tokens. When a request receives a 401 (Unauthorized) response, the system will:

1. **Automatically attempt to refresh the token**
2. **Queue other failing requests during refresh**
3. **Retry all queued requests after successful refresh**
4. **Redirect to login if refresh fails**

## How It Works

### Automatic 401 Handling

```typescript
// This request will automatically retry if it gets 401
const response = await httpClient.get('/api/protected-data');
```

**Flow:**

1. Request fails with 401
2. System detects expired token
3. Automatically calls refresh token endpoint
4. If refresh succeeds, retries original request
5. If refresh fails, redirects to login page

### Concurrent Request Handling

When multiple requests fail with 401 simultaneously:

```typescript
// All these requests will be queued during token refresh
const [users, posts, comments] = await Promise.all([
  httpClient.get('/api/users'),
  httpClient.get('/api/posts'),
  httpClient.get('/api/comments'),
]);
```

**Flow:**

1. All requests fail with 401
2. First request triggers token refresh
3. Other requests are queued (not duplicating refresh)
4. After successful refresh, all requests retry automatically
5. All requests complete with fresh token

### Skip Refresh Option

For special cases where you don't want automatic retry:

```typescript
// This request will NOT attempt token refresh on 401
const response = await httpClient.get('/api/public-data', {
  skipRefresh: true,
});
```

## Key Features

### ✅ Race Condition Prevention

- Only one token refresh happens at a time
- Multiple concurrent 401s are queued properly
- No duplicate refresh requests

### ✅ Smart Queue Management

- Failed requests are queued during refresh
- Queued requests retry after successful refresh
- Queue is cleared on refresh failure

### ✅ Automatic Cleanup

- Failed refresh clears auth cookies
- Redirects to login with current page as redirect parameter
- Preserves user's intended destination

### ✅ Server/Client Compatibility

- Works in both server and client environments
- Handles Next.js cookies appropriately
- Only redirects on client side

## Configuration

### HTTP Client Setup

The enhanced token refresh is configured in `/src/shared/lib/http-client.ts`:

```typescript
// Core configuration
const httpClient = new HttpClient();

// The client automatically:
// - Detects 401 responses
// - Manages refresh token requests
// - Queues and retries failed requests
// - Handles authentication cleanup
```

### Refresh Endpoint

Make sure your backend supports the refresh endpoint:

```typescript
// Expected endpoint
POST / api / auth / refresh;

// Should:
// - Accept refresh token via cookies
// - Return new access token
// - Set new cookies with fresh tokens
// - Return 200 on success, 401/403 on failure
```

## Usage Examples

### With React Query

```typescript
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      // Automatic retry on 401 - no extra code needed!
      const response = await httpClient.get(`/api/users/${userId}`);
      return response.data;
    },
  });
}
```

### With Mutations

```typescript
export function useUpdateProfile() {
  return useMutation({
    mutationFn: async (data) => {
      // Automatic retry on 401 - no extra code needed!
      const response = await httpClient.put('/api/profile', data);
      return response.data;
    },
  });
}
```

### Manual Error Handling

```typescript
try {
  const response = await httpClient.get('/api/data');
  return response.data;
} catch (error) {
  // If we get here, either:
  // 1. Refresh was successful but the retried request still failed
  // 2. Refresh failed and user will be redirected to login
  // 3. Error was not 401 related
  console.error('Request failed:', error);
}
```

## Error Scenarios

### Successful Refresh

1. Request gets 401
2. Token refresh succeeds
3. Original request retries and succeeds
4. User continues working normally

### Failed Refresh

1. Request gets 401
2. Token refresh fails (refresh token expired/invalid)
3. Auth cookies are cleared
4. User is redirected to login page
5. Login page includes redirect parameter to return user to original page

### Network Issues

1. Request fails due to network/server error
2. No token refresh is attempted
3. Error is passed through to application code
4. Application can handle as appropriate

## Testing

Use the demo component to test the behavior:

```typescript
import { TokenRefreshDemo } from '@/shared/examples/TokenRefreshDemo';

// Add to your page to test:
<TokenRefreshDemo />;
```

The demo allows you to:

- Test single requests with 401 handling
- Test concurrent requests with queuing
- Test skip refresh behavior
- See detailed logs of the retry process

## Best Practices

### ✅ Do

- Let the system handle 401s automatically
- Use the normal httpClient methods
- Trust the retry mechanism
- Handle final errors appropriately

### ❌ Don't

- Manually implement token refresh logic
- Try/catch 401 errors for token handling
- Make multiple refresh requests
- Skip refresh unless absolutely necessary

## Troubleshooting

### Common Issues

**Infinite redirects:**

- Check that login page doesn't make authenticated requests
- Ensure refresh endpoint returns proper status codes

**Refresh not working:**

- Verify refresh endpoint is correct
- Check that cookies are being sent properly
- Ensure backend accepts and validates refresh tokens

**Requests not retrying:**

- Check for `skipRefresh: true` in request config
- Verify the request is actually getting 401 status
- Check browser dev tools for network activity

### Debug Logging

The system includes detailed logging:

```typescript
// Check browser console for:
// 🔍 HttpClient Request logs
// 🔄 Token refresh successful
// 🚫 Token refresh failed
```

## Migration Notes

If migrating from manual token refresh:

1. **Remove manual refresh logic** - The interceptor handles it
2. **Remove token refresh hooks** - Use the automatic system
3. **Update error handling** - Don't catch 401s for token refresh
4. **Test thoroughly** - Verify automatic behavior works as expected

The system is designed to be transparent - your existing code should work without changes while gaining automatic token refresh capabilities.
