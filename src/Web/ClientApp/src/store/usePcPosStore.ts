import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PcPosState {
  isPcPosEnabled: boolean;
  isProcessing: boolean;
  currentOrder: { id: string; amount: number } | null;
  error: string | null;
  countdown: number;
  triggerPayment: (orderId: string, amount: number) => Promise<boolean>;
  reset: () => void;
  setPcPosEnabled: (enabled: boolean) => void;
}

export const usePcPosStore = create<PcPosState>()(
  persist(
    (set) => ({
      isPcPosEnabled: true, // Configured to true by default for this setup
  isProcessing: false,
  currentOrder: null,
  error: null,
  countdown: 0,
  setPcPosEnabled: (enabled) => set({ isPcPosEnabled: enabled }),

  triggerPayment: async (orderId, amount) => {
    // Reset state and start processing
    set({ isProcessing: true, currentOrder: { id: orderId, amount }, error: null, countdown: 60 });
    
    // Start countdown timer
    const timer = setInterval(() => {
      set((state) => ({ countdown: state.countdown > 0 ? state.countdown - 1 : 0 }));
    }, 1000);

    try {
      // 60-second timeout for the HTTP request to the local agent
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      const response = await fetch('http://localhost:5000/api/pos/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, orderId }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('خطا در ارتباط با دستگاه کارتخوان');
      }
      
      const data = await response.json();
      
      if (data && (data.success === true || data.isSuccess === true || response.status === 200)) {
        return true;
      } else {
        throw new Error(data.message || 'پرداخت توسط کاربر یا دستگاه لغو شد');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        set({ error: 'زمان انتظار به پایان رسید (تایم اوت 60 ثانیه)' });
      } else {
        set({ error: err.message || 'خطا در ارتباط با سرویس محلی کارتخوان (localhost:5000)' });
      }
      return false;
    } finally {
      clearInterval(timer);
    }
  },

  reset: () => set({ isProcessing: false, currentOrder: null, error: null, countdown: 0 })
    }),
    {
      name: 'pc-pos-storage',
      partialize: (state) => ({ isPcPosEnabled: state.isPcPosEnabled })
    }
  )
);
