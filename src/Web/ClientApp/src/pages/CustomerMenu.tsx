import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/Customer/Sidebar';
import MenuCard from '../components/Customer/MenuCard';
import ItemModal from '../components/Customer/ItemModal';
import CartButton from '../components/Customer/CartButton';
import CartModal from '../components/Customer/CartModal';
import CallWaiterFAB from '../components/Customer/CallWaiterFAB';
import { useMenuStore, MenuItem } from '../store/useMenuStore';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '../lib/api';
import { Coffee } from 'lucide-react';

import DeveloperBadge from '../components/Customer/DeveloperBadge';

export default function CustomerMenu() {
  const { tableId } = useParams();
  const { categories, items, fetchMenu, isLoading } = useMenuStore();
  const [activeCategoryId, setActiveCategoryId] = useState<string>('coffee');
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
      scrollContainerRef.current.scrollTo(0, 0);
    }
  }, [activeCategoryId]);

  const activeCategoryName = categories.find(c => c.id === activeCategoryId)?.name || '';
  const filteredItems = items.filter(item => item.category === activeCategoryId);

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
        {/* Header / Hero Section */}
        <div className="relative h-48 w-full shrink-0">
          {isLoading ? (
            <div className="absolute inset-0 bg-[#0f3229] flex flex-col justify-end items-center pb-6">
              <div className="w-36 h-7 bg-white/10 rounded-xl animate-pulse" />
            </div>
          ) : (
            <>
              <div className="absolute inset-x-0 bottom-0 top-0 overflow-hidden">
                <AnimatePresence mode="popLayout">
                  <motion.img 
                    key={activeCategoryId}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    src={getImageUrl(filteredItems[0]?.image) || 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&q=80'}
                    alt="Category Cover"
                    className="w-full h-full object-cover opacity-60"
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f3229] via-[#0f3229]/60 to-transparent" />
              </div>
              
              <div className="absolute top-6 left-6 text-cafe-text/80 text-sm tracking-[0.2em]"></div>
              
              <div className="absolute bottom-6 inset-x-0 flex justify-center">
                <AnimatePresence mode="popLayout">
                  <motion.h1 
                    key={activeCategoryId}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="text-3xl font-black text-cafe-text tracking-wider"
                  >
                    {activeCategoryName}
                  </motion.h1>
                </AnimatePresence>
              </div>
            </>
          )}
        </div>

        {/* Scrollable Items Container */}
        <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto px-6 pr-10 pb-44 pt-6 scroll-smooth hide-scrollbar overscroll-contain relative z-0">
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
          ) : filteredItems.length === 0 ? (
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
                  className="px-5 py-2.5 bg-[#164237] hover:bg-cafe-accent hover:text-[#0f3229] border border-cafe-accent/30 rounded-xl text-cafe-text text-sm font-semibold transition-all active:scale-95 shadow-md"
                >
                  مشاهده سایر دسته‌بندی‌ها
                </button>
              )}
            </div>
          ) : (
            // Smooth Category Crossfade
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategoryId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {filteredItems.map((item) => (
                  <MenuCard key={item.id} item={item} onClick={setSelectedItem} />
                ))}
              </motion.div>
            </AnimatePresence>
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
