import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { usePcPosStore } from '../../store/usePcPosStore';
import { Loader2, AlertCircle, XCircle, CreditCard } from 'lucide-react';

export default function PcPosModal() {
  const { isProcessing, currentOrder, error, countdown, reset, triggerPayment } = usePcPosStore();

  const isOpen = isProcessing || currentOrder !== null;

  if (!isOpen || !currentOrder) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => {
      if (!open && !isProcessing) reset();
    }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-[200] dialog-overlay" />
        <Dialog.Content 
          className="fixed bg-white rounded-xl shadow-2xl w-[90vw] max-w-sm p-6 z-[201] dialog-content flex flex-col items-center text-center"
          dir="rtl"
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        >
          {error ? (
            <>
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <AlertCircle size={32} />
              </div>
              <Dialog.Title className="text-xl font-bold text-gray-900 mb-2">خطا در پرداخت</Dialog.Title>
              <p className="text-sm text-gray-600 mb-6">{error}</p>
              <div className="w-full flex gap-3">
                <button
                  onClick={() => triggerPayment(currentOrder.id, currentOrder.amount)}
                  className="flex-1 py-2.5 bg-[#0f3229] hover:bg-[#0b261f] text-white rounded-lg font-medium transition-colors"
                >
                  تلاش مجدد
                </button>
                <button
                  onClick={reset}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors border border-gray-200"
                >
                  پرداخت دستی / انصراف
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4 relative">
                <CreditCard size={32} />
                <div className="absolute inset-0 border-4 border-amber-500/30 rounded-full animate-ping"></div>
              </div>
              <Dialog.Title className="text-xl font-bold text-gray-900 mb-2">پرداخت با کارتخوان</Dialog.Title>
              <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                مبلغ <strong className="text-lg text-black mx-1">{currentOrder.amount.toLocaleString()}</strong> تومان به دستگاه کارتخوان ارسال شد.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                لطفا کارت بکشید و رمز را وارد کنید...
              </p>
              
              <div className="w-full bg-gray-50 rounded-lg p-4 mb-4 flex flex-col items-center justify-center border border-gray-100">
                <Loader2 size={28} className="animate-spin text-amber-500 mb-2" />
                <div className="text-xl font-mono font-bold text-gray-800">{countdown}</div>
                <div className="text-xs text-gray-400 mt-1">ثانیه تا لغو خودکار</div>
              </div>

              <button
                onClick={reset}
                className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors border border-red-200 flex items-center justify-center gap-2"
              >
                <XCircle size={18} />
                لغو عملیات
              </button>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
