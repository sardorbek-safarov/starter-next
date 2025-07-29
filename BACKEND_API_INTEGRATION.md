# Backend API Integration Guide

## Overview

This guide shows how to fetch users from your backend API using both server-side and client-side approaches in Next.js 15.

## Backend Configuration

Your backend API is configured in `/src/shared/config/api.ts`:

```typescript
export const API_CONFIG = {
  BACKEND_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8080',
  API_VERSION: '/api/v1',
};

export function buildBackendUrl(endpoint: string): string {
  const baseUrl = API_CONFIG.BACKEND_BASE_URL;
  const version = API_CONFIG.API_VERSION;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}${version}/${cleanEndpoint}`;
}
```

## Environment Variables

Create a `.env.local` file in your project root:

```bash
# Your backend API base URL
API_BASE_URL=http://localhost:8080
# or for production
# API_BASE_URL=https://your-api.com
```

## Server-Side Data Fetching (SSR)

### Basic Example (`/users-server`)

```typescript
async function fetchUsers(): Promise<UsersResponse> {
  try {
    const backendUrl = buildBackendUrl('users');
    const response = await fetch(backendUrl, {
      cache: 'no-store', // Always fetch fresh data
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
    console.error('Error fetching users:', error);
    return {
      users: [],
      total: 0,
      page: 1,
      pageSize: 10,
    };
  }
}
```

### Advanced Example with Authentication (`/users-advanced`)

```typescript
async function fetchUsersWithAuth(): Promise<UsersResponse> {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;

    const backendUrl = buildBackendUrl('users');
    const response = await fetch(backendUrl, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
        Cookie: cookieStore.toString(),
      },
    });

    // Handle different HTTP status codes
    if (response.status === 401) {
      throw new Error('Unauthorized - Please log in');
    }
    if (response.status === 403) {
      throw new Error('Access denied - Insufficient permissions');
    }
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return { users: [], total: 0, page: 1, pageSize: 10 };
  }
}
```

## Client-Side Data Fetching (`/users-client`)

### Using HTTP Client (Recommended)

```typescript
const fetchUsers = async (page = 1, pageSize = 10) => {
  try {
    setLoading(true);

    // Using your configured HTTP client with automatic auth handling
    const response = await httpClient.get(
      buildBackendUrl(`users?page=${page}&pageSize=${pageSize}`)
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }

    const data = await response.json();
    setUsers(data.users || []);

    showSuccess(`Loaded ${data.users?.length || 0} users`);
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Failed to fetch users';
    showError(errorMessage);
  } finally {
    setLoading(false);
  }
};
```

### Using Direct Fetch

```typescript
const fetchUsersDirectly = async () => {
  try {
    const response = await fetch(buildBackendUrl('users'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`, // if needed
      },
      credentials: 'include', // Include cookies
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    setUsers(data.users || data);
  } catch (err) {
    showError('Failed to fetch users');
  }
};
```

## Backend API Expected Response Format

Your backend should return responses in this format:

```json
{
  "users": [
    {
      "id": "1",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-15T10:30:00Z",
      "role": "user"
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 10,
  "totalPages": 10
}
```

Alternative formats are also supported:

- `data` instead of `users`
- `count` instead of `total`
- `currentPage` instead of `page`
- `limit` or `per_page` instead of `pageSize`

## Authentication Methods

### 1. Bearer Token Authentication

```typescript
headers: {
  'Authorization': `Bearer ${token}`,
}
```

### 2. Cookie-Based Authentication

```typescript
// Server-side
headers: {
  'Cookie': cookieStore.toString(),
}

// Client-side
credentials: 'include'
```

### 3. Custom Headers

```typescript
headers: {
  'X-API-Key': 'your-api-key',
  'X-User-ID': userId,
}
```

## Error Handling

### Server-Side Errors

- Return empty data structure to prevent page crashes
- Log errors to server console for debugging
- Provide user-friendly error pages

### Client-Side Errors

- Use toast notifications for user feedback
- Implement retry mechanisms
- Show loading states and error messages

## When to Use Each Approach

### Server-Side Rendering (SSR)

✅ **Use when:**

- SEO is important
- Initial page load speed is critical
- Data doesn't need frequent updates
- You want to reduce client-side JavaScript

❌ **Don't use when:**

- Real-time updates are needed
- Heavy user interaction is required
- Data needs frequent filtering/searching

### Client-Side Rendering (CSR)

✅ **Use when:**

- Interactive features are needed (pagination, filtering)
- Real-time updates are required
- User-specific data that changes frequently
- Rich user interactions

❌ **Don't use when:**

- SEO is critical
- Users have slow internet connections
- Initial content needs to be immediately visible

## Testing Your Implementation

1. **Check your backend is running:**

   ```bash
   curl http://localhost:8080/api/v1/users
   ```

2. **Test the pages:**

   - Visit `/users-server` for server-side rendering
   - Visit `/users-advanced` for advanced server-side with auth
   - Visit `/users-client` for client-side rendering

3. **Monitor network requests:**
   - Server-side: Check server logs
   - Client-side: Check browser DevTools → Network tab

## Common Issues and Solutions

### CORS Issues

Add CORS headers to your backend:

```javascript
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
```

### Environment Variables Not Working

- Restart your Next.js dev server after adding new env vars
- Server-side: Use `process.env.API_BASE_URL`
- Client-side: Use `process.env.NEXT_PUBLIC_API_BASE_URL`

### Authentication Not Working

- Check cookie settings (httpOnly, secure, sameSite)
- Verify token expiration
- Ensure proper CORS configuration for credentials

## Performance Optimization

### Server-Side

- Use appropriate cache strategies
- Implement database query optimization
- Consider using ISR (Incremental Static Regeneration)

### Client-Side

- Implement proper loading states
- Use debouncing for search functionality
- Consider using TanStack Query for caching

## Security Considerations

1. **Never expose sensitive data** in client-side code
2. **Validate all inputs** on both client and server
3. **Use HTTPS** in production
4. **Implement proper authentication** and authorization
5. **Sanitize data** before displaying to users

This setup gives you a robust foundation for integrating with your backend API! 🚀
