import { motion } from 'framer-motion';

export default function Disclaimer() {
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
              Disclaimer
            </h1>
            <p className="text-gray-text text-sm">Important Information</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-[20px] shadow-lg p-8 sm:p-12 border-t-6 border-primary">
            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="font-display text-2xl font-normal text-dark mb-4 tracking-wide uppercase">
                  General Disclaimer
                </h2>
                <p className="text-gray-text leading-relaxed">
                  The information provided on this website is for general informational purposes only. While we strive to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information, products, services, or related graphics contained on the website.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-display text-2xl font-normal text-dark mb-4 tracking-wide uppercase">
                  Product Information
                </h2>
                <p className="text-gray-text leading-relaxed">
                  Bicycle specifications, features, and pricing are subject to change without notice. The actual bicycles available for test rides may vary from those displayed on this website. We recommend confirming all details with our team before making a purchase decision.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-display text-2xl font-normal text-dark mb-4 tracking-wide uppercase">
                  Test Ride Safety
                </h2>
                <div className="bg-orange-50 rounded-[20px] p-6 border-l-4 border-orange-500">
                  <p className="text-gray-text leading-relaxed">
                    By participating in a test ride, you acknowledge that cycling involves inherent risks. Bharath Cycle Hub is not responsible for any injuries, damages, or losses incurred during test rides. All riders must comply with local traffic laws and safety regulations.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="font-display text-2xl font-normal text-dark mb-4 tracking-wide uppercase">
                  External Links
                </h2>
                <p className="text-gray-text leading-relaxed">
                  This website may contain links to external websites that are not provided or maintained by Bharath Cycle Hub. We do not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-normal text-dark mb-4 tracking-wide uppercase">
                  Limitation of Liability
                </h2>
                <p className="text-gray-text leading-relaxed">
                  In no event shall Bharath Cycle Hub be liable for any loss or damage including, without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this website or our services.
                </p>
              </section>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
