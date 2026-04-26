import { motion } from 'framer-motion';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-bg to-white pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-normal text-dark mb-4 tracking-wider uppercase">
              Terms of Service
            </h1>
            <p className="text-gray-text text-sm">Test Ride Policy & Conditions</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-[20px] shadow-lg p-8 sm:p-12 border-t-6 border-primary">
            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="font-display text-2xl font-normal text-dark mb-4 tracking-wide uppercase">
                  1. Test Ride Eligibility
                </h2>
                <div className="space-y-4 text-gray-text">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="font-bold text-dark mb-1">Confirmation</h3>
                      <p className="leading-relaxed">
                        All test rides are subject to availability and must be confirmed via phone call by our team.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="font-bold text-dark mb-1">Age Requirement</h3>
                      <p className="leading-relaxed">
                        Riders must be 18 years or older. Riders under 18 must be accompanied by a parent or legal guardian.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="font-bold text-dark mb-1">Valid ID</h3>
                      <p className="leading-relaxed">
                        You must present a valid Government-issued ID (Aadhaar, Driving License, etc.) prior to the test ride for security verification.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="font-display text-2xl font-normal text-dark mb-4 tracking-wide uppercase">
                  2. Geographic Limitations
                </h2>
                <div className="bg-blue-50 rounded-[20px] p-6 border-l-4 border-primary">
                  <h3 className="font-bold text-dark mb-2">Location</h3>
                  <p className="text-gray-text leading-relaxed">
                    Home test rides are strictly restricted to specific zones within Bangalore (primarily North Bangalore/Yelahanka). We reserve the right to decline home test ride requests outside our service radius.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="font-display text-2xl font-normal text-dark mb-4 tracking-wide uppercase">
                  3. Liability
                </h2>
                <div className="bg-orange-50 rounded-[20px] p-6 border-l-4 border-orange-500">
                  <p className="text-gray-text leading-relaxed">
                    <strong className="text-dark">Important:</strong> Bharath Cycle Hub is not liable for any injuries or accidents that occur during the test ride due to rider negligence or violation of traffic rules. Riders must adhere to all local traffic laws.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="font-display text-2xl font-normal text-dark mb-4 tracking-wide uppercase">
                  4. Booking Fee
                </h2>
                <p className="text-gray-text leading-relaxed">
                  The ₹99 booking fee is required to secure your test ride appointment and is fully adjustable against the purchase of any bicycle from our store. This fee is non-refundable if you choose not to proceed with the purchase.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-display text-2xl font-normal text-dark mb-4 tracking-wide uppercase">
                  5. Cancellation Policy
                </h2>
                <p className="text-gray-text leading-relaxed">
                  You may cancel or reschedule your test ride appointment up to 24 hours before the scheduled time. Last-minute cancellations (within 24 hours) may result in forfeiture of the booking fee.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-normal text-dark mb-4 tracking-wide uppercase">
                  6. Contact Information
                </h2>
                <div className="bg-gray-bg rounded-[20px] p-6">
                  <p className="text-gray-text leading-relaxed mb-4">
                    For questions about these terms or to modify your booking:
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className="text-dark"><strong>Email:</strong> <a href="mailto:support@bharathcyclehub.store" className="text-primary hover:text-primary-dark">support@bharathcyclehub.store</a></p>
                    <p className="text-dark"><strong>Address:</strong> Main Road, Chikka Bommasandra, Yelahanka, Bengaluru, Karnataka 560064</p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Meta Compliance Disclaimer */}
          <div className="mt-12 text-center text-xs text-gray-text/50">
            <p className="leading-relaxed">
              Disclaimer: This site is not a part of the Facebook website or Facebook Inc. Additionally, this site is NOT endorsed by Facebook in any way. FACEBOOK is a trademark of FACEBOOK, Inc.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
