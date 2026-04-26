import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const faqs = [
    {
      question: "Is the ₹99 booking fee refundable?",
      answer: "Yes! If you decide to buy any e-cycle, the ₹99 is adjusted against the price. If you choose not to buy, it's a small service fee for the technician's visit."
    },
    {
      question: "Do you offer 0% EMI?",
      answer: "Absolutely. We have partnered with all major banks to offer No Cost EMI options starting from just ₹999/month. You can check your eligibility instantly during the home visit."
    },
    {
      question: "Are these e-cycles safe for kids?",
      answer: "Safety is our #1 priority. All our kids' models come with app-based speed limiters (parent controlled), GPS tracking, and safety disconnect brakes. Plus, we include a free ISI-certified helmet with every purchase."
    },
    {
      question: "What if the cycle breaks down?",
      answer: "We offer 'Bicycle Care' - comprehensive insurance that covers theft and accidental damage. For repairs, our technicians provide doorstep service within 24 hours in Bangalore."
    },
    {
      question: "Can I test multiple models?",
      answer: "Yes, our technician brings 5 different models (based on your child's age/height) to your home so you can compare and choose the best one."
    },
    {
      question: "Do you have a physical store?",
      answer: "Yes, we are located in HSR Layout, Bangalore. You are welcome to visit us, but 90% of our customers prefer the convenience of our Home Test Ride service."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 bg-gray-bg">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-normal text-dark mb-2 tracking-wider uppercase">
            FURTHER ENQUIRIES
          </h2>
          <p className="text-base sm:text-lg text-gray-text">
            Comprehensive information for prospective buyers
          </p>
        </motion.div>

        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {faqs.slice(0, showAll ? faqs.length : 2).map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-[15px] overflow-hidden shadow-md border-t-2 border-transparent hover:border-primary transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left gap-4"
                  aria-expanded={openIndex === index}
                >
                  <span className="font-bold text-dark text-base sm:text-lg pr-4 uppercase tracking-wide">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-0 text-sm sm:text-base text-gray-text leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Toggle Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setShowAll(!showAll)}
            className="group flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-gray-200 text-dark font-bold uppercase tracking-wide shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300"
          >
            <span>{showAll ? 'View Less Questions' : 'View All Questions'}</span>
            <svg
              className={`w-4 h-4 text-primary transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 text-center"
        >
          <p className="text-gray-text text-sm mb-4 uppercase tracking-wide font-semibold">
            Still have questions?
          </p>
          <div className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-wide">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            <span>Our expert will answer everything on the call</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
