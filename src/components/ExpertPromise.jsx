import { motion } from 'framer-motion';

export default function ExpertPromise({ quizAnswers, onContinue }) {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-16 bg-gradient-to-b from-dark to-dark-light">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full"
      >
        <div className="text-center mb-8">
          {/* Success checkmark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary mb-6"
          >
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>

          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-normal text-white mb-6 uppercase tracking-wider">
            Expert Guidance.
            <span className="block text-primary mt-2">Personalized For You.</span>
          </h2>

          <p className="text-lg sm:text-xl text-gray-light mb-8 leading-relaxed max-w-xl mx-auto">
            Our specialists will utilize your assessment to curate a professional selection of bicycles delivered directly to your residence, ensuring an informed decision for your family.
          </p>

          {/* YouTube Trust Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-primary/30 mb-4"
          >
            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            <span className="text-sm font-semibold text-white">Trusted by 2.35 Lakh+ subscribers</span>
          </motion.div>
        </div>

        {/* Summary of answers */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-white rounded-[20px] p-6 sm:p-8 shadow-lg border-t-6 border-primary mb-8"
        >
          <h3 className="text-lg font-bold text-dark mb-4 flex items-center gap-2 uppercase tracking-wide">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Your Requirements
          </h3>
          <div className="space-y-3">
            {Object.entries(quizAnswers).map(([key, value], index) => (
              <div key={index} className="flex items-start gap-3 text-sm">
                <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-text capitalize font-medium">
                  {value.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid sm:grid-cols-3 gap-4 mb-10"
        >
          {[
            { icon: "🎯", label: "Curated for you" },
            { icon: "🏠", label: "At your home" },
            { icon: "✨", label: "Zero pressure" }
          ].map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-4 rounded-[20px] bg-white/10 border border-white/20"
            >
              <span className="text-3xl mb-2">{item.icon}</span>
              <span className="text-sm font-bold text-white uppercase tracking-wide">{item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          onClick={onContinue}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group w-full flex items-center justify-center gap-3 px-8 py-5 text-lg font-bold text-white bg-primary rounded-[50px] shadow-2xl hover:bg-primary-dark transition-all duration-300 uppercase tracking-wide"
        >
          <span>PROCEED TO CONSULTATION</span>
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>

        <p className="text-center text-sm text-gray-light mt-4 font-medium italic">
          Secure your professional consultation for a nominal ₹99 fee
        </p>
      </motion.div>
    </section>
  );
}
