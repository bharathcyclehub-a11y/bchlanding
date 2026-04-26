import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { Link } from 'react-router-dom';

const categoryData = [
  {
    name: 'E-Bikes',
    slug: 'electric',
    tagline: 'Most Popular',
    description: 'Throttle & pedal-assist e-bikes loved by kids and adults — from ₹19,400',
    webp: '/ecyle.webp',
    fallback: '/ecyle-opt.jpg',
  },
  {
    name: 'Kids',
    slug: 'kids',
    tagline: 'Ages 3–17',
    description: 'Fun, safe cycles your kids will love — training wheels to teen e-bikes',
    webp: '/kids.webp',
    fallback: '/kids-opt.jpg',
  },
  {
    name: 'Geared',
    slug: 'geared',
    tagline: '21–27 Speed',
    description: 'Multi-speed bicycles for versatile riding on any terrain',
    webp: '/geared.webp',
    fallback: '/geared-opt.jpg',
  },
  {
    name: 'MTB',
    slug: 'mountain',
    tagline: 'Trail Ready',
    description: 'Rugged MTBs with suspension, disc brakes & aggressive tread',
    webp: '/MTB.webp',
    fallback: '/MTB-opt.jpg',
  },
  {
    name: 'City',
    slug: 'city',
    tagline: 'Daily Commute',
    description: 'Comfortable everyday bicycles for urban commutes & leisure',
    webp: '/city.webp',
    fallback: '/city-opt.jpg',
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    tagline: 'Gear & Safety',
    description: 'Essential biking gear, safety equipment & performance upgrades',
    webp: '/cycling-accessories.webp',
    fallback: '/cycling-accessories-opt.jpg',
  },
];

const CategoryCard = memo(function CategoryCard({ cat, index, isActive, onHover, onLeave, onClick, onFocus, isMobile }) {
  return (
    <div
      className="relative overflow-hidden cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-2px]"
      role="button"
      tabIndex={0}
      aria-expanded={isActive}
      aria-label={`${cat.name} — ${cat.tagline}. ${cat.description}`}
      style={{
        flex: isActive ? 4 : 1,
        transition: 'flex 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        willChange: isActive ? 'flex' : 'auto',
        contain: 'layout style paint',
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      onFocus={onFocus}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
    >
      {/* Background Image — WebP with JPG fallback */}
      <picture>
        <source srcSet={cat.webp} type="image/webp" />
        <img
          src={cat.fallback}
          alt={cat.name}
          loading={index < 3 ? 'eager' : 'lazy'}
          decoding="async"
          fetchpriority={index === 0 ? 'high' : 'auto'}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transform: isActive ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            willChange: isActive ? 'transform' : 'auto',
          }}
          draggable={false}
        />
      </picture>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-dark/10 z-[1]" />
      <div
        className="absolute inset-0 z-[1]"
        style={{
          backgroundColor: isActive ? 'rgba(26,31,60,0.1)' : 'rgba(26,31,60,0)',
          transition: 'background-color 0.4s ease',
        }}
      />

      {/* Collapsed State - Vertical Label */}
      <div
        className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4"
        style={{
          opacity: isActive ? 0 : 1,
          transition: 'opacity 0.3s ease',
          pointerEvents: isActive ? 'none' : 'auto',
        }}
      >
        <span
          className="text-white font-display text-sm sm:text-lg md:text-xl tracking-[0.2em] uppercase whitespace-nowrap"
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
          }}
        >
          {cat.name}
        </span>
      </div>

      {/* Collapsed bottom accent */}
      <div
        className="absolute bottom-4 sm:bottom-6 left-0 right-0 z-10 text-center"
        style={{
          opacity: isActive ? 0 : 1,
          transition: 'opacity 0.3s ease',
        }}
      >
        <div className="w-5 sm:w-6 h-0.5 rounded-full mx-auto bg-primary" />
      </div>

      {/* Expanded State - Full Info */}
      <div
        className="absolute inset-0 z-10 flex flex-col justify-end p-4 sm:p-8 md:p-10"
        style={{
          opacity: isActive ? 1 : 0,
          transition: 'opacity 0.35s ease 0.1s',
          pointerEvents: isActive ? 'auto' : 'none',
        }}
      >
        <p
          className="text-primary text-[10px] sm:text-xs uppercase tracking-[0.2em] font-medium mb-1.5 sm:mb-3"
          style={{
            transform: isActive ? 'translateY(0)' : 'translateY(12px)',
            opacity: isActive ? 1 : 0,
            transition: 'transform 0.4s ease 0.15s, opacity 0.4s ease 0.15s',
          }}
        >
          {cat.tagline}
        </p>

        <h3
          className="font-display text-2xl sm:text-4xl md:text-5xl text-white tracking-wider uppercase mb-1.5 sm:mb-3"
          style={{
            transform: isActive ? 'translateY(0)' : 'translateY(16px)',
            opacity: isActive ? 1 : 0,
            transition: 'transform 0.4s ease 0.2s, opacity 0.4s ease 0.2s',
          }}
        >
          {cat.name}
        </h3>

        <p
          className="text-white/60 text-[11px] sm:text-sm max-w-xs leading-snug sm:leading-relaxed font-light mb-3 sm:mb-6"
          style={{
            transform: isActive ? 'translateY(0)' : 'translateY(12px)',
            opacity: isActive ? 1 : 0,
            transition: 'transform 0.4s ease 0.25s, opacity 0.4s ease 0.25s',
          }}
        >
          {cat.description}
        </p>

        <div
          style={{
            transform: isActive ? 'translateY(0)' : 'translateY(12px)',
            opacity: isActive ? 1 : 0,
            transition: 'transform 0.4s ease 0.3s, opacity 0.4s ease 0.3s',
          }}
        >
          <Link
            to={`/products?category=${cat.slug}`}
            className="inline-flex items-center gap-2 bg-white text-dark px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-full text-[11px] sm:text-sm font-semibold tracking-wide hover:bg-primary hover:text-white transition-colors duration-300 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            Explore
            <svg className="w-3.5 sm:w-4 h-3.5 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
});

export default function CategoryShowcase() {
  const [activeIndex, setActiveIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleClick = useCallback((index) => {
    if (!isMobile) return;
    setActiveIndex((prev) => (prev === index ? null : index));
  }, [isMobile]);

  // Keyboard arrow navigation within the strip
  const handleContainerKeyDown = useCallback((e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const cards = containerRef.current?.querySelectorAll('[role="button"]');
      if (!cards) return;
      const currentIdx = Array.from(cards).indexOf(document.activeElement);
      const nextIdx = e.key === 'ArrowRight'
        ? Math.min(currentIdx + 1, cards.length - 1)
        : Math.max(currentIdx - 1, 0);
      cards[nextIdx]?.focus();
    }
  }, []);

  return (
    <section className="py-8 sm:py-12 bg-gray-bg overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-10">
          <p className="text-primary text-xs sm:text-sm uppercase tracking-[0.25em] font-medium mb-4">
            Shop by Age & Type
          </p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-dark mb-5 tracking-wider uppercase">
            Find Your Kid's Perfect Ride
          </h2>
          <p className="text-gray-text/70 text-sm sm:text-base max-w-lg mx-auto leading-relaxed font-light hidden sm:block">
            Explore our curated collection across 6 categories — hover to discover
          </p>
          <p className="text-gray-text/70 text-sm max-w-lg mx-auto leading-relaxed font-light sm:hidden">
            Tap a category to explore
          </p>
        </div>

        {/* Category Strips */}
        <div
          ref={containerRef}
          role="group"
          aria-label="Bicycle categories"
          onKeyDown={handleContainerKeyDown}
          className="flex h-[420px] sm:h-[520px] md:h-[560px] gap-1.5 sm:gap-3 rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.1)]"
        >
          {categoryData.map((cat, index) => (
            <CategoryCard
              key={cat.slug}
              cat={cat}
              index={index}
              isActive={activeIndex === index}
              isMobile={isMobile}
              onHover={() => !isMobile && setActiveIndex(index)}
              onLeave={() => !isMobile && setActiveIndex(null)}
              onClick={() => handleClick(index)}
              onFocus={() => setActiveIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
