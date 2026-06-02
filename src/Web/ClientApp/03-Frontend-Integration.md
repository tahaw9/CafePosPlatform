# Phase 3: Frontend Integration Guide

This document provides a step-by-step guide to migrating the current React frontend from Zustand-based mock data to real REST API calls pointing to the .NET Core backend.

## 1. Environment Variables

Instead of hardcoding the backend URL, use Vite's environment variables to manage the API base URL.

1. **Create an `.env` file** in the root of your frontend project:
   ```env
   VITE_API_BASE_URL=https://localhost:7000/api
   ```

2. **Create an `.env.production` file** for deployment:
   ```env
   VITE_API_BASE_URL=https://api.yourdomain.com/api
   ```

## 2. API Client Setup (Axios)

While you can use `fetch`, `axios` is recommended for robust interceptors and simpler parsing.

**Install Axios:**
```bash
npm install axios
```

**Create an API service instance (`src/lib/api.ts`):**
```typescript
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor (Inject JWT Token)
api.interceptors.request.use(
  (config) => {
    // Get token from auth store or localStorage
    const token = useAuthStore.getState().token; 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (Global Error Handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check for 401 Unauthorized
    if (error.response?.status === 401) {
      toast.error('Session expired. Please log in again.');
      useAuthStore.getState().logout();
      window.location.href = '/login';
    } 
    // Handle 403 Forbidden
    else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.');
    } 
    // Handle validation errors or normal API errors
    else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } 
    // Generic fallback
    else {
      toast.error('An unexpected error occurred. Please try again.');
    }
    
    return Promise.reject(error);
  }
);
```

*(Note: Ensure your `useAuthStore` stores the JWT token when logging in).*

## 3. Refactoring Zustand Stores

Instead of keeping mock state, update the Zustand stores to make API calls using the configured `api` instance.

**Example: Refactoring `useMenuStore.ts`**

```typescript
import { create } from 'zustand';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

interface MenuState {
  items: MenuItem[];
  categories: Category[];
  isLoading: boolean;
  fetchMenu: () => Promise<void>;
  addItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
  updateItem: (id: string, item: Partial<MenuItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  items: [],
  categories: [],
  isLoading: false,

  fetchMenu: async () => {
    set({ isLoading: true });
    try {
      // Assuming GET /api/categories and GET /api/products
      const [categoriesRes, productsRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products')
      ]);

      set({ 
        categories: categoriesRes.data,
        items: productsRes.data 
      });
    } catch (error) {
      console.error('Failed to fetch menu', error);
      // Toast is handled by interceptor
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (newItem) => {
    try {
      const response = await api.post('/products', newItem);
      // Backend returns the created item with ID
      set((state) => ({ items: [...state.items, response.data] }));
      toast.success('Product created successfully');
    } catch (error) {
      console.error('Failed to add product', error);
    }
  },

  // Apply the same logic for updateItem and deleteItem...
}));
```

## 4. Backend CORS Configuration (.NET Core)

Since the React app and .NET API run on different ports locally (e.g., React on 3000, .NET on 7000), you must configure CORS in `.NET Core` to accept requests from the frontend.

**In `Program.cs`:**
```csharp
var builder = WebApplication.CreateBuilder(args);

// 1. Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000", "https://yourproductiondomain.com")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials(); // Useful if sending HttpOnly cookies
        });
});

var app = builder.Build();

// 2. Use CORS before Auth but after Routing
app.UseRouting();

app.UseCors("AllowReactApp"); // Must be here

app.UseAuthentication();
app.UseAuthorization();
```

## 5. Migration Strategy

1. **Keep Mock Data Initially:** Keep your current hardcoded data while scaffolding the backend.
2. **Component by Component:** Don't replace everything at once. Start with `MenuStore`, point it to the API, and verify the Frontend Menu renders perfectly.
3. **Handle Loading States:** With real networks, requests take time. Ensure your UI components use `isLoading` from Zustand stores to show Spinners or Skeletons.
4. **Error Handling:** Verify that the global Axios interceptor displays user-friendly Toasts correctly during API failures.
