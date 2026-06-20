import { create } from 'zustand';
import { 
  createProduct, 
  getProducts, 
  getCategories, 
  updateProduct, 
  changeProductAvailability, 
  deleteProduct 
} from '../lib/productService';
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
  isLoading: boolean;
  fetchMenu: () => Promise<void>;
  addItem: (item: Omit<MenuItem, 'id'> & { base64Image?: string }) => Promise<void>;
  updateItem: (id: string, item: Partial<Omit<MenuItem, 'id'>> & { base64Image?: string }) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleItemAvailability: (id: string) => Promise<void>;
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

      const categories = backendCategories.map(c => ({
        id: c.id,
        name: c.name,
        icon: c.icon || 'Coffee'
      }));

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
      const message = error?.response?.data?.title
        || error?.response?.data?.detail
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
      }));
    } catch (error: any) {
      const message = error?.response?.data?.title
        || error?.response?.data?.detail
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

      set((state) => ({
        items: state.items.map((i) => (i.id === id ? { ...i, ...item, image: item.base64Image || i.image } : i))
      }));
    } catch (error: any) {
      const message = error?.response?.data?.title
        || error?.response?.data?.detail
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
      await deleteProduct(id);

      set((state) => ({
        items: state.items.filter((i) => i.id !== id)
      }));
    } catch (error: any) {
      const message = error?.response?.data?.title
        || error?.response?.data?.detail
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
      const message = error?.response?.data?.title
        || error?.response?.data?.detail
        || error?.message
        || 'خطا در تغییر وضعیت موجودی محصول';
      toast.error(message);
      throw error;
    }
  },
}));
