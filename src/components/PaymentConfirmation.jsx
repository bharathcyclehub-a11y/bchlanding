import { motion } from 'framer-motion';

export default function PaymentConfirmation({ onPayment }) {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-16 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg w-full"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">
            Confirm Your Booking
          </h2>
          <p className="text-lg text-navy/70">
            Secure your expert home consultation
          </p>
        </div>

        {/* Summary card */}
        <div className="bg-gradient-to-br from-navy to-navy-light rounded-2xl p-8 mb-6 shadow-2xl">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-white text-xl font-semibold mb-2">
                Expert Home Visit
              </h3>
              <p className="text-white/70 text-sm">
                Personalized bicycle consultation
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gold">₹99</div>
              <div className="text-white/60 text-xs mt-1">Booking fee</div>
            </div>
          </div>

          <div className="space-y-3 border-t border-white/10 pt-6">
            {[
              "Expert calls within 5 minutes",
              "Curated bicycle selection",
              "Home test ride session",
              "Adjustable on purchase"
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 text-white/90">
                <svg className="w-5 h-5 text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Terms */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-amber-900 leading-relaxed">
              <strong>Important:</strong> The ₹99 booking fee is non-refundable and secures your expert consultation slot. Service available in Bangalore only. Fee adjustable against purchase.
            </div>
          </div>
        </div>

        {/* Payment button */}
        <motion.button
          onClick={onPayment}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group w-full flex items-center justify-center gap-3 px-8 py-5 text-lg font-semibold text-navy bg-gold rounded-full shadow-2xl shadow-gold/20 hover:shadow-gold/40 transition-all duration-300 mb-4"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Pay ₹99 Securely</span>
        </motion.button>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 text-xs text-navy/50">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Secure payment</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span>Instant confirmation</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
