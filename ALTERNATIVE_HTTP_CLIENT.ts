// Alternative approach: Separate HTTP clients for server and client

// Base HTTP client without server-specific imports
class BaseHttpClient {
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  async request(url: string, config: RequestInit = {}): Promise<Response> {
    console.log('🔍 BaseHttpClient Request:', {
      url,
      method: config.method || 'GET',
      timestamp: new Date().toISOString(),
    });

    return fetch(url, config);
  }

  async get(url: string, config?: RequestInit) {
    return this.request(url, { ...config, method: 'GET' });
  }

  async post(url: string, data?: any, config?: RequestInit) {
    return this.request(url, {
      ...config,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(url: string, data?: any, config?: RequestInit) {
    return this.request(url, {
      ...config,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(url: string, config?: RequestInit) {
    return this.request(url, { ...config, method: 'DELETE' });
  }
}

// Client-side HTTP client (works in browser)
class ClientHttpClient extends BaseHttpClient {
  async request(url: string, config: RequestInit = {}): Promise<Response> {
    console.log('🌐 Client HTTP Request:', url);

    const requestConfig: RequestInit = {
      ...config,
      credentials: 'include', // Automatic cookie handling
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
        ...this.getClientCookieHeaders(),
      },
    };

    return super.request(url, requestConfig);
  }

  private getClientCookieHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    if (typeof document !== 'undefined') {
      const cookies = this.parseCookies(document.cookie);

      if (cookies['auth-token']) {
        headers['Authorization'] = `Bearer ${cookies['auth-token']}`;
      }

      if (cookies['session-id']) {
        headers['X-Session-ID'] = cookies['session-id'];
      }
    }

    return headers;
  }

  private parseCookies(cookieString: string): Record<string, string> {
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
}

// Server-side HTTP client (works on server)
class ServerHttpClient extends BaseHttpClient {
  async request(url: string, config: RequestInit = {}): Promise<Response> {
    console.log('🖥️ Server HTTP Request:', url);

    const requestConfig: RequestInit = {
      ...config,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
        ...(await this.getServerCookieHeaders()),
      },
    };

    return super.request(url, requestConfig);
  }

  private async getServerCookieHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};

    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const cookieString = cookieStore.toString();

      console.log('🖥️ Server cookies:', cookieString);

      if (cookieString) {
        headers['Cookie'] = cookieString;
      }

      // Individual cookie headers
      const authToken = cookieStore.get('auth-token')?.value;
      const sessionId = cookieStore.get('session-id')?.value;

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      if (sessionId) {
        headers['X-Session-ID'] = sessionId;
      }
    } catch (error) {
      console.error('Error reading server cookies:', error);
    }

    return headers;
  }
}

// Factory function to get the right client
export function createHttpClient() {
  if (typeof window === 'undefined') {
    return new ServerHttpClient();
  } else {
    return new ClientHttpClient();
  }
}

// Export a singleton instance
export const httpClient = createHttpClient();
