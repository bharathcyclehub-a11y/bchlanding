import { motion } from 'framer-motion';

export default function SuccessScreen({ userData }) {
  const firstName = userData?.name?.split(' ')[0] || 'there';

  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-16 bg-gradient-to-b from-dark to-dark-light">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full text-center"
      >
        {/* Success animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary mb-8 shadow-xl"
        >
          <motion.svg
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="w-12 h-12 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </motion.svg>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="font-display text-4xl sm:text-5xl md:text-6xl font-normal text-white mb-4 uppercase tracking-wider"
        >
          Congratulations, {firstName}!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-lg sm:text-xl text-gray-light mb-12 leading-relaxed max-w-xl mx-auto"
        >
          Your booking is confirmed. Our expert will call you within 24 hours to schedule your visit.
        </motion.p>

        {/* Next steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-white rounded-[20px] p-8 shadow-lg border-t-6 border-primary mb-8"
        >
          <h2 className="text-xl font-bold text-dark mb-6 flex items-center justify-center gap-2 uppercase tracking-wide">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            What happens next
          </h2>

          <div className="space-y-4 text-left">
            {[
              {
                step: "1",
                title: "Expert Reviews Your Needs",
                description: "We analyze your requirements and prepare curated options"
              },
              {
                step: "2",
                title: "Confirmation Call",
                description: "Our expert calls within 24 hours to schedule your visit"
              },
              {
                step: "3",
                title: "Home Test Ride",
                description: "Try 5 curated bicycles in the comfort of your home"
              },
              {
                step: "4",
                title: "Make Your Decision",
                description: "Choose what feels perfect, with zero pressure"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                className="flex items-start gap-4"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                  {item.step}
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="font-bold text-dark mb-1 uppercase tracking-wide text-sm">{item.title}</div>
                  <div className="text-sm text-gray-text leading-relaxed">{item.description}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* WhatsApp contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <p className="text-gray-light text-sm mb-4 font-medium">
            Questions or need to reschedule?
          </p>
          <a
            href="https://wa.me/918892031480"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-[50px] transition-colors shadow-lg uppercase tracking-wide"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span>Contact us on WhatsApp</span>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-12 p-6 bg-primary/10 rounded-[20px] border border-primary/20"
        >
          <p className="text-white leading-relaxed">
            🎉 <strong className="text-primary">Welcome to stress-free bicycle buying.</strong> We're excited to help you find the perfect ride!
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
