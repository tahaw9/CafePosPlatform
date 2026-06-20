import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus } from 'lucide-react';
import { MenuItem } from '../../store/useMenuStore';
import { useCartStore } from '../../store/useCartStore';
import { getImageUrl } from '../../lib/api';
import toast from 'react-hot-toast';

interface ItemModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export default function ItemModal({ item, onClose }: ItemModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const addItem = useCartStore(state => state.addItem);

  // Reset state when a new item is opened
  React.useEffect(() => {
    if (item) {
      setQuantity(1);
      setNote('');
    }
  }, [item]);

  if (!item) return null;

  const handleAddToCart = () => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity,
      note
    });
    toast.success(`${item.name} به سبد خرید اضافه شد`);
    onClose();
  };

  return (
    <AnimatePresence>
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
          {/* Header Image */}
          <div className="relative h-44 w-full shrink-0">
            <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
            <button 
              onClick={onClose}
              className="absolute top-4 left-4 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-transform active:scale-90"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col">
            <h2 className="text-2xl font-bold text-cafe-text mb-2">{item.name}</h2>
            {item.description && (
              <p className="text-[#8fa8a4] text-sm mb-4 leading-relaxed line-clamp-2">
                {item.description}
              </p>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center justify-between bg-[#164237] p-3 rounded-2xl mb-4">
              <span className="text-cafe-text font-medium px-2">تعداد</span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 bg-[#0a221b] text-cafe-item rounded-full flex items-center justify-center active:scale-95"
                >
                  <Minus size={18} />
                </button>
                <span className="text-cafe-text font-bold text-lg w-6 text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 bg-[#0a221b] text-cafe-item rounded-full flex items-center justify-center active:scale-95"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Note Input */}
            <div className="mb-2">
              <label className="block text-cafe-item text-xs mb-2 font-medium px-1">توضیحات سفارش (اختیاری)</label>
              <textarea 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="مثلاً: بدون یخ، شکر اضافه..."
                className="w-full bg-[#164237] border border-[#8fa8a4]/20 rounded-2xl p-3 text-cafe-text text-sm placeholder:text-[#8fa8a4]/50 focus:outline-none focus:border-cafe-accent resize-none h-16 hide-scrollbar"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 pt-2 border-t border-[#8fa8a4]/10 bg-[#0f3229]">
            <button 
              onClick={handleAddToCart}
              className="w-full bg-cafe-text text-[#0f3229] font-bold py-3.5 rounded-xl flex items-center justify-between px-6 active:scale-[0.98] transition-transform shadow-lg shadow-black/20"
            >
              <span>افزودن به سبد</span>
              <span>{(item.price * quantity).toLocaleString('fa-IR')} تومان</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
