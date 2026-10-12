import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CategoryHeroProps {
  categoryId: string;
  categoryName: string;
  imageUrl?: string | null;
  isLoading?: boolean;
}

const DEFAULT_CATEGORY_IMAGE = 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&q=80';

export default function CategoryHero({
  categoryId,
  categoryName,
  imageUrl,
  isLoading = false,
}: CategoryHeroProps) {
  const targetImage = imageUrl || DEFAULT_CATEGORY_IMAGE;

  return (
    <div
      className="relative h-48 min-h-[12rem] max-h-[12rem] w-full shrink-0 overflow-hidden isolate select-none"
      style={{ contain: 'layout size paint' }}
    >
      {isLoading ? (
        <div className="absolute inset-0 bg-[#0f3229] flex flex-col justify-end items-center pb-6">
          <div className="w-36 h-7 bg-white/10 rounded-xl animate-pulse" />
        </div>
      ) : (
        <>
          {/* Decoupled Image Layers: Concurrent Absolute Stacking Crossfade */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <AnimatePresence initial={false}>
              <motion.img
                key={targetImage}
                src={targetImage}
                alt=""
                aria-hidden="true"
                decoding="async"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
            </AnimatePresence>

            {/* Vignette & Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f3229] via-[#0f3229]/60 to-transparent pointer-events-none z-[1]" />
          </div>

          {/* Category Title - Stable Vertical Stacking */}
          <div className="absolute bottom-6 inset-x-0 h-10 flex items-center justify-center pointer-events-none z-[2]">
            <AnimatePresence mode="wait">
              <motion.h1
                key={categoryId}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="text-3xl font-black text-cafe-text tracking-wider"
              >
                {categoryName}
              </motion.h1>
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
