import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ContactFormModal from './ContactFormModal';

export default function HeroSlider() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 2);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slides = [
    {
      id: 1,
      type: 'gradient',
      content: (
        <div className="relative min-h-[360px] sm:min-h-[500px] md:min-h-[600px] flex items-center">
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(220, 38, 38, 0.1) 50px, rgba(220, 38, 38, 0.1) 52px)`
            }}
          />
          <div className="max-w-4xl mx-auto relative z-10 text-center px-3 sm:px-6">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-display text-[1.6rem] leading-tight sm:text-5xl md:text-6xl font-normal mb-3 sm:mb-6 tracking-wider uppercase"
            >
              Yelahanka's <span className="text-primary">#1 Destination</span> for E-Bikes & Premium Cycles
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-xs sm:text-lg md:text-xl text-white/80 mb-5 sm:mb-8"
            >
              Official Emotorad Dealer &bull; Exchange Your Old Cycle &bull; 0% EMI Available
            </motion.p>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6 sm:mb-10"
            >
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <span className="text-yellow-400">&#9733;</span>
                <span className="text-xs sm:text-sm font-semibold">4.7 Google Rating</span>
              </div>
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <span className="text-pink-400">&#128247;</span>
                <span className="text-xs sm:text-sm font-semibold">3.4L+ Instagram</span>
              </div>
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <span className="text-green-400">&#128666;</span>
                <span className="text-xs sm:text-sm font-semibold">Free Home Delivery</span>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.button
              onClick={() => navigate('/test-ride?open=true')}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 bg-primary text-white font-bold text-xs sm:text-lg px-5 sm:px-10 py-3 sm:py-5 rounded-full shadow-2xl hover:bg-primary-dark transition-all"
            >
              <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="sm:hidden">CONTACT US - FREE RIDE</span>
              <span className="hidden sm:inline">CONTACT US - FREE TEST RIDE</span>
            </motion.button>
          </div>
        </div>
      )
    },
    {
      id: 2,
      type: 'image',
      content: (
        <div className="relative min-h-[360px] sm:min-h-[500px] md:min-h-[600px] flex flex-col">
          {/* HD E-bike background image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=1920&q=90")'
            }}
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />

          {/* Content */}
          <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6">
            <div className="text-center max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Special offer badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-6"
                >
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full backdrop-blur-md bg-primary/20 border-2 border-primary shadow-lg"
                  >
                    <span className="text-xl sm:text-2xl">🎉</span>
                    <span className="text-xs sm:text-base font-bold text-white">FIRST TIME IN BANGALORE</span>
                  </motion.div>
                </motion.div>

                {/* Main headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="font-display text-[1.6rem] sm:text-5xl md:text-6xl font-black mb-3 sm:mb-6 leading-tight tracking-wider uppercase text-white"
                >
                  Test Ride <span className="text-primary">5 Cycles</span>
                  <span className="block mt-1 sm:mt-2">at Your Home</span>
                </motion.h1>

                {/* Subheadline */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="mb-8"
                >
                  <p className="text-lg sm:text-2xl md:text-3xl text-white font-bold mb-2">
                    Book Now for Just <span className="text-primary">₹99</span>
                  </p>
                  <p className="text-sm text-white/80">
                    *₹99 booking fee adjustable on purchase
                  </p>
                </motion.div>

                {/* CTA Button */}
                <motion.button
                  onClick={() => navigate('/test-ride?open=true')}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 bg-primary text-white font-bold text-xs sm:text-lg px-5 sm:px-10 py-3 sm:py-5 rounded-full shadow-2xl hover:bg-primary-dark transition-all uppercase tracking-wide"
                >
                  <span className="sm:hidden">CONTACT NOW - FREE RIDE</span>
                  <span className="hidden sm:inline">CONTACT NOW - FREE TEST RIDE</span>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="relative bg-gradient-to-b from-dark to-dark-light text-white overflow-hidden pt-[72px] sm:pt-[80px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {slides[currentSlide].content}
        </motion.div>
      </AnimatePresence>

      {/* Slide indicators */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-2.5 sm:gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-3 rounded-full transition-all min-w-[44px] sm:min-w-0 ${currentSlide === index
              ? 'bg-primary w-10 sm:w-8'
              : 'bg-white/30 hover:bg-white/50 w-3'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-1 sm:left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-sm p-2.5 sm:p-3 rounded-full transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Previous slide"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-1 sm:right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-sm p-2.5 sm:p-3 rounded-full transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Next slide"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Contact Form Modal */}
      <ContactFormModal
        isOpen={isContactFormOpen}
        onClose={() => setIsContactFormOpen(false)}
        title="Get Free Test Ride"
      />
    </section>
  );
}
