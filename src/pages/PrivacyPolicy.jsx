import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
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
              Privacy Policy
            </h1>
            <p className="text-gray-text text-sm">Last Updated: January 2026</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-[20px] shadow-lg p-8 sm:p-12 border-t-6 border-primary">
            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="font-display text-2xl font-normal text-dark mb-4 tracking-wide uppercase">
                  1. Data Collection
                </h2>
                <p className="text-gray-text leading-relaxed">
                  We collect your name, phone number, and email address solely for the purpose of scheduling your test ride, confirming your annual service plan, or communicating regarding your inquiries.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-display text-2xl font-normal text-dark mb-4 tracking-wide uppercase">
                  2. How We Use Your Information
                </h2>
                <div className="space-y-4 text-gray-text">
                  <div>
                    <h3 className="font-bold text-dark mb-2">Scheduling</h3>
                    <p className="leading-relaxed">
                      To coordinate your test ride appointment at our Yelahanka store or your home location.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-dark mb-2">No Spam</h3>
                    <p className="leading-relaxed">
                      We respect your inbox. We do not sell, trade, or share your personal data with third-party marketing agencies.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="font-display text-2xl font-normal text-dark mb-4 tracking-wide uppercase">
                  3. Cookies & Tracking
                </h2>
                <p className="text-gray-text leading-relaxed">
                  We use technologies such as cookies and pixels (including Google Analytics and Meta Pixel) to analyze website traffic and improve our advertising performance. This helps us show our ads to people who are genuinely interested in electric cycles. By using our site, you consent to the use of these tracking technologies.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-display text-2xl font-normal text-dark mb-4 tracking-wide uppercase">
                  4. Data Security
                </h2>
                <p className="text-gray-text leading-relaxed">
                  We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-display text-2xl font-normal text-dark mb-4 tracking-wide uppercase">
                  5. Your Rights
                </h2>
                <p className="text-gray-text leading-relaxed">
                  You have the right to access, correct, or delete your personal information at any time. Contact us at{' '}
                  <a href="mailto:support@bharathcyclehub.store" className="text-primary hover:text-primary-dark font-medium">
                    support@bharathcyclehub.store
                  </a>{' '}
                  for any privacy-related requests.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-normal text-dark mb-4 tracking-wide uppercase">
                  6. Contact Us
                </h2>
                <div className="bg-gray-bg rounded-[20px] p-6">
                  <p className="text-gray-text leading-relaxed mb-4">
                    If you have any questions about this Privacy Policy, please contact us:
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className="text-dark"><strong>Email:</strong> <a href="mailto:support@bharathcyclehub.store" className="text-primary hover:text-primary-dark">support@bharathcyclehub.store</a></p>
                    <p className="text-dark"><strong>Address:</strong> Main Road, Chikka Bommasandra, Yelahanka, Bengaluru, Karnataka 560064</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
