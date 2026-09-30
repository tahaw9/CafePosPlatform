import { create } from 'zustand';
import { 
  ExtraDto, 
  CreateExtraRequest, 
  UpdateExtraRequest, 
  getActiveExtras, 
  getExtras, 
  createExtra, 
  updateExtra, 
  toggleExtraAvailability, 
  deleteExtra as apiDeleteExtra 
} from '../lib/extraService';
import toast from 'react-hot-toast';

interface ExtraState {
  activeExtras: ExtraDto[];
  allExtras: ExtraDto[];
  isLoading: boolean;
  isSubmitting: boolean;
  fetchActiveExtras: () => Promise<void>;
  fetchAllExtras: () => Promise<void>;
  createExtra: (data: CreateExtraRequest) => Promise<ExtraDto>;
  updateExtra: (id: string, data: UpdateExtraRequest) => Promise<ExtraDto>;
  toggleAvailability: (id: string) => Promise<boolean>;
  deleteExtra: (id: string) => Promise<void>;
}

export const useExtraStore = create<ExtraState>((set, get) => ({
  activeExtras: [],
  allExtras: [],
  isLoading: false,
  isSubmitting: false,

  fetchActiveExtras: async () => {
    try {
      const activeExtras = await getActiveExtras();
      set({ activeExtras });
    } catch (error: any) {
      console.error('Failed to fetch active extras:', error);
    }
  },

  fetchAllExtras: async () => {
    set({ isLoading: true });
    try {
      const allExtras = await getExtras();
      set({ allExtras });
    } catch (error: any) {
      const message = error?.response?.data?.title
        || error?.response?.data?.detail
        || error?.message
        || 'خطا در دریافت لیست افزودنی‌ها';
      toast.error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  createExtra: async (data: CreateExtraRequest) => {
    set({ isSubmitting: true });
    try {
      const newExtra = await createExtra(data);
      set(state => ({
        allExtras: [...state.allExtras, newExtra].sort((a, b) => a.displayOrder - b.displayOrder),
        activeExtras: newExtra.isAvailable 
          ? [...state.activeExtras, newExtra].sort((a, b) => a.displayOrder - b.displayOrder)
          : state.activeExtras
      }));
      toast.success(`افزودنی «${newExtra.name}» با موفقیت اضافه شد`);
      return newExtra;
    } catch (error: any) {
      const message = error?.response?.data?.detail
        || error?.response?.data?.title
        || error?.message
        || 'خطا در افزودن افزودنی';
      toast.error(message);
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateExtra: async (id: string, data: UpdateExtraRequest) => {
    set({ isSubmitting: true });
    try {
      const updatedExtra = await updateExtra(id, data);
      set(state => {
        const allExtras = state.allExtras
          .map(e => e.id === id ? updatedExtra : e)
          .sort((a, b) => a.displayOrder - b.displayOrder);
        const activeExtras = allExtras.filter(e => e.isAvailable);
        return { allExtras, activeExtras };
      });
      toast.success(`افزودنی «${updatedExtra.name}» بروزرسانی شد`);
      return updatedExtra;
    } catch (error: any) {
      const message = error?.response?.data?.detail
        || error?.response?.data?.title
        || error?.message
        || 'خطا در ویرایش افزودنی';
      toast.error(message);
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  toggleAvailability: async (id: string) => {
    try {
      const newStatus = await toggleExtraAvailability(id);
      set(state => {
        const allExtras = state.allExtras.map(e => 
          e.id === id ? { ...e, isAvailable: newStatus } : e
        );
        const activeExtras = allExtras.filter(e => e.isAvailable);
        return { allExtras, activeExtras };
      });
      toast.success(newStatus ? 'افزودنی فعال شد' : 'افزودنی غیرفعال شد');
      return newStatus;
    } catch (error: any) {
      const message = error?.response?.data?.detail
        || error?.response?.data?.title
        || error?.message
        || 'خطا در تغییر وضعیت افزودنی';
      toast.error(message);
      throw error;
    }
  },

  deleteExtra: async (id: string) => {
    set({ isSubmitting: true });
    try {
      await apiDeleteExtra(id);
      set(state => ({
        allExtras: state.allExtras.filter(e => e.id !== id),
        activeExtras: state.activeExtras.filter(e => e.id !== id)
      }));
      toast.success('افزودنی با موفقیت حذف شد');
    } catch (error: any) {
      const message = error?.response?.data?.detail
        || error?.response?.data?.title
        || error?.message
        || 'خطا در حذف افزودنی';
      toast.error(message);
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  }
}));
