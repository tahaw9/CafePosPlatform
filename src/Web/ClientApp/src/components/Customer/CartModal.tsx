import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import toast from 'react-hot-toast';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableId?: string;
}

export default function CartModal({ isOpen, onClose, tableId }: CartModalProps) {
  const { items, removeItem, updateQuantity, clearCart, totalAmount } = useCartStore();

  const handleCheckout = () => {
    // Mock POST to API
    if (items.length === 0) return;
    
    toast.success('سفارش شما با موفقیت ثبت شد!');
    clearCart();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0a221b]/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-[#0f3229] border border-[#8fa8a4]/30 rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#8fa8a4]/20 flex justify-between items-center bg-[#0a221b]">
              <h2 className="text-xl font-bold text-cafe-text">سفارشات شما (میز {tableId})</h2>
              <button onClick={onClose} className="p-2 bg-[#164237] text-cafe-item rounded-full">
                <X size={20} />
              </button>
            </div>

            {/* Items List */}
            <div className="p-6 flex-grow overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-cafe-item">
                  <ShoppingBag size={48} className="opacity-50 mb-4" />
                  <p>سبد خرید شما خالی است</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {items.map(item => (
                    <div key={item.menuItemId} className="bg-[#164237] p-4 rounded-2xl flex flex-col gap-3 border border-[#8fa8a4]/10">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-cafe-text">{item.name}</h4>
                          <span className="text-sm text-cafe-item block mt-1">{item.price.toLocaleString('fa-IR')} تومان</span>
                        </div>
                        <button 
                          onClick={() => removeItem(item.menuItemId)}
                          className="text-red-400 p-2 hover:bg-red-400/10 rounded-full transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      {item.note && (
                        <p className="text-xs text-[#8fa8a4] bg-[#0a221b] p-2 rounded-lg">
                          توضیحات: {item.note}
                        </p>
                      )}

                      <div className="flex justify-between items-center mt-2">
                        <span className="font-bold text-cafe-text">{(item.price * item.quantity).toLocaleString('fa-IR')} تومان</span>
                        <div className="flex items-center gap-3 bg-[#0a221b] rounded-full px-2 py-1">
                          <button 
                            onClick={() => updateQuantity(item.menuItemId, Math.max(1, item.quantity - 1))}
                            className="w-8 h-8 flex items-center justify-center text-cafe-item rounded-full active:scale-95"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="text-cafe-text font-bold w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-cafe-item rounded-full active:scale-95"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-[#8fa8a4]/20 bg-[#0a221b]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-cafe-item">جمع کل:</span>
                  <span className="text-2xl font-bold text-cafe-text">{totalAmount().toLocaleString('fa-IR')} تومان</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-cafe-text text-[#0f3229] font-bold py-4 rounded-xl flex items-center justify-center active:scale-[0.98] transition-transform"
                >
                  ثبت نهایی سفارش
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Ensure ShoppingBag is imported
import { ShoppingBag } from 'lucide-react';
