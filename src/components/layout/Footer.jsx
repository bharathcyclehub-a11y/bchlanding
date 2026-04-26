import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="pt-0 pb-2 px-4 bg-dark">
      <div className="max-w-6xl mx-auto">
        {/* Thin divider from CTA above */}
        <div className="border-t border-white/10 mb-8" />

        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-6">
          {/* Company Info */}
          <div className="col-span-2 md:col-span-1 text-center sm:text-left">
            <img src="/BCHlogo1.png" alt="Bharath Cycle Hub" className="h-10 sm:h-12 mb-3 mx-auto sm:mx-0" />
            <p className="text-gray-text text-xs sm:text-sm leading-relaxed mb-3">
              Trusted by 10,000+ Bangalore families. 5 bikes to your door — test ride at just ₹99.
            </p>
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <a
                href="https://youtube.com/@bharathcyclehub?si=rNOy1owyFxN3O_Ap"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center text-gray-text hover:text-white transition-all duration-300"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/bharathcyclehub?igsh=bGJqNG5qZHRsMmdl"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center text-gray-text hover:text-white transition-all duration-300"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://wa.me/918892031480?text=Hi%2C%20I%20need%20help%20choosing%20a%20bicycle"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#25D366] flex items-center justify-center text-gray-text hover:text-white transition-all duration-300"
                aria-label="WhatsApp"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-left">
            <h4 className="font-bold text-white mb-3 uppercase tracking-wide text-xs">Contact Us</h4>
            <div className="space-y-2 text-sm text-gray-text">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs">Chikka Bommasandra, Yelahanka, Bengaluru 560064</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+918892031480" className="hover:text-primary transition-colors text-xs">+91 88920 31480</a>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <a href="mailto:support@bharathcyclehub.store" className="hover:text-primary transition-colors text-[10px] sm:text-xs break-all">support@bharathcyclehub.store</a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-left">
            <h4 className="font-bold text-white mb-3 uppercase tracking-wide text-xs">Quick Links</h4>
            <div className="space-y-1 text-sm">
              <Link to="/" className="block text-gray-text hover:text-primary transition-colors py-0.5 text-xs">Home</Link>
              <Link to="/test-ride" className="block text-gray-text hover:text-primary transition-colors py-0.5 text-xs">Book Test Ride - ₹99 Only</Link>
              <Link to="/privacy-policy" className="block text-gray-text hover:text-primary transition-colors py-0.5 text-xs">Privacy Policy</Link>
              <Link to="/terms" className="block text-gray-text hover:text-primary transition-colors py-0.5 text-xs">Terms of Service</Link>
              <Link to="/disclaimer" className="block text-gray-text hover:text-primary transition-colors py-0.5 text-xs">Disclaimer</Link>
            </div>
          </div>

          {/* Google Map */}
          <div className="col-span-2 md:col-span-1 text-center sm:text-left">
            <h4 className="font-bold text-white mb-3 uppercase tracking-wide text-xs">Visit Us</h4>
            <div className="relative rounded-xl overflow-hidden shadow-lg border border-white/10 h-[160px]">
              <iframe
                src="https://maps.google.com/maps?width=100%25&height=600&hl=en&q=Main%20Road,%20Chikka%20Bommasandra,%20Yelahanka,%20Bengaluru,%20Karnataka%20560064&t=&z=14&ie=UTF8&iwloc=B&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale hover:grayscale-0 transition-all duration-500"
              ></iframe>
            </div>
            <p className="text-gray-text text-xs mt-2">Yelahanka, Bengaluru</p>
          </div>
        </div>





        {/* Bottom Bar */}
        <div className="py-4 border-t border-white/10 text-center space-y-1">
          <p className="text-gray-text text-xs">
            &copy; 2026 Bharath Cycle Hub. All rights reserved.
          </p>
          <p className="text-gray-text/60 text-[11px]">
            Premium guidance for confident bicycle decisions
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-gray-text/40 text-[9px]">
            <span>Registered Business</span>
            <span className="hidden sm:inline">|</span>
            <span>Yelahanka, Bengaluru, Karnataka</span>
            <span className="hidden sm:inline">|</span>
            <span>Open Mon-Sun: 10AM - 8:30PM</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
