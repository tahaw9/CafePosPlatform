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

import DeveloperBadge from '../components/Customer/DeveloperBadge';

export default function CustomerMenu() {
  const { tableId } = useParams();
  const { categories, items, fetchMenu } = useMenuStore();
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
    <div className="h-screen w-full flex overflow-hidden bg-cafe-bg relative selection:bg-cafe-accent selection:text-[#0f3229]">
      {/* Sidebar */}
      <Sidebar 
        categories={categories} 
        activeCategoryId={activeCategoryId} 
        onSelectCategory={setActiveCategoryId} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header / Hero Section (Mocking the dark top section from the image) */}
        <div className="relative h-48 w-full shrink-0">
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
        </div>

        {/* Scrollable Items Container */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 pr-10 pb-32 pt-6 scroll-smooth hide-scrollbar relative z-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <MenuCard item={item} onClick={setSelectedItem} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
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
