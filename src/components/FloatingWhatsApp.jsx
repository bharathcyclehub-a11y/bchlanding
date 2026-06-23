import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const WHATSAPP_NUMBER = '918892031480';

const contextMessages = {
  '/': 'Hi, I need help choosing a bicycle',
  '/products': 'Hi, I\'m browsing your bicycle collection and need some help',
  '/test-ride': 'Hi, I\'m interested in booking a test ride',
};

export default function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const location = useLocation();

  // Show button after scrolling a bit
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show tooltip after 5 seconds on first visit
  useEffect(() => {
    const shown = sessionStorage.getItem('wa_tooltip_shown');
    if (!shown) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
        sessionStorage.setItem('wa_tooltip_shown', '1');
        setTimeout(() => setShowTooltip(false), 5000);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Don't show on admin page
  if (location.pathname.startsWith('/admin')) return null;

  // Build context-aware message
  const getWhatsAppMessage = () => {
    // Check if on product detail page
    if (location.pathname.startsWith('/products/')) {
      return 'Hi, I\'m interested in a bicycle from your store. Can you help me?';
    }
    return contextMessages[location.pathname] || 'Hi, I\'m interested in your bicycles';
  };

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(getWhatsAppMessage())}`;

  return (
    <div className="hidden md:block fixed md:bottom-6 right-4 z-40">
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            className="absolute bottom-full right-0 mb-3 bg-white rounded-xl shadow-xl px-4 py-3 min-w-[200px] border border-gray-100"
          >
            <button
              onClick={() => setShowTooltip(false)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xs hover:bg-gray-300"
            >
              x
            </button>
            <p className="text-sm font-semibold text-gray-800">Need help choosing?</p>
            <p className="text-xs text-gray-500 mt-1">We typically reply within 5 minutes</p>
            <div className="absolute bottom-0 right-6 translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r border-b border-gray-100"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp Button */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: hasScrolled || true ? 1 : 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        aria-label="Chat with us on WhatsApp"
        onClick={() => setShowTooltip(false)}
      >
        <img src="/social-whatsapp.png" alt="WhatsApp" className="w-full h-full object-cover rounded-full" />
      </motion.a>
    </div>
  );
}
