import React from 'react';

interface DeveloperBadgeProps {
  isHidden?: boolean;
}

export default function DeveloperBadge({ isHidden = false }: DeveloperBadgeProps) {
  return (
    <div className={`fixed bottom-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 ${isHidden ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
      <div 
        className="flex items-center justify-center px-4 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full shadow-lg text-white/70 text-[10px] sm:text-[11px] font-sans transition-all duration-300 w-max"
        dir="rtl"
      >
        <span>طراحی و برنامه نویسی شده توسط </span>
        <a 
          href="https://tahamoradi.ir" 
          target="_blank" 
          rel="noopener noreferrer"
          className="pointer-events-auto font-bold inline-block mx-1 text-white/90 hover:text-[#d4af37] transition-colors"
        >
          طاها مرادی
        </a>
      </div>
    </div>
  );
}
