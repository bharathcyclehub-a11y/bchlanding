const brands = [
  { name: 'Hero Cycles', logo: '/brands/hero.png' },
  { name: 'Firefox', logo: '/brands/firefox.png' },
  { name: 'Aoki', logo: '/brands/aoki.png' },
  { name: 'Raleigh', logo: '/brands/raleigh.jpg' },
  { name: 'EMotorad', logo: '/brands/emotorad.png' },
  { name: 'Hercules', logo: '/brands/hercules.png' },
  { name: 'Giant', logo: '/brands/giant.png' },
];

export default function BrandsMarquee() {
  return (
    <section className="py-4 bg-gray-bg overflow-hidden" aria-label="Partner brands">
      <div className="max-w-6xl mx-auto px-4 mb-4">
        <p className="text-center text-gray-text text-sm sm:text-base font-medium uppercase tracking-wider">
          Brands Parents Trust
        </p>
      </div>

      <div className="relative" role="marquee" aria-label={`Brand partners: ${brands.map(b => b.name).join(', ')}`}>
        {/* Gradient overlays for fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-bg to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-bg to-transparent z-10" />

        {/* CSS-only marquee — no JS animation loop */}
        <div className="flex animate-marquee" style={{ width: 'max-content' }}>
          {[...brands, ...brands, ...brands, ...brands].map((brand, index) => (
            <div
              key={`${brand.name}-${index}`}
              className="flex-shrink-0 flex items-center justify-center h-12 px-2 mr-16 grayscale hover:grayscale-0 transition-all duration-300"
              aria-hidden={index >= brands.length}
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="h-8 w-auto object-contain"
                loading="lazy"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
