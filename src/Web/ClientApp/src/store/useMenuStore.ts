import { create } from 'zustand';
import { 
  createProduct, 
  getProducts, 
  updateProduct, 
  changeProductAvailability, 
  deleteProduct 
} from '../lib/productService';
import {
  getCategories,
  createCategory as apiCreateCategory,
  updateCategory as apiUpdateCategory,
  deleteCategory as apiDeleteCategory,
  CategoryDto
} from '../lib/categoryService';
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

export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  displayOrder: number;
  itemCount: number;
}

interface MenuState {
  items: MenuItem[];
  categories: MenuCategory[];
  isSubmitting: boolean;
  isLoading: boolean;
  fetchMenu: () => Promise<void>;
  addItem: (item: Omit<MenuItem, 'id'> & { base64Image?: string }) => Promise<void>;
  updateItem: (id: string, item: Partial<Omit<MenuItem, 'id'>> & { base64Image?: string }) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleItemAvailability: (id: string) => Promise<void>;
  createCategory: (data: { name: string; icon?: string; displayOrder?: number }) => Promise<void>;
  updateCategory: (id: string, data: { name: string; icon?: string; displayOrder: number }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  items: [],
  categories: [],
  isSubmitting: false,
  isLoading: false,

  fetchMenu: async () => {
    set({ isLoading: true });
    try {
      const [backendCategories, backendProducts] = await Promise.all([
        getCategories(),
        getProducts()
      ]);

      const categories: MenuCategory[] = backendCategories
        .map((c: CategoryDto) => ({
          id: c.id,
          name: c.name,
          icon: c.icon || 'Coffee',
          displayOrder: c.displayOrder ?? 0,
          itemCount: c.itemCount ?? 0
        }))
        .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));

      const items = backendProducts.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.imageUrl || '',
        isAvailable: p.isAvailable,
        category: p.categoryId,
        description: p.description || undefined
      }));

      set({ categories, items });
    } catch (error: any) {
      const message = error?.response?.data?.detail
        || error?.response?.data?.title
        || error?.message
        || 'خطا در دریافت اطلاعات منو';
      toast.error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (item) => {
    if (get().isSubmitting) return;
    set({ isSubmitting: true });

    try {
      const newId = await createProduct({
        name: item.name,
        price: item.price,
        base64Image: item.base64Image || '',
        isAvailable: item.isAvailable,
        description: item.description,
        categoryId: item.category,
      });

      set((state) => ({
        items: [...state.items, { ...item, id: newId, image: item.base64Image || '' }],
        categories: state.categories.map((c) =>
          c.id === item.category ? { ...c, itemCount: c.itemCount + 1 } : c
        )
      }));
    } catch (error: any) {
      const message = error?.response?.data?.detail
        || error?.response?.data?.title
        || error?.message
        || 'خطا در افزودن محصول';
      toast.error(message);
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateItem: async (id, item) => {
    if (get().isSubmitting) return;
    set({ isSubmitting: true });

    try {
      const original = get().items.find(i => i.id === id);
      if (!original) throw new Error('محصول یافت نشد');

      const payload = {
        id,
        name: item.name !== undefined ? item.name : original.name,
        price: item.price !== undefined ? item.price : original.price,
        base64Image: item.base64Image,
        isAvailable: item.isAvailable !== undefined ? item.isAvailable : original.isAvailable,
        description: item.description !== undefined ? item.description : original.description,
        categoryId: item.category !== undefined ? item.category : original.category
      };

      await updateProduct(payload);

      set((state) => {
        let updatedCategories = state.categories;
        if (item.category && item.category !== original.category) {
          updatedCategories = updatedCategories.map((c) => {
            if (c.id === original.category) return { ...c, itemCount: Math.max(0, c.itemCount - 1) };
            if (c.id === item.category) return { ...c, itemCount: c.itemCount + 1 };
            return c;
          });
        }

        return {
          items: state.items.map((i) => (i.id === id ? { ...i, ...item, image: item.base64Image || i.image } : i)),
          categories: updatedCategories
        };
      });
    } catch (error: any) {
      const message = error?.response?.data?.detail
        || error?.response?.data?.title
        || error?.message
        || 'خطا در ویرایش محصول';
      toast.error(message);
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  deleteItem: async (id) => {
    if (get().isSubmitting) return;
    set({ isSubmitting: true });

    try {
      const original = get().items.find(i => i.id === id);
      await deleteProduct(id);

      set((state) => ({
        items: state.items.filter((i) => i.id !== id),
        categories: original
          ? state.categories.map((c) =>
              c.id === original.category ? { ...c, itemCount: Math.max(0, c.itemCount - 1) } : c
            )
          : state.categories
      }));
    } catch (error: any) {
      const message = error?.response?.data?.detail
        || error?.response?.data?.title
        || error?.message
        || 'خطا در حذف محصول';
      toast.error(message);
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  toggleItemAvailability: async (id) => {
    try {
      await changeProductAvailability(id);

      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
        ),
      }));
    } catch (error: any) {
      const message = error?.response?.data?.detail
        || error?.response?.data?.title
        || error?.message
        || 'خطا در تغییر وضعیت موجودی محصول';
      toast.error(message);
      throw error;
    }
  },

  createCategory: async (data) => {
    if (get().isSubmitting) return;
    set({ isSubmitting: true });

    try {
      const created = await apiCreateCategory(data);
      const newCategory: MenuCategory = {
        id: created.id,
        name: created.name,
        icon: created.icon || 'Coffee',
        displayOrder: created.displayOrder ?? 0,
        itemCount: 0
      };

      set((state) => ({
        categories: [...state.categories, newCategory].sort(
          (a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name)
        )
      }));
    } catch (error: any) {
      const message = error?.response?.data?.detail
        || error?.response?.data?.title
        || error?.message
        || 'خطا در افزودن دسته‌بندی';
      toast.error(message);
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateCategory: async (id, data) => {
    if (get().isSubmitting) return;
    set({ isSubmitting: true });

    try {
      const updated = await apiUpdateCategory(id, data);

      set((state) => ({
        categories: state.categories
          .map((c) =>
            c.id === id
              ? {
                  ...c,
                  name: updated.name,
                  icon: updated.icon || c.icon,
                  displayOrder: updated.displayOrder
                }
              : c
          )
          .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name))
      }));
    } catch (error: any) {
      const message = error?.response?.data?.detail
        || error?.response?.data?.title
        || error?.message
        || 'خطا در ویرایش دسته‌بندی';
      toast.error(message);
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  deleteCategory: async (id) => {
    if (get().isSubmitting) return;
    set({ isSubmitting: true });

    try {
      await apiDeleteCategory(id);

      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id)
      }));
    } catch (error: any) {
      const message = error?.response?.data?.detail
        || error?.response?.data?.title
        || error?.message
        || 'خطا در حذف دسته‌بندی';
      toast.error(message);
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
