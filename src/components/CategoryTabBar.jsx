import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function CategoryTabBar({ categories, activeCategory, onCategoryChange }) {
  const scrollRef = useRef(null);
  const tabRefs = useRef({});

  // Auto-scroll active tab to center
  useEffect(() => {
    const container = scrollRef.current;
    const activeTab = tabRefs.current[activeCategory];
    if (!container || !activeTab) return;

    const containerRect = container.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();
    const scrollLeft = container.scrollLeft + (tabRect.left - containerRect.left) - (containerRect.width / 2) + (tabRect.width / 2);

    container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
  }, [activeCategory]);

  return (
    <div className="sticky top-[72px] sm:top-[80px] z-30 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide max-w-6xl mx-auto px-2 sm:px-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category) => {
          const isActive = activeCategory === category.slug;
          return (
            <button
              key={category.slug}
              ref={(el) => { tabRefs.current[category.slug] = el; }}
              onClick={() => onCategoryChange(category.slug)}
              className={`relative flex items-center px-4 sm:px-5 py-2.5 sm:py-3 flex-shrink-0 transition-colors duration-200 ${
                isActive ? 'text-dark' : 'text-gray-text hover:text-dark/70'
              }`}
            >
              <span className={`text-xs sm:text-sm whitespace-nowrap ${isActive ? 'font-bold' : 'font-medium'}`}>
                {category.name}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
