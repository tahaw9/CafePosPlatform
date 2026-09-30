import React, { useEffect, useState, useRef } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { motion, AnimatePresence } from 'framer-motion';

interface CartButtonProps {
  onClick: () => void;
}

export default function CartButton({ onClick }: CartButtonProps) {
  const items = useCartStore(state => state.items);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const prevQuantityRef = useRef(totalQuantity);
  const [shouldBounce, setShouldBounce] = useState(false);

  useEffect(() => {
    if (totalQuantity > prevQuantityRef.current) {
      setShouldBounce(true);
      const timer = setTimeout(() => setShouldBounce(false), 500);
      prevQuantityRef.current = totalQuantity;
      return () => clearTimeout(timer);
    }
    prevQuantityRef.current = totalQuantity;
  }, [totalQuantity]);

  if (totalQuantity === 0) return null;

  return (
    <motion.button 
      onClick={onClick}
      animate={shouldBounce ? { scale: [1, 1.22, 0.95, 1.05, 1], rotate: [0, -6, 6, -3, 0] } : { scale: 1, rotate: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      whileTap={{ scale: 0.92 }}
      className="fixed bottom-6 left-6 z-40 bg-cafe-text text-[#0f3229] shadow-2xl p-4 rounded-full flex items-center justify-center hover:scale-105 transition-all"
      aria-label="سبد خرید"
    >
      <div className="relative">
        <ShoppingBag size={28} strokeWidth={2} />
        <AnimatePresence mode="popLayout">
          <motion.span 
            key={totalQuantity}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
            className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-cafe-text shadow-md"
          >
            {totalQuantity}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.button>
  );
}
