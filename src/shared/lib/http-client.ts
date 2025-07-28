interface RequestConfig extends RequestInit {
  skipRefresh?: boolean;
}

class HttpClient {
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  async request(url: string, config: RequestConfig = {}): Promise<Response> {
    const { skipRefresh = false, ...fetchConfig } = config;

    // Always include credentials for cookies
    const requestConfig: RequestInit = {
      credentials: 'include',
      ...fetchConfig,
    };

    let response = await fetch(url, requestConfig);

    // If we get 401 and haven't already tried to refresh
    if (response.status === 401 && !skipRefresh && !this.isRefreshing) {
      const refreshSuccess = await this.refreshToken();

      if (refreshSuccess) {
        // Retry the original request
        response = await fetch(url, requestConfig);
      }
    }

    return response;
  }

  private async refreshToken(): Promise<boolean> {
    if (this.isRefreshing) {
      // If already refreshing, wait for that to complete
      return this.refreshPromise || Promise.resolve(false);
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performRefresh(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      return response.ok;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Convenience methods
  async get(url: string, config?: RequestConfig) {
    return this.request(url, { ...config, method: 'GET' });
  }

  async post(url: string, data?: any, config?: RequestConfig) {
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

  async put(url: string, data?: any, config?: RequestConfig) {
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

  async delete(url: string, config?: RequestConfig) {
    return this.request(url, { ...config, method: 'DELETE' });
  }
}

export const httpClient = new HttpClient();
