import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

interface CartButtonProps {
  onClick: () => void;
}

export default function CartButton({ onClick }: CartButtonProps) {
  const items = useCartStore(state => state.items);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  if (totalQuantity === 0) return null;

  return (
    <button 
      onClick={onClick}
      className="fixed bottom-6 left-6 z-40 bg-cafe-text text-[#0f3229] shadow-xl p-4 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
    >
      <div className="relative">
        <ShoppingBag size={28} strokeWidth={2} />
        <span className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-cafe-text">
          {totalQuantity}
        </span>
      </div>
    </button>
  );
}
