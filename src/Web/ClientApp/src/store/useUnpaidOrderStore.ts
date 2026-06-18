import { create } from 'zustand';
import { 
  getUnpaidOrders, 
  flagOrderAsUnpaid, 
  settleUnpaidOrder,
  UnpaidOrderDto,
  GetUnpaidOrdersParams,
  FlagOrderAsUnpaidRequest
} from '../lib/unpaidOrderService';
import toast from 'react-hot-toast';

interface UnpaidOrderState {
  unpaidOrders: UnpaidOrderDto[];
  isLoading: boolean;
  isSubmitting: boolean;
  
  fetchUnpaidOrders: (params?: GetUnpaidOrdersParams) => Promise<void>;
  flagOrder: (data: FlagOrderAsUnpaidRequest) => Promise<string>;
  settleOrder: (id: string) => Promise<void>;
}

export const useUnpaidOrderStore = create<UnpaidOrderState>((set, get) => ({
  unpaidOrders: [],
  isLoading: false,
  isSubmitting: false,

  fetchUnpaidOrders: async (params) => {
    set({ isLoading: true });
    try {
      const data = await getUnpaidOrders(params);
      set({ unpaidOrders: data });
    } catch (error: any) {
      console.error('Failed to fetch unpaid orders:', error);
      toast.error(error?.response?.data?.title || 'خطا در دریافت سفارشات پرداخت نشده');
    } finally {
      set({ isLoading: false });
    }
  },

  flagOrder: async (data) => {
    if (get().isSubmitting) return '';
    set({ isSubmitting: true });
    try {
      const id = await flagOrderAsUnpaid(data);
      toast.success('سفارش با موفقیت به عنوان پرداخت نشده ثبت شد');
      return id;
    } catch (error: any) {
      console.error('Failed to flag order:', error);
      const message = error?.response?.data?.title || error?.message || 'خطا در ثبت سفارش پرداخت نشده';
      toast.error(message);
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  settleOrder: async (id) => {
    set({ isSubmitting: true });
    try {
      await settleUnpaidOrder(id);
      
      // Update local state by removing or updating the settled order
      set(state => ({
        unpaidOrders: state.unpaidOrders.map(order => 
          order.id === id ? { ...order, isSettled: true, settledAt: new Date().toISOString() } : order
        )
      }));
      
      toast.success('حساب با موفقیت تسویه شد');
    } catch (error: any) {
      console.error('Failed to settle order:', error);
      toast.error(error?.response?.data?.title || 'خطا در تسویه حساب');
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  }
}));
