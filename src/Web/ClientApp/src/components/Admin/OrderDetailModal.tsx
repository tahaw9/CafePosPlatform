import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, MessageSquare, Tag } from 'lucide-react';
import { Order } from '../../store/useOrderStore';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

export default function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  if (!order) return null;

  return (
    <Dialog.Root open={!!order} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100] dialog-overlay print:hidden" />
        <Dialog.Content className="fixed bg-white rounded-2xl shadow-xl w-[90vw] max-w-lg z-[101] dialog-content rtl print:hidden flex flex-col max-h-[90vh]">
          
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <div>
              <Dialog.Title className="text-xl font-bold text-gray-900">
                سفارش #{order.orderCode}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-gray-500 mt-1">
                {order.tableNumber ? `میز ${order.tableNumber}` : 'بیرون‌بر'} • {new Date(order.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Tag size={18} className="text-[#0f3229]" /> جزئیات اقلام سفارش
            </h3>
            <div className="space-y-4">
              {order.items.map(item => (
                <div key={item.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-gray-800 text-lg">
                      {item.name}
                      <span className="text-sm text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full me-2">{item.quantity} عدد</span>
                    </span>
                    <span className="text-gray-500 font-medium">{(item.price * item.quantity).toLocaleString()} تومان</span>
                  </div>

                  {item.note && (
                    <div className="mt-3 bg-[#0f3229]/5 border border-[#0f3229]/10 p-3 rounded-lg flex items-start gap-2">
                      <MessageSquare className="w-5 h-5 text-[#0f3229] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-[#0f3229] mb-1">توضیحات مشتری:</div>
                        <div className="text-sm italic text-gray-700 leading-relaxed font-medium">{item.note}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-gray-200 pt-6 space-y-3">
              <div className="flex justify-between text-gray-600 font-medium">
                <span>جمع مبلغ:</span>
                <span>{order.total.toLocaleString()} تومان</span>
              </div>
              {order.discount && (
                <div className="flex justify-between text-red-500 font-medium">
                  <span>تخفیف:</span>
                  <span>
                    {order.discount.type === 'percentage' 
                      ? `${order.discount.value}%`
                      : `${order.discount.value.toLocaleString()} تومان`}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-black text-[#0f3229]">
                <span>مبلغ نهایی:</span>
                <span>
                  {(() => {
                    let finalTotal = order.total;
                    if (order.discount) {
                      if (order.discount.type === 'percentage') {
                        finalTotal -= (finalTotal * order.discount.value) / 100;
                      } else {
                        finalTotal -= order.discount.value;
                      }
                    }
                    return finalTotal.toLocaleString();
                  })()} تومان
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <button 
              onClick={onClose}
              className="w-full bg-[#0f3229] text-white py-3 rounded-xl font-bold hover:bg-[#0b261f] transition duration-200"
            >
              بستن
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
