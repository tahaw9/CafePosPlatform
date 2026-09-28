import React from 'react';
import { Plus, Layers } from 'lucide-react';
import { MenuItem } from '../../store/useMenuStore';
import { getImageUrl } from '../../lib/api';

interface MenuCardProps {
  item: MenuItem;
  onClick: (item: MenuItem) => void;
}

export default function MenuCard({ item, onClick }: MenuCardProps) {
  const hasVariants = Boolean(item.variants && item.variants.length > 0);
  const availableVariants = hasVariants ? item.variants!.filter(v => v.isAvailable) : [];
  
  // Availability Hierarchy:
  // If product has variants, it is available if at least one variant is available and the product itself is available.
  // If all variants are unavailable, the whole card is marked out of stock.
  const isAvailable = hasVariants 
    ? (item.isAvailable && availableVariants.length > 0)
    : item.isAvailable;

  const displayPrice = hasVariants
    ? (availableVariants.length > 0 
        ? Math.min(...availableVariants.map(v => v.price))
        : (item.startingPrice || item.price))
    : item.price;

  return (
    <div 
      className={`relative rounded-2xl overflow-hidden bg-[#164237] border border-cafe-accent/20 flex flex-col cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] ${!isAvailable ? 'opacity-60' : ''}`}
      onClick={() => isAvailable && onClick(item)}
    >
      <div className="relative h-32 w-full">
        <img 
          src={getImageUrl(item.image)} 
          alt={item.name} 
          className="w-full h-full object-cover"
        />
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
            <span className="bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-bold">
              ناموجود
            </span>
          </div>
        )}
        {hasVariants && isAvailable && (
          <div className="absolute top-2 right-2 bg-[#0a221b]/85 backdrop-blur-md text-cafe-item px-2 py-0.5 rounded-full text-[10px] font-bold border border-cafe-accent/30 flex items-center gap-1 shadow-sm">
            <Layers size={12} className="text-cafe-accent" />
            <span>دارای تنوع</span>
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-medium text-cafe-text text-sm line-clamp-1">{item.name}</h3>
        </div>
        
        {item.description && (
          <p className="text-[#8fa8a4] text-xs line-clamp-2 mb-3 mt-1">
            {item.description}
          </p>
        )}
        
        <div className="mt-auto flex justify-between items-center bg-[#0a221b] p-2 rounded-xl">
          <span className="font-bold text-cafe-item text-sm tracking-tight flex items-baseline gap-1">
            {hasVariants && (
              <span className="text-[11px] font-normal text-[#8fa8a4]">از</span>
            )}
            <span>{displayPrice.toLocaleString('fa-IR')}</span>
            <span className="text-[10px] font-normal opacity-70">تومان</span>
          </span>
          <button 
            type="button"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isAvailable ? 'bg-cafe-text text-[#0f3229]' : 'bg-[#2a4d44] text-[#8fa8a4]'}`}
            disabled={!isAvailable}
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
