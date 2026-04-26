import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Hero({ onCTAClick }) {
  const navigate = useNavigate();

  const handleDoubleClick = (e) => {
    // Prevent navigation if double-clicking buttons or links
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }

    // If already on /test-ride, do nothing
    if (window.location.pathname === '/test-ride') {
      return;
    }
    navigate('/test-ride');
  };

  return (
    <section
      className="relative h-screen flex flex-col overflow-hidden pt-[72px]"
      onDoubleClick={handleDoubleClick}
    >
      {/* HD E-bike background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/ecyle.jpg")',
          objectFit: 'cover'
        }}
      />
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black/95 Mix-blend-multiply" />

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 py-2">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Main headline - Parent focused */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 leading-tight tracking-wider uppercase text-white drop-shadow-2xl"
            >
              Give Your Child The<br />
              <span className="text-primary">Perfect E-Cycle</span>
            </motion.h1>

            {/* Subheadline - Value focused for parents */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mb-6 max-w-2xl mx-auto"
            >
              <p className="text-2xl sm:text-3xl md:text-4xl text-white font-bold mb-2">
                Expert Home Visit for Just <span className="text-primary price-heat-glow">₹99</span>
              </p>
            </motion.div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col items-center gap-3"
          >
            <motion.button
              onClick={onCTAClick}
              whileHover={{ y: -3, boxShadow: "0 25px 50px rgba(220, 38, 38, 0.5)" }}
              whileTap={{ scale: 0.98 }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ scale: { duration: 2, repeat: Infinity, repeatDelay: 1 } }}
              className="group relative inline-flex items-center gap-3 px-10 sm:px-14 py-5 sm:py-6 text-lg sm:text-xl font-bold text-white bg-primary rounded-full shadow-2xl hover:bg-primary-dark transition-all duration-300 uppercase tracking-wide"
            >
              <span>BOOK NOW - ₹99</span>
              <motion.svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </motion.svg>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Stats section */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid grid-cols-3 gap-4"
        >
          {[
            { value: "10,000+", label: "HAPPY FAMILIES" },
            { value: "4.7★", label: "GOOGLE RATING" },
            { value: "₹19,400", label: "E-CYCLES FROM" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white/95 backdrop-blur-sm border border-white rounded-2xl p-4 sm:p-5 text-center hover:bg-white transition-all duration-300 shadow-lg"
            >
              <div className="text-3xl sm:text-4xl font-display text-primary mb-2 tracking-wider font-bold">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-dark font-bold tracking-wide uppercase">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
