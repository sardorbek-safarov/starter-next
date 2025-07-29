# API Configuration Guide

## Overview

The project now uses a centralized API configuration system that makes it easy to change base URLs and manage all API endpoints from a single location.

## Key Files

### 1. `/src/shared/config/api.ts`

This is the main configuration file that defines all API endpoints and base URLs.

### 2. Environment Variables

- `.env.local` - Contains the `API_BASE_URL` for your backend server

## How to Change Base URLs

### Changing Backend API Base URL

1. **Update Environment Variable**:

   ```env
   # .env.local
   API_BASE_URL=https://your-new-backend-url.com
   ```

2. **Or Update Directly in Config** (not recommended):
   ```typescript
   // src/shared/config/api.ts
   export const API_CONFIG = {
     BACKEND_BASE_URL: 'https://your-new-backend-url.com',
     // ...
   };
   ```

### Changing API Version

Update the API version prefix in the config:

```typescript
// src/shared/config/api.ts
export const API_CONFIG = {
  API_VERSION: '/api/v2', // Changed from /api/v1
  // ...
};
```

### Changing Internal Next.js API Routes

If you need to change the internal API route structure:

```typescript
// src/shared/config/api.ts
export const API_CONFIG = {
  INTERNAL_API: {
    AUTH: '/api/v1/auth', // Changed from /api/auth
  },
};
```

## API Endpoints Structure

### External Backend Endpoints (via API_BASE_URL)

- `${API_BASE_URL}/api/v1/auth/login`
- `${API_BASE_URL}/api/v1/auth/register`
- `${API_BASE_URL}/api/v1/auth/logout`
- `${API_BASE_URL}/api/v1/auth/me`
- `${API_BASE_URL}/api/v1/auth/refresh`
- `${API_BASE_URL}/api/v1/auth/verify`

### Internal Next.js API Routes

- `/api/auth/login`
- `/api/auth/register`
- `/api/auth/logout`
- `/api/auth/me`
- `/api/auth/refresh`

## Files Updated

All API calls now use the centralized configuration:

### Server-side Files:

- `src/shared/lib/with-auth.ts`
- `src/shared/lib/auth-server.ts`
- `src/app/api/auth/*/route.ts`

### Client-side Files:

- `src/features/auth/hooks/useAuthQueries.ts`
- `src/shared/lib/http-client.ts`

## Benefits

1. **Single Source of Truth**: All API endpoints defined in one place
2. **Easy Migration**: Change base URL in one location
3. **Environment Flexibility**: Different URLs for dev/staging/prod
4. **Type Safety**: TypeScript ensures correct endpoint usage
5. **Consistency**: Prevents hardcoded URLs scattered throughout codebase

## Example: Switching Environments

### Development

```env
API_BASE_URL=http://localhost:8080
```

### Staging

```env
API_BASE_URL=https://api-staging.yourapp.com
```

### Production

```env
API_BASE_URL=https://api.yourapp.com
```

The same codebase works across all environments by just changing the environment variable!
