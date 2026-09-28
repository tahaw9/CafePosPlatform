import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { MenuItem, ProductVariant } from '../../store/useMenuStore';
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
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const addItem = useCartStore(state => state.addItem);

  const hasVariants = Boolean(item?.variants && item.variants.length > 0);

  // Reset state and apply Smart Default Selection when item changes
  useEffect(() => {
    if (item) {
      setQuantity(1);
      setNote('');

      if (item.variants && item.variants.length > 0) {
        // Smart default selection: find available variants sorted by displayOrder, then lowest price
        const availableVariants = item.variants.filter(v => v.isAvailable);
        if (availableVariants.length > 0) {
          // Sort by displayOrder first, then price
          const sorted = [...availableVariants].sort((a, b) => 
            a.displayOrder - b.displayOrder || a.price - b.price
          );
          setSelectedVariant(sorted[0]);
        } else {
          setSelectedVariant(null);
        }
      } else {
        setSelectedVariant(null);
      }
    }
  }, [item]);

  if (!item) return null;

  // Active unit price: selected variant price or base product price
  const unitPrice = selectedVariant ? selectedVariant.price : item.price;
  const totalPrice = unitPrice * quantity;

  // Cannot add if item has variants but no available variant is selected
  const isAddDisabled = hasVariants && !selectedVariant;

  const handleAddToCart = () => {
    if (hasVariants && !selectedVariant) {
      toast.error('لطفاً یکی از انواع محصول را انتخاب کنید');
      return;
    }

    const cartItemId = `${item.id}_${selectedVariant?.id || 'default'}`;

    addItem({
      cartItemId,
      menuItemId: item.id,
      productVariantId: selectedVariant?.id,
      variantName: selectedVariant?.name,
      name: item.name,
      price: unitPrice,
      quantity,
      note
    });

    const displayName = selectedVariant ? `${item.name} (${selectedVariant.name})` : item.name;
    toast.success(`${displayName} به سبد خرید اضافه شد`);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
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
          className="relative w-full max-w-md bg-[#0f3229] border border-[#8fa8a4]/30 rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden max-h-[90vh] shadow-2xl"
        >
          {/* Header Image */}
          <div className="relative h-44 w-full shrink-0">
            <img 
              src={getImageUrl(item.image)} 
              alt={item.name} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f3229] via-transparent to-black/30" />
            <button 
              onClick={onClose}
              className="absolute top-4 left-4 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-transform active:scale-90 shadow-md"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-5 flex flex-col overflow-y-auto custom-scrollbar flex-1">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-2xl font-bold text-cafe-text">{item.name}</h2>
              {!hasVariants && (
                <span className="text-cafe-item font-bold text-lg whitespace-nowrap">
                  {item.price.toLocaleString('fa-IR')} <span className="text-xs font-normal">تومان</span>
                </span>
              )}
            </div>

            {item.description && (
              <p className="text-[#8fa8a4] text-sm mb-4 leading-relaxed line-clamp-3">
                {item.description}
              </p>
            )}

            {/* Tactile Option Selectors: Variants Selection */}
            {hasVariants && (
              <div className="mb-5">
                <label className="block text-cafe-item text-xs mb-2 font-bold px-1 flex items-center gap-1.5">
                  <span>انتخاب نوع / سایز</span>
                  <span className="text-red-400">*</span>
                </label>

                <div className="grid grid-cols-1 gap-2.5">
                  {item.variants!.map((variant) => {
                    const isSelected = selectedVariant?.id === variant.id;
                    const isAvail = variant.isAvailable;

                    return (
                      <div
                        key={variant.id}
                        onClick={() => isAvail && setSelectedVariant(variant)}
                        className={`relative rounded-2xl p-3.5 flex items-center justify-between border transition-all cursor-pointer select-none ${
                          !isAvail 
                            ? 'opacity-45 bg-[#0a221b]/40 border-gray-700 cursor-not-allowed'
                            : isSelected
                              ? 'bg-[#164237] border-cafe-accent ring-1 ring-cafe-accent shadow-md shadow-black/20'
                              : 'bg-[#0a221b]/70 border-[#8fa8a4]/20 hover:border-[#8fa8a4]/40 hover:bg-[#0a221b]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                            isSelected 
                              ? 'bg-cafe-accent border-cafe-accent text-[#0f3229]' 
                              : 'border-[#8fa8a4]/40 bg-transparent'
                          }`}>
                            {isSelected && <CheckCircle2 size={16} className="text-[#0f3229] fill-current" />}
                          </div>
                          <div>
                            <span className={`font-bold text-sm block ${isSelected ? 'text-cafe-text' : 'text-gray-200'}`}>
                              {variant.name}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isAvail ? (
                            <span className="font-bold text-cafe-item text-sm">
                              {variant.price.toLocaleString('fa-IR')} <span className="text-[10px] font-normal opacity-80">تومان</span>
                            </span>
                          ) : (
                            <span className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                              <AlertCircle size={12} />
                              ناموجود
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center justify-between bg-[#164237] p-3 rounded-2xl mb-4 border border-[#8fa8a4]/10">
              <span className="text-cafe-text font-medium px-2 text-sm">تعداد</span>
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 bg-[#0a221b] text-cafe-item rounded-full flex items-center justify-center active:scale-95 transition-transform"
                >
                  <Minus size={18} />
                </button>
                <span className="text-cafe-text font-bold text-lg w-6 text-center">{quantity}</span>
                <button 
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 bg-[#0a221b] text-cafe-item rounded-full flex items-center justify-center active:scale-95 transition-transform"
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

          {/* Live Action Footer */}
          <div className="p-4 pt-3 border-t border-[#8fa8a4]/10 bg-[#0f3229] shrink-0">
            <button 
              type="button"
              disabled={isAddDisabled}
              onClick={handleAddToCart}
              className={`w-full font-bold py-3.5 rounded-xl flex items-center justify-between px-6 transition-all shadow-lg ${
                isAddDisabled
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-60'
                  : 'bg-cafe-text text-[#0f3229] active:scale-[0.98] hover:opacity-95 shadow-black/20'
              }`}
            >
              <span>{isAddDisabled ? 'نوع ناموجود است' : 'افزودن به سبد'}</span>
              <span>{totalPrice.toLocaleString('fa-IR')} تومان</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
