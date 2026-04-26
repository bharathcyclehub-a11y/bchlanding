import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

import { trackVisitor } from '../utils/visitor-tracker';

const WHATSAPP_NUMBER = '918892031480';

export default function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const location = useLocation();

  const handleExitIntent = useCallback((e) => {
    // Only trigger when mouse moves toward the top of the page (desktop)
    if (e.clientY <= 5) {
      const shown = sessionStorage.getItem('exit_popup_shown');
      if (!shown) {
        setShow(true);
        sessionStorage.setItem('exit_popup_shown', '1');
        trackVisitor('popup_shown', location.pathname);
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    // Don't show on admin pages
    if (location.pathname.startsWith('/admin')) return;

    // Wait a bit before enabling exit intent detection
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleExitIntent);
    }, 10000); // Wait 10 seconds before activating

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleExitIntent);
    };
  }, [handleExitIntent, location.pathname]);

  const handleWhatsApp = () => {
    trackVisitor('whatsapp_click', location.pathname);
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi, I need expert guidance on choosing the right bicycle')}`,
      '_blank'
    );
    setShow(false);
  };

  const handleCall = () => {
    trackVisitor('call_click', location.pathname);
    window.location.href = 'tel:+918892031480';
    setShow(false);
  };

  const handleDismiss = () => {
    trackVisitor('dismiss', location.pathname);
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-yellow-500 to-primary"></div>

            {/* Content */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-dark mb-2">
                Not sure which bicycle to pick?
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Get free expert guidance from Bangalore's most trusted cycling experts. We'll help you find the perfect ride.
              </p>

              {/* CTA buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleWhatsApp}
                  className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white font-semibold py-3.5 px-6 rounded-full hover:bg-[#20BD5A] transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Chat on WhatsApp
                </button>

                <button
                  onClick={handleCall}
                  className="w-full flex items-center justify-center gap-3 bg-dark text-white font-semibold py-3.5 px-6 rounded-full hover:bg-dark-light transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call Us Now
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-4">We typically reply within 5 minutes</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
