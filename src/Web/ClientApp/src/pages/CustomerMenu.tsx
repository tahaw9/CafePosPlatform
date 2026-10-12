import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/Customer/Sidebar';
import MenuCard from '../components/Customer/MenuCard';
import ItemModal from '../components/Customer/ItemModal';
import CartButton from '../components/Customer/CartButton';
import CartModal from '../components/Customer/CartModal';
import CallWaiterFAB from '../components/Customer/CallWaiterFAB';
import CategoryHero from '../components/Customer/CategoryHero';
import { useMenuStore, MenuItem } from '../store/useMenuStore';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '../lib/api';
import { Coffee, Search, X } from 'lucide-react';

import DeveloperBadge from '../components/Customer/DeveloperBadge';

export default function CustomerMenu() {
  const { tableId } = useParams();
  const { categories, items, fetchMenu, isLoading } = useMenuStore();
  const [activeCategoryId, setActiveCategoryId] = useState<string>('coffee');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  useEffect(() => {
    if (categories.length > 0) {
      const exists = categories.some(c => c.id === activeCategoryId);
      if (!exists) {
        setActiveCategoryId(categories[0].id);
      }
    }
  }, [categories, activeCategoryId]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    // Reset search query when navigating between categories
    setSearchQuery('');
  }, [activeCategoryId]);

  const normalizePersian = (text: string) =>
    text
      .replace(/ي/g, 'ی')
      .replace(/ك/g, 'ک')
      .replace(/آ/g, 'ا')
      .trim()
      .toLowerCase();

  const activeCategoryName = categories.find(c => c.id === activeCategoryId)?.name || '';
  const categoryItems = useMemo(
    () => items.filter(item => item.category === activeCategoryId),
    [items, activeCategoryId]
  );

  const displayedItems = useMemo(() => {
    if (!searchQuery.trim()) return categoryItems;
    const q = normalizePersian(searchQuery);
    return categoryItems.filter(item =>
      normalizePersian(item.name).includes(q)
    );
  }, [categoryItems, searchQuery]);

  return (
    <div className="h-screen h-[100dvh] max-h-[100dvh] w-full flex overflow-hidden bg-cafe-bg relative selection:bg-cafe-accent selection:text-[#0f3229]">
      {/* Sidebar */}
      <Sidebar 
        categories={categories} 
        activeCategoryId={activeCategoryId} 
        onSelectCategory={setActiveCategoryId} 
        isLoading={isLoading}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {/* Header / Hero Section with Strict Containment & Decoupled Stacking */}
        <CategoryHero
          categoryId={activeCategoryId}
          categoryName={activeCategoryName}
          imageUrl={getImageUrl(categoryItems[0]?.image)}
          isLoading={isLoading}
        />

        {/* In-Category Search Bar */}
        {!isLoading && categoryItems.length > 0 && (
          <div className="shrink-0 px-6 pr-10 pt-3 pb-1">
            <div className="relative flex items-center">
              <Search size={17} className="absolute right-3.5 text-[#8fa8a4] pointer-events-none" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`جستجو در ${activeCategoryName}...`}
                className="w-full bg-[#164237]/60 border border-cafe-accent/20 focus:border-cafe-accent/60 focus:bg-[#164237]/90 text-cafe-text text-sm rounded-xl pr-10 pl-9 py-2.5 outline-none transition-all placeholder:text-[#8fa8a4]/60 backdrop-blur-sm shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 text-[#8fa8a4] hover:text-cafe-text p-1 rounded-full transition-colors active:scale-90 cursor-pointer"
                  aria-label="پاک کردن جستجو"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Items Container */}
        <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto px-6 pr-10 pb-44 pt-4 scroll-smooth hide-scrollbar overscroll-contain relative z-0">
          {isLoading ? (
            // Shimmer Card Skeletons
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden bg-[#164237]/60 border border-cafe-accent/10 flex flex-col h-64 animate-pulse">
                  <div className="h-32 w-full bg-white/5" />
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="w-2/3 h-4 bg-white/10 rounded-md mb-2.5" />
                    <div className="w-full h-3 bg-white/5 rounded-md mb-1.5" />
                    <div className="w-4/5 h-3 bg-white/5 rounded-md" />
                    <div className="mt-auto flex justify-between items-center bg-[#0a221b]/60 p-2 rounded-xl">
                      <div className="w-20 h-4 bg-white/10 rounded-md" />
                      <div className="w-8 h-8 rounded-full bg-white/10" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : categoryItems.length === 0 ? (
            // Empty Category State
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-20 h-20 rounded-full bg-[#164237]/60 border border-cafe-accent/20 flex items-center justify-center text-cafe-item mb-4 shadow-inner">
                <Coffee size={36} strokeWidth={1.5} className="text-cafe-accent/70" />
              </div>
              <h3 className="text-lg font-bold text-cafe-text mb-1">هنوز آیتمی اضافه نشده است</h3>
              <p className="text-sm text-[#8fa8a4] max-w-xs mb-6">
                در حال حاضر آیتمی در این دسته‌بندی موجود نیست. می‌توانید سایر دسته‌بندی‌ها را مشاهده کنید.
              </p>
              {categories.length > 1 && (
                <button
                  onClick={() => {
                    const other = categories.find(c => c.id !== activeCategoryId);
                    if (other) setActiveCategoryId(other.id);
                  }}
                  className="px-5 py-2.5 bg-[#164237] hover:bg-cafe-accent hover:text-[#0f3229] border border-cafe-accent/30 rounded-xl text-cafe-text text-sm font-semibold transition-all active:scale-95 shadow-md cursor-pointer"
                >
                  مشاهده سایر دسته‌بندی‌ها
                </button>
              )}
            </div>
          ) : displayedItems.length === 0 ? (
            // Empty Search Results State
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-16 h-16 rounded-full bg-[#164237]/60 border border-cafe-accent/20 flex items-center justify-center text-cafe-item mb-3 shadow-inner">
                <Search size={28} className="text-[#8fa8a4]" />
              </div>
              <h3 className="text-base font-bold text-cafe-text mb-1">موردی یافت نشد</h3>
              <p className="text-xs text-[#8fa8a4] max-w-xs mb-5 leading-relaxed">
                هیچ آیتمی با عبارت «{searchQuery}» در دسته‌بندی {activeCategoryName} پیدا نشد.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-[#164237] hover:bg-cafe-accent hover:text-[#0f3229] border border-cafe-accent/30 rounded-xl text-cafe-text text-xs font-semibold transition-all active:scale-95 shadow-md cursor-pointer"
              >
                پاک کردن جستجو
              </button>
            </div>
          ) : (
            // Smooth Category Entrance (Zero Blank Gap)
            <motion.div
              key={activeCategoryId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {displayedItems.map((item) => (
                <MenuCard key={item.id} item={item} onClick={setSelectedItem} />
              ))}
            </motion.div>
          )}
        </div>

        {/* Bottom Scroll Fade Edge Indicator */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-cafe-bg via-cafe-bg/80 to-transparent pointer-events-none z-10" />
      </div>

      {/* Overlays */}
      <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} tableId={tableId} />
      
      {/* Floating Action Buttons */}
      <CallWaiterFAB tableId={tableId} />
      <CartButton onClick={() => setIsCartOpen(true)} />
      
      {/* Developer Signature */}
      <DeveloperBadge isHidden={!!selectedItem || isCartOpen} />
    </div>
  );
}
