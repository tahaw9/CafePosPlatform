import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Resolve the API base URL:
// 1. VITE_API_URL — explicit override (e.g. "http://localhost:5000/api")
// 2. Aspire-injected service reference — services__webapi__https__0 / http__0
//    These contain the raw origin (e.g. "http://localhost:5234"), so we append "/api".
// 3. Fallback to "/api" (same-origin, e.g. when the SPA is served by the backend).
function resolveApiBaseUrl(): string {
  const env = (import.meta as any).env;

  // Explicit full URL takes highest priority
  if (env.VITE_API_URL) return env.VITE_API_URL;

  // Aspire injects these when using .WithReference(web) in the AppHost
  const aspireUrl = env.services__webapi__https__0 || env.services__webapi__http__0;
  if (aspireUrl) return `${aspireUrl}/api`;

  return '/api';
}

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) return path;
  
  const env = (import.meta as any).env;
  let baseUrl = '';
  
  if (env.VITE_API_URL) {
    baseUrl = env.VITE_API_URL.replace(/\/api$/, '');
  } else {
    const aspireUrl = env.services__webapi__https__0 || env.services__webapi__http__0;
    if (aspireUrl) baseUrl = aspireUrl;
  }
  
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
});

api.interceptors.request.use(
  (config) => {
    // Get the JWT token from the Zustand store
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the response is 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Clear token and user data from the store and localStorage
      useAuthStore.getState().logout();

      // Optionally redirect to login, but handling this through reactivity in App.tsx or ProtectedRoute is usually better.
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;
