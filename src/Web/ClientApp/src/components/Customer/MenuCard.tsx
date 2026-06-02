import React from 'react';
import { Plus } from 'lucide-react';
import { MenuItem } from '../../store/useMenuStore';

interface MenuCardProps {
  item: MenuItem;
  onClick: (item: MenuItem) => void;
}

export default function MenuCard({ item, onClick }: MenuCardProps) {
  return (
    <div 
      className={`relative rounded-2xl overflow-hidden bg-[#164237] border border-cafe-accent/20 flex flex-col cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] ${!item.isAvailable ? 'opacity-60' : ''}`}
      onClick={() => item.isAvailable && onClick(item)}
    >
      <div className="relative h-32 w-full">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover"
        />
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
            <span className="bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-bold">
              ناموجود
            </span>
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
          <span className="font-bold text-cafe-item text-sm tracking-tight">
            {item.price.toLocaleString('fa-IR')} <span className="text-[10px] font-normal opacity-70">تومان</span>
          </span>
          <button 
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${item.isAvailable ? 'bg-cafe-text text-[#0f3229]' : 'bg-[#2a4d44] text-[#8fa8a4]'}`}
            disabled={!item.isAvailable}
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
