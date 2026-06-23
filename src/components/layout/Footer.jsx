import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="pt-0 pb-2 px-4 bg-dark">
      <div className="max-w-6xl mx-auto">
        {/* Thin divider from CTA above */}
        <div className="border-t border-white/10 mb-3 sm:mb-5" />

        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-3 sm:mb-4">
          {/* Company Info */}
          <div className="col-span-2 md:col-span-1 text-center sm:text-left">
            <img src="/BCHlogo1.png" alt="Bharath Cycle Hub" className="h-10 sm:h-12 mb-2 mx-auto sm:mx-0" />
            <p className="text-gray-text text-xs sm:text-sm leading-relaxed mb-2">
              Trusted by 10,000+ Bangalore families. 5 bikes to your door — test ride at just ₹99.
            </p>
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <a
                href="https://youtube.com/@bharathcyclehub?si=rNOy1owyFxN3O_Ap"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full overflow-hidden hover:opacity-80 hover:scale-105 transition-all duration-300"
                aria-label="YouTube"
              >
                <img src="/social-youtube.png" alt="YouTube" className="w-full h-full object-cover" />
              </a>
              <a
                href="https://www.instagram.com/bharathcyclehub?igsh=bGJqNG5qZHRsMmdl"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full overflow-hidden hover:opacity-80 hover:scale-105 transition-all duration-300"
                aria-label="Instagram"
              >
                <img src="/social-instagram.png" alt="Instagram" className="w-full h-full object-cover" />
              </a>
              <a
                href="https://wa.me/918892031480?text=Hi%2C%20I%20need%20help%20choosing%20a%20bicycle"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full overflow-hidden hover:opacity-80 hover:scale-105 transition-all duration-300"
                aria-label="WhatsApp"
              >
                <img src="/social-whatsapp.png" alt="WhatsApp" className="w-full h-full object-cover" />
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-left">
            <h4 className="font-bold text-white mb-2 uppercase tracking-wide text-xs">Contact Us</h4>
            <div className="space-y-2 text-sm text-gray-text">
              <div className="flex items-start gap-2">
                <img src="/icon-location.png" alt="Location" className="w-5 h-5 flex-shrink-0 mt-0.5 object-contain" />
                <span className="text-xs">Chikka Bommasandra, Yelahanka, Bengaluru 560064</span>
              </div>
              <div className="flex items-center gap-2">
                <img src="/icon-call.png" alt="Call" className="w-5 h-5 flex-shrink-0 object-contain" />
                <a href="tel:+918892031480" className="hover:text-primary transition-colors text-xs">+91 88920 31480</a>
              </div>
              <div className="flex items-center gap-2">
                <img src="/icon-email.png" alt="Email" className="w-5 h-5 flex-shrink-0 object-contain" />
                <a href="mailto:bharathcyclehub@gmail.com" className="hover:text-primary transition-colors text-[10px] sm:text-xs break-all">bharathcyclehub@gmail.com</a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-left">
            <h4 className="font-bold text-white mb-2 uppercase tracking-wide text-xs">Quick Links</h4>
            <div className="space-y-1 text-sm">
              <Link to="/" className="block text-gray-text hover:text-primary transition-colors py-0.5 text-xs">Home</Link>
              <Link to="/test-ride" className="block text-gray-text hover:text-primary transition-colors py-0.5 text-xs">Book Test Ride - ₹99 Only</Link>
              <Link to="/privacy-policy" className="block text-gray-text hover:text-primary transition-colors py-0.5 text-xs">Privacy Policy</Link>
              <Link to="/terms" className="block text-gray-text hover:text-primary transition-colors py-0.5 text-xs">Terms of Service</Link>
              <Link to="/disclaimer" className="block text-gray-text hover:text-primary transition-colors py-0.5 text-xs">Disclaimer</Link>
            </div>
          </div>

          {/* Google Map — hidden on mobile to keep the footer short (address is in Contact Us) */}
          <div className="hidden sm:block md:col-span-1 text-center sm:text-left">
            <h4 className="font-bold text-white mb-2 uppercase tracking-wide text-xs">Visit Us</h4>
            <div className="relative rounded-xl overflow-hidden shadow-lg border border-white/10 h-[110px]">
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
        <div className="py-2.5 border-t border-white/10 text-center space-y-0.5">
          <p className="text-gray-text text-xs">
            &copy; 2026 Bharath Cycle Hub. All rights reserved.
          </p>
          <p className="hidden sm:block text-gray-text/60 text-[11px]">
            Premium guidance for confident bicycle decisions
          </p>
          <div className="hidden sm:flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-gray-text/40 text-[9px]">
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
