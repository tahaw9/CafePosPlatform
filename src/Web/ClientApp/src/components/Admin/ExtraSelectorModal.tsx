import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Check, Sparkles, Plus } from 'lucide-react';
import { useExtraStore } from '../../store/useExtraStore';
import { OrderItemExtra } from '../../store/useOrderStore';

interface ExtraSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  variantName?: string;
  initialSelectedExtras: OrderItemExtra[];
  onConfirm: (selectedExtras: OrderItemExtra[]) => void;
}

export default function ExtraSelectorModal({
  isOpen,
  onClose,
  itemName,
  variantName,
  initialSelectedExtras,
  onConfirm
}: ExtraSelectorModalProps) {
  const { activeExtras, fetchActiveExtras } = useExtraStore();
  const [selectedExtras, setSelectedExtras] = useState<OrderItemExtra[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchActiveExtras();
      setSelectedExtras(initialSelectedExtras ? [...initialSelectedExtras] : []);
    }
  }, [isOpen, initialSelectedExtras, fetchActiveExtras]);

  const toggleExtra = (extra: { id: string; name: string; price: number; isAvailable: boolean }) => {
    if (!extra.isAvailable) return;

    setSelectedExtras(prev => {
      const exists = prev.some(e => e.extraId === extra.id);
      if (exists) {
        return prev.filter(e => e.extraId !== extra.id);
      } else {
        return [...prev, { extraId: extra.id, name: extra.name, price: extra.price }];
      }
    });
  };

  const handleConfirm = () => {
    onConfirm(selectedExtras);
    onClose();
  };

  const totalExtrasPrice = selectedExtras.reduce((sum, e) => sum + e.price, 0);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-xs" />
        <Dialog.Content 
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-[92vw] max-w-lg z-[101] rtl flex flex-col max-h-[85vh] border border-gray-100 overflow-hidden"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-[#0a221b] text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#164237] flex items-center justify-center text-[#d4af37]">
                <Sparkles size={18} />
              </div>
              <div>
                <Dialog.Title className="text-lg font-bold">
                  افزودنی‌های {itemName}
                </Dialog.Title>
                <Dialog.Description className="text-xs text-gray-300 mt-0.5">
                  {variantName ? `نوع انتخابی: ${variantName}` : 'انتخاب افزودنی‌ها و سفارشی‌سازی'}
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button 
                type="button"
                className="text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          {/* Extras List Grid */}
          <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-3 bg-[#fdfcf9]">
            {activeExtras.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Sparkles className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                <p className="text-sm">هیچ افزودنی فعالی در منو یافت نشد</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeExtras.map(extra => {
                  const isSelected = selectedExtras.some(e => e.extraId === extra.id);
                  const isAvailable = extra.isAvailable;

                  return (
                    <button
                      key={extra.id}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => toggleExtra(extra)}
                      className={`min-h-[56px] p-3 rounded-xl border text-right transition-all flex items-center justify-between gap-2 cursor-pointer select-none active:scale-[0.98] ${
                        !isAvailable
                          ? 'opacity-40 bg-gray-100 border-gray-200 cursor-not-allowed'
                          : isSelected
                            ? 'bg-[#164237]/10 border-[#164237] text-[#0a221b] shadow-xs ring-1 ring-[#164237]'
                            : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/80 text-gray-800'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-sm leading-snug">{extra.name}</span>
                        <span className="text-xs font-semibold text-[#164237] mt-0.5">
                          {extra.price > 0 ? `+ ${extra.price.toLocaleString()} تومان` : 'رایگان'}
                        </span>
                      </div>

                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isSelected 
                          ? 'bg-[#0a221b] text-white' 
                          : 'border border-gray-300 bg-white text-transparent'
                      }`}>
                        <Check size={14} strokeWidth={3} className={isSelected ? 'text-[#d4af37]' : 'text-transparent'} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Summary & Confirm Button */}
          <div className="p-4 border-t border-gray-100 bg-white flex flex-col gap-3">
            <div className="flex justify-between items-center text-sm px-1">
              <span className="text-gray-500 font-medium">
                {selectedExtras.length > 0 
                  ? `${selectedExtras.length} افزودنی انتخاب شده` 
                  : 'هیچ افزودنی انتخاب نشده'}
              </span>
              <span className="font-bold text-[#0a221b] text-base">
                جمع افزودنی: {totalExtrasPrice.toLocaleString()} تومان
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors text-sm"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full py-2.5 rounded-xl bg-[#0a221b] text-[#d4af37] font-bold hover:bg-[#164237] transition-colors text-sm flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Check size={16} />
                تایید افزودنی‌ها
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
