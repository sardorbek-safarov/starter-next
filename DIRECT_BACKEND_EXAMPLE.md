// Example: Direct Backend Authentication (without INTERNAL routes)

// Updated API configuration - DIRECT BACKEND ONLY
export const API_CONFIG = {
BACKEND_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8080',
API_VERSION: '/api/v1',
} as const;

// Helper function to build backend API URLs
export function buildBackendUrl(endpoint: string): string {
const baseUrl = API_CONFIG.BACKEND_BASE_URL;
const version = API_CONFIG.API_VERSION;
const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
return `${baseUrl}${version}/${cleanEndpoint}`;
}

// Simplified API endpoints - ONLY BACKEND
export const API_ENDPOINTS = {
AUTH: {
LOGIN: buildBackendUrl('auth/login'),
REGISTER: buildBackendUrl('auth/register'),
LOGOUT: buildBackendUrl('auth/logout'),
ME: buildBackendUrl('auth/me'),
REFRESH: buildBackendUrl('auth/refresh'),
},
USERS: buildBackendUrl('users'),
// Add other endpoints as needed
} as const;

// Updated HTTP Client for direct backend communication
class DirectBackendClient {
private baseUrl: string;

constructor() {
this.baseUrl = API_CONFIG.BACKEND_BASE_URL + API_CONFIG.API_VERSION;
}

async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
const url = `${this.baseUrl}/${endpoint}`;

    return fetch(url, {
      ...options,
      credentials: 'include', // Important for cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

}

async get(endpoint: string, options?: RequestInit) {
return this.request(endpoint, { ...options, method: 'GET' });
}

async post(endpoint: string, data?: any, options?: RequestInit) {
return this.request(endpoint, {
...options,
method: 'POST',
body: data ? JSON.stringify(data) : undefined,
});
}
}

export const backendClient = new DirectBackendClient();

// Updated Auth Hooks (example)
export function useLogin() {
const { showAuthError, showAuthSuccess } = useToast();
const queryClient = useQueryClient();
const router = useRouter();

return useMutation({
mutationFn: async (credentials: LoginCredentials) => {
const response = await backendClient.post('auth/login', credentials);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(error.message || 'Login failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'user'], data.user);
      showAuthSuccess('login');
      router.push('/');
    },
    onError: (error) => {
      showAuthError(error);
    },

});
}

// Required Backend CORS Configuration
// Your backend needs to allow your frontend domain:
/_
app.use(cors({
origin: ['http://localhost:3000', 'http://localhost:3001'], // Your Next.js app
credentials: true, // Important for cookies
methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
allowedHeaders: ['Content-Type', 'Authorization'],
}));
_/
