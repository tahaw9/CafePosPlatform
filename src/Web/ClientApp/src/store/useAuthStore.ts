import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'barista';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
}

interface AuthState {
  token: string | null;
  user: User | null; 
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, data: Partial<User>) => void;
}



export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
      addUser: () => {},
      updateUser: () => {},
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

