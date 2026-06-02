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
  users: User[];
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, data: Partial<User>) => void;
}

const mockUsers: User[] = [
  { id: '1', name: 'محمد احمدی', phone: '09123456789', role: 'admin', isActive: true },
  { id: '2', name: 'حسام', phone: '09198765432', role: 'barista', isActive: true },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      users: mockUsers,
      isAuthenticated: false,
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
      addUser: (userData) => set((state) => ({ 
        users: [...state.users, { ...userData, id: Date.now().toString() }] 
      })),
      updateUser: (id, data) => set((state) => ({
        users: state.users.map(u => u.id === id ? { ...u, ...data } : u)
      })),
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

