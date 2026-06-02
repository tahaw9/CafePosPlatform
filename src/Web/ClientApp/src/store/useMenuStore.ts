import { create } from 'zustand';
import { createProduct } from '../lib/productService';
import toast from 'react-hot-toast';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
  isAvailable: boolean;
  category: string;
  description?: string;
}

interface MenuState {
  items: MenuItem[];
  categories: { id: string; name: string; icon: string }[];
  isSubmitting: boolean;
  fetchMenu: () => void;
  addItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
  updateItem: (id: string, item: Partial<Omit<MenuItem, 'id'>>) => void;
  deleteItem: (id: string) => void;
  toggleItemAvailability: (id: string) => void;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  items: [],
  categories: [
    { id: '9d5e69a9-6735-454e-9dea-0c3511ede9b0', name: 'قهوه', icon: 'Coffee' },
    { id: 'cold', name: 'نوشیدنی سرد', icon: 'GlassWater' },
    { id: 'fastfood', name: 'فست فود', icon: 'Sandwich' },
    { id: 'pizza', name: 'پیتزا', icon: 'Pizza' },
    { id: 'pastry', name: 'شیرینی', icon: 'Croissant' },
  ],
  isSubmitting: false,
  fetchMenu: () => {
    // Mock data for Phase 2
    set((state) => {
      if (state.items.length > 0) return state; // Only intialize once if empty
      return {
        items: [
          { id: '1', name: 'اسپرسو', price: 55000, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80', isAvailable: true, category: 'coffee', description: 'یک شات اسپرسو خالص' },
          { id: '2', name: 'لاته', price: 85000, image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400&q=80', isAvailable: true, category: 'coffee', description: 'ترکیب اسپرسو و شیر گرم' },
          { id: '3', name: 'کاپوچینو', price: 90000, image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&q=80', isAvailable: false, category: 'coffee', description: 'اسپرسو با فوم شیر فراوان' },
          { id: '4', name: 'موخیتو', price: 110000, image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&q=80', isAvailable: true, category: 'cold', description: 'ترکیب لیمو، نعناع و سودا' },
          { id: '5', name: 'آیس لاته', price: 95000, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80', isAvailable: true, category: 'cold', description: 'لاته سرد با یخ' },
          { id: '6', name: 'پیتزا پپرونی', price: 350000, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80', isAvailable: true, category: 'pizza', description: 'پیتزا با پپرونی و پنیر فراوان' },
          { id: '7', name: 'پیتزا مارگاریتا', price: 290000, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80', isAvailable: true, category: 'pizza', description: 'پیتزا کلاسیک با گوجه و ریحان' },
          { id: '8', name: 'برگر کلاسیک', price: 280000, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', isAvailable: true, category: 'fastfood', description: 'برگر گوشت با پنیر، کاهو و گوجه' },
          { id: '9', name: 'کروسان کره‌ای', price: 75000, image: 'https://images.unsplash.com/photo-1555507036-ab1f40ce88cb?w=400&q=80', isAvailable: true, category: 'pastry', description: 'کروسان تازه و ترد' },
        ]
      }
    });
  },

  addItem: async (item) => {
    if (get().isSubmitting) return;
    set({ isSubmitting: true });

    try {
      // Map frontend field names → backend CreateProductCommand fields
      const newId = await createProduct({
        name: item.name,
        price: item.price,
        imageUrl: item.image,        // frontend "image" → backend "imageUrl"
        isAvailable: item.isAvailable,
        description: item.description,
        categoryId: item.category,   // frontend "category" → backend "categoryId"
      });

      // Add to local state with the server-generated Guid
      set((state) => ({
        items: [...state.items, { ...item, id: newId }],
      }));
    } catch (error: any) {
      const message = error?.response?.data?.title
        || error?.response?.data?.detail
        || error?.message
        || 'خطا در افزودن محصول';
      toast.error(message);
      throw error; // Re-throw so the caller can handle it too
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateItem: (id, item) => set((state) => ({
    items: state.items.map((i) => (i.id === id ? { ...i, ...item } : i))
  })),
  deleteItem: (id) => set((state) => ({
    items: state.items.filter((i) => i.id !== id)
  })),
  toggleItemAvailability: (id) => set((state) => ({
    items: state.items.map((item) =>
      item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
    ),
  })),
}));

