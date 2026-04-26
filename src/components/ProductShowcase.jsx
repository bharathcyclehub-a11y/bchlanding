import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import CTAButton from './CTAButton';

export default function ProductShowcase({ onCTAClick }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const scrollContainerRef = useRef(null);

  const products = [
    {
      name: "EM Doodle",
      tagline: "Perfect for Ages 8-13",
      price: "₹21,999",
      originalPrice: "₹24,999",
      image: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=600&q=80",
      features: ["25 km/h Top Speed", "25-30 km Range", "Dual Disc Brakes", "LED Lights"],
      badge: "MOST POPULAR",
      ageGroup: "8-13 years"
    },
    {
      name: "EM Ranger",
      tagline: "Perfect for Ages 14-17",
      price: "₹29,999",
      originalPrice: "₹34,999",
      image: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=600&q=80",
      features: ["25 km/h Top Speed", "40-45 km Range", "Fat Tyre", "Front Suspension"],
      badge: "TEEN FAVORITE",
      ageGroup: "14-17 years"
    },
    {
      name: "Wattson Wheelz",
      tagline: "Perfect for Adults",
      price: "₹34,999",
      originalPrice: "₹39,999",
      image: "https://images.unsplash.com/photo-1571333250630-f0230c320b6d?auto=format&fit=crop&w=600&q=80",
      features: ["25 km/h Top Speed", "45-50 km Range", "Smart Display", "Mobile Holder"],
      badge: "ADULT CHOICE",
      ageGroup: "18+ years"
    },
    {
      name: "EM Doodle Next",
      tagline: "Premium Kids E-Cycle",
      price: "₹26,999",
      originalPrice: "₹29,999",
      image: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=600&q=80",
      features: ["30 km/h Top Speed", "35-40 km Range", "Alloy Frame", "Integrated Battery"],
      badge: "NEW ARRIVAL",
      ageGroup: "10-15 years"
    },
    {
      name: "Luxe Pro",
      tagline: "Premium Status Symbol",
      price: "₹54,999",
      originalPrice: "₹59,999",
      image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80",
      features: ["32 km/h Top Speed", "60 km Range", "Hydraulic Brakes", "Premium Build"],
      badge: "PREMIUM",
      ageGroup: "All ages"
    },
    {
      name: "G-One Cargo",
      tagline: "Business & Commute",
      price: "₹39,999",
      originalPrice: "₹44,999",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80",
      features: ["25 km/h Top Speed", "50 km Range", "Cargo Capacity", "Heavy Duty"],
      badge: "BUSINESS",
      ageGroup: "Adults"
    }
  ];

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-bold text-primary uppercase tracking-wide">Test Ride These at Your Home</span>
          </div>

          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-normal text-dark mb-4 tracking-wider uppercase">
            Find The Perfect E-Cycle<br />For Your Child
          </h2>
          <p className="text-lg sm:text-xl text-gray-text max-w-3xl mx-auto">
            Expert-curated selection based on your child's age, height, and preferences. All cycles available for home test ride.
          </p>
        </motion.div>

        {/* Horizontal Scroll Container */}
        <div className="relative">
          {/* Navigation Buttons - Desktop Only */}
          <button
            onClick={() => scroll('left')}
            className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full bg-white shadow-xl border-2 border-primary items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300"
            aria-label="Scroll left"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => scroll('right')}
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full bg-white shadow-xl border-2 border-primary items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300"
            aria-label="Scroll right"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Products Horizontal Scroll */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto py-8 px-4 -mx-4 sm:px-6 sm:-mx-6 snap-x snap-mandatory scrollbar-hide items-stretch"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {products.map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-[20px] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group border border-gray-100 flex flex-col h-full flex-shrink-0 w-[320px] sm:w-[360px] snap-center"
              >
                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-wide shadow-lg">
                    {product.badge}
                  </div>
                )}

                {/* Product Image */}
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                  <motion.img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Product Details */}
                <div className="p-6 flex flex-col flex-1">
                  {/* Age Group Tag */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase mb-3 self-start">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    {product.ageGroup}
                  </div>

                  {/* Product Name */}
                  <h3 className="font-display text-2xl font-bold text-dark mb-1 group-hover:text-primary transition-colors tracking-wide uppercase">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-text mb-4">{product.tagline}</p>

                  {/* Features */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {product.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs text-dark font-medium leading-tight">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-3 mb-4 mt-auto">
                    <span className="text-3xl font-bold text-dark">{product.price}</span>
                    <span className="text-lg text-gray-text line-through">{product.originalPrice}</span>
                  </div>

                  {/* EMI Option */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm font-bold text-green-800">0% EMI Starting ₹999/month</p>
                        <p className="text-xs text-green-600">No hidden charges • Instant approval</p>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <CTAButton
                    onClick={() => onCTAClick && onCTAClick(product.name)}
                    className="w-full text-center"
                  >
                    Test Ride
                  </CTAButton>

                  <p className="text-center text-xs text-gray-text mt-3">
                    Only ₹99 • Fully Refundable
                  </p>
                </div>

                {/* Hover Overlay */}
                {hoveredIndex === index && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-primary/5 pointer-events-none"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-lg text-gray-text mb-6 max-w-2xl mx-auto">
            Can't decide? Book a home test ride and our experts will help your child test 5 different e-cycles to find their perfect match.
          </p>
          <CTAButton
            onClick={() => onCTAClick && onCTAClick('Products Bottom')}
            className="text-center"
          >
            Book Home Visit - ₹99
          </CTAButton>
        </motion.div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section >
  );
}
