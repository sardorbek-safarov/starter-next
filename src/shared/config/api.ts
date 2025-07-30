// API Configuration
export const API_CONFIG = {
  // External backend API base URL
  BACKEND_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8080',

  // API version prefix
  API_VERSION: '/api/v1',

  // Internal Next.js API routes
  INTERNAL_API: {
    AUTH: '/api/auth',
  },
} as const;

// Helper function to build external API URLs
export function buildBackendUrl(endpoint: string): string {
  const baseUrl = API_CONFIG.BACKEND_BASE_URL;
  const version = API_CONFIG.API_VERSION;

  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

  return `${baseUrl}${version}/${cleanEndpoint}`;
}

// Helper function to build internal API URLs
export function buildInternalUrl(endpoint: string): string {
  const baseUrl = API_CONFIG.INTERNAL_API.AUTH;

  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

  return `${baseUrl}/${cleanEndpoint}`;
}

// Common API endpoints
export const API_ENDPOINTS = {
  // External backend endpoints
  BACKEND: {
    AUTH: {
      LOGIN: buildBackendUrl('auth/login'),
      REGISTER: buildBackendUrl('auth/register'),
      LOGOUT: buildBackendUrl('auth/logout'),
      PROFILE: buildBackendUrl('auth/profile'),
      REFRESH: buildBackendUrl('auth/refresh'),
      VERIFY: buildBackendUrl('auth/verify'),
    },
  },
} as const;
