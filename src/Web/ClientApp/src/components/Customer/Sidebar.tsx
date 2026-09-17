import React from 'react';
import { motion } from 'framer-motion';
import { 
  Coffee, 
  GlassWater, 
  Sandwich, 
  Pizza, 
  Croissant, 
  Utensils, 
  EggFried, 
  Dessert, 
  CakeSlice, 
  Cookie, 
  Beer 
} from 'lucide-react';
import '../../sidebar.css';

function Blender({ size = 28, strokeWidth = 1.5, ...props }: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M7 3h10l-1.5 12H8.5L7 3z" />
      <path d="M5 21h14" />
      <path d="M8.5 15v6" />
      <path d="M15.5 15v6" />
      <path d="M16 6h3a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2.5" />
      <path d="M10.5 3v-1" />
    </svg>
  );
}

const icons: Record<string, React.ReactNode> = {
  Coffee: <Coffee strokeWidth={1.5} size={28} />,
  GlassWater: <GlassWater strokeWidth={1.5} size={28} />,
  Sandwich: <Sandwich strokeWidth={1.5} size={28} />,
  Pizza: <Pizza strokeWidth={1.5} size={28} />,
  Croissant: <Croissant strokeWidth={1.5} size={28} />,
  Utensils: <Utensils strokeWidth={1.5} size={28} />,
  EggFried: <EggFried strokeWidth={1.5} size={28} />,
  Dessert: <Dessert strokeWidth={1.5} size={28} />,
  CakeSlice: <CakeSlice strokeWidth={1.5} size={28} />,
  Cookie: <Cookie strokeWidth={1.5} size={28} />,
  Blender: <Blender strokeWidth={1.5} size={28} />,
  Beer: <Beer strokeWidth={1.5} size={28} />,
};

interface SidebarProps {
  categories: { id: string; name: string; icon: string }[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export default function Sidebar({ categories, activeCategoryId, onSelectCategory }: SidebarProps) {
  return (
    <div className="w-[72px] h-full bg-[#0b261f] flex flex-col items-center py-8 gap-6 z-10 shrink-0 relative drop-shadow-[-10px_0_20px_rgba(0,0,0,0.3)]">
      {/* Top Logo */}
      <div className="mb-4 px-2 w-full text-center text-cafe-text mt-2 cursor-pointer">
        <div className="block relative text-center">
          <span className="block font-black text-xl tracking-tighter leading-none">THINK</span>
          <span className="block font-serif italic text-sm leading-tight" style={{ fontFamily: 'cursive' }}>Coffee</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col w-full gap-4 mt-6">
        {categories.map((category) => {
          const isActive = activeCategoryId === category.id;
          
          return (
            <div 
              key={category.id}
              className="relative w-full flex justify-center py-5 cursor-pointer group"
              onClick={() => onSelectCategory(category.id)}
            >
              {/* Active Scalloped Background */}
              {isActive && (
                <motion.div 
                  layoutId="active-indicator"
                  className="scallop-indicator"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}

              {/* Icon */}
              <div 
                className={`relative z-10 flex flex-col items-center transition-all duration-300 ${isActive ? 'text-cafe-text' : 'text-[#647c72] hover:text-[#8fa8a4]'}`}
                style={{ transform: isActive ? 'translateX(-12px)' : 'translateX(0)' }}
              >
                {icons[category.icon] || <Coffee strokeWidth={1.5} size={28} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
