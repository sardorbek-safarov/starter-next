import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_ENDPOINTS } from '../config/api';

interface RequestConfig extends AxiosRequestConfig {
  skipRefresh?: boolean;
}

class HttpClient {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  constructor() {
    // Create axios instance
    this.axiosInstance = axios.create({
      timeout: 10000, // 10 seconds timeout
      withCredentials: true, // Include cookies in requests
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging and cookie handling
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const isServer = typeof window === 'undefined';

        console.log('🔍 HttpClient Request:', {
          url: config.url,
          method: config.method?.toUpperCase(),
          environment: isServer ? 'SERVER' : 'CLIENT',
          timestamp: new Date().toISOString(),
        });

        // Add cookies based on environment
        const cookieHeaders = await this.getCookieHeaders(isServer);
        Object.assign(config.headers, cookieHeaders);

        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If we get 401 and haven't already tried to refresh
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.skipRefresh
        ) {
          // Check if we're on auth pages - don't try to refresh tokens there
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            const isAuthPage =
              currentPath.includes('/login') ||
              currentPath.includes('/register');

            if (isAuthPage) {
              console.log(
                '🚫 On auth page, skipping token refresh for 401 error'
              );
              return Promise.reject(error);
            }
          }

          // Mark this request as retried
          originalRequest._retry = true;

          if (this.isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => {
                return this.axiosInstance.request(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          // Start refresh process
          this.isRefreshing = true;

          try {
            const refreshSuccess = await this.refreshToken();

            if (refreshSuccess) {
              // Process all queued requests
              this.processQueue(null);
              // Retry the original request
              return this.axiosInstance.request(originalRequest);
            } else {
              // Refresh failed - reject all queued requests and redirect to login
              this.processQueue(new Error('Token refresh failed'));
              this.handleAuthFailure();
              return Promise.reject(error);
            }
          } catch (refreshError: any) {
            console.error('🚫 Token refresh process failed:', refreshError);
            this.processQueue(
              refreshError instanceof Error
                ? refreshError
                : new Error('Token refresh failed')
            );
            this.handleAuthFailure();
            return Promise.reject(error);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async request(
    url: string,
    config: RequestConfig = {}
  ): Promise<AxiosResponse> {
    const { skipRefresh, ...axiosConfig } = config;

    try {
      const response = await this.axiosInstance.request({
        url,
        ...axiosConfig,
        skipRefresh, // Pass skipRefresh for the interceptor
      } as any);

      return response;
    } catch (error: any) {
      console.error('HTTP Request failed:', {
        url,
        method: config.method || 'GET',
        status: error.response?.status,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  // Token refresh logic
  private async refreshToken(): Promise<boolean> {
    // If already refreshing, wait for the existing promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this._performTokenRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } catch (error) {
      console.error('🚫 Refresh token process error:', error);
      return false;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async _performTokenRefresh(): Promise<boolean> {
    try {
      console.log('🔄 Attempting token refresh...');

      const response = await axios.post(
        API_ENDPOINTS.BACKEND.AUTH.REFRESH,
        {},
        {
          withCredentials: true,
          timeout: 5000,
        }
      );

      if (response.status >= 200 && response.status < 300) {
        console.log('✅ Token refresh successful');
        return true;
      } else {
        console.warn(`⚠️ Token refresh returned status: ${response.status}`);
        return false;
      }
    } catch (error: any) {
      console.error('🚫 Token refresh failed:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });

      // If refresh token is also expired/invalid (401/403), we need to logout and redirect
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log(
          '🚪 Refresh token expired, calling logout to clear cookies...'
        );

        // Call logout endpoint to clear server-side cookies
        try {
          await axios.post(
            API_ENDPOINTS.BACKEND.AUTH.LOGOUT,
            {},
            {
              withCredentials: true,
              timeout: 5000,
            }
          );
          console.log(
            '✅ Logout request successful - server-side cookies cleared (including HttpOnly)'
          );
        } catch (logoutError: any) {
          console.warn(
            '⚠️ Logout request failed, but continuing with cleanup:',
            {
              status: logoutError.response?.status,
              message: logoutError.message,
            }
          );
        }

        // Don't return false here, throw an error to trigger handleAuthFailure
        throw new Error('Refresh token expired');
      }

      return false;
    }
  }

  // Process queued requests after token refresh
  private processQueue(error: any) {
    console.log(`📋 Processing ${this.failedQueue.length} queued requests`, {
      error: !!error,
    });

    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(null);
      }
    });

    this.failedQueue = [];
  }

  // Handle authentication failure (redirect to login)
  private handleAuthFailure() {
    console.log('🚪 Handling authentication failure - redirecting to login');

    // Only redirect on client side
    if (typeof window !== 'undefined') {
      // Clear any stored tokens/data
      this.clearAuthData();

      // Prevent redirect loops - don't redirect if already on login/register pages
      const currentPath = window.location.pathname;
      const isAuthPage =
        currentPath.includes('/login') || currentPath.includes('/register');

      if (isAuthPage) {
        console.log(
          '🚫 Already on auth page, skipping redirect to prevent loop'
        );
        return;
      }

      // Get current path for redirect after login (without existing redirect params)
      const cleanPath = window.location.pathname;
      const loginUrl = `/login?redirect=${encodeURIComponent(cleanPath)}`;

      console.log('🔄 Redirecting to:', loginUrl);

      // Use window.location.replace to avoid adding to history
      // This prevents the user from going back to the failed page
      setTimeout(() => {
        window.location.replace(loginUrl);
      }, 100);
    }
  }

  // Clear authentication data
  private clearAuthData() {
    console.log('🧹 Clearing client-accessible authentication data');

    // Clear cookies (if accessible from client)
    // NOTE: This can only clear regular cookies, NOT HttpOnly cookies
    // HttpOnly cookies must be cleared by the server (via logout endpoint)
    if (typeof document !== 'undefined') {
      // Clear only the cookies we actually use for auth
      const cookiesToClear = ['access_token', 'refresh_token'];

      cookiesToClear.forEach((cookieName) => {
        // Clear for root path
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        // Clear for current path (in case cookies were set with specific paths)
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${window.location.pathname};`;
        // Clear without path specification
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
      });

      console.log(
        '✅ Cleared client-accessible cookies (HttpOnly cookies require server-side clearing)'
      );
    }
  } // 🍪 COOKIE HANDLING - Different for server vs client
  private async getCookieHeaders(
    isServer: boolean
  ): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};

    if (isServer) {
      // 🖥️ SERVER-SIDE: Dynamically import cookies to avoid client-side issues
      try {
        // Dynamic import to avoid bundling next/headers in client code
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        const cookieString = cookieStore.toString();

        console.log('🖥️ Server-side cookies:', cookieString);

        // Add the entire cookie string to the Cookie header
        if (cookieString) {
          headers['Cookie'] = cookieString;
        }

        // Also add individual cookies as custom headers if needed
        const accessToken = cookieStore.get('access_token')?.value;
        const refreshToken = cookieStore.get('refresh_token')?.value;

        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }
      } catch (error) {
        console.error('Error reading server-side cookies:', error);
        // Fallback: try to read from process.env or other server-side methods
      }
    } else {
      // 🌐 CLIENT-SIDE: Read from document.cookie
      const clientCookies = this.parseClientCookies(document.cookie);
      console.log('🌐 Client-side cookies:', clientCookies);

      // Add specific cookies as headers if needed
      if (clientCookies['access_token']) {
        headers['Authorization'] = `Bearer ${clientCookies['access_token']}`;
      }
    }

    return headers;
  }

  private parseClientCookies(cookieString: string): Record<string, string> {
    const cookies: Record<string, string> = {};

    if (!cookieString) return cookies;

    cookieString.split(';').forEach((cookie) => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });

    return cookies;
  }

  // Convenience methods - Updated to work with axios responses
  async get(url: string, config?: RequestConfig): Promise<AxiosResponse> {
    return this.request(url, { ...config, method: 'GET' });
  }

  async post(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<AxiosResponse> {
    return this.request(url, {
      ...config,
      method: 'POST',
      data,
    });
  }

  async put(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<AxiosResponse> {
    return this.request(url, {
      ...config,
      method: 'PUT',
      data,
    });
  }

  async delete(url: string, config?: RequestConfig): Promise<AxiosResponse> {
    return this.request(url, { ...config, method: 'DELETE' });
  }
}

export const httpClient = new HttpClient();
