import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: 'What if my kid stops using it after a few months?',
    answer: 'We hear this concern a lot. Here\'s what we\'ve seen: kids who integrate the e-cycle into daily commute (school, tuition, friends\' houses) ride it for years. Our team helps you pick the right model for your kid\'s actual routine — not just excitement. Plus, our doorstep service keeps the cycle in top shape so it\'s always ready to ride.',
  },
  {
    question: 'Is it safe for my child in Bangalore traffic?',
    answer: 'All our e-cycles come with custom speed lock (parents can limit max speed), disc brakes, and LED lights. We include a free helmet with every purchase. Most kids ride within 3km of home — school, tuition, friends\' houses — on familiar residential roads, not highways.',
  },
  {
    question: 'What is included in the ₹99 test ride?',
    answer: 'We bring 5 curated bicycles to your home based on your preferences. Your kid gets to test ride all of them in your neighbourhood with expert guidance. The ₹99 booking fee is fully adjusted in your final purchase. Zero pressure — if nothing clicks, that\'s okay.',
  },
  {
    question: '₹50K for a cycle — isn\'t a scooter better value?',
    answer: 'A scooter needs a license (16+ years), fuel, insurance, and has serious accident risk. An e-cycle gives your kid independence NOW — no license needed, zero fuel cost, great exercise, and controlled speed (max 25kmph). Many parents tell us it replaced screen time with outdoor activity. The 5-year warranty and free servicing make the total cost of ownership very low.',
  },
  {
    question: 'Is EMI available? What if I don\'t qualify?',
    answer: 'Yes, we offer 0% EMI from ₹999/month through leading banks and NBFCs. If EMI isn\'t available for you, we also accept credit cards and have flexible payment options. Our team will work with you to find the best way — many families pay comfortably in cash or card.',
  },
  {
    question: 'What about servicing? I live far from your Yelahanka store.',
    answer: 'We understand this is the #1 concern for parents. That\'s why we offer doorstep service across Bangalore — our technicians come to your area. We have 8 Shimano-certified mechanics with a 6-day turnaround. You also get free servicing for the first year and we\'re launching bicycle care insurance starting at ₹999.',
  },
  {
    question: 'What warranty do I get?',
    answer: 'All e-cycles come with manufacturer warranty (2 years on electrical components, up to 5 years on frame). On top of that, BCH provides free servicing for the first year, free doorstep support, and our team is just a phone call away. Unlike large EV brands, we personally ensure every service issue is resolved.',
  },
  {
    question: 'Can I exchange my old bicycle?',
    answer: 'Absolutely! We accept all brands and conditions for exchange — up to ₹10,000 off on your new bicycle. We even offer home pickup for your old cycle. Many families exchange their kid\'s outgrown cycle when upgrading to an e-bike.',
  },
  {
    question: 'Do you deliver across all of Bangalore?',
    answer: 'Yes! From Whitefield to Yelahanka, Koramangala to Electronic City — we deliver across Bangalore with free assembly. Home test rides are also available city-wide.',
  },
  {
    question: 'How do I reach you for support?',
    answer: 'Call us at +91 88920 31480 (our 3 telecallers are available Mon-Sun, 10AM-8:30PM) or WhatsApp us for quick replies. You can also visit our 6,500 sqft showroom in Yelahanka with 300+ bicycles on display.',
  },
];

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div className="border-b border-white/[0.06] last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className={`font-medium text-sm sm:text-base pr-4 transition-colors duration-300 ${isOpen ? 'text-primary' : 'text-white/90 group-hover:text-primary'}`}>
          {faq.question}
        </span>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${isOpen ? 'border-primary bg-primary/10 rotate-45' : 'border-white/10 group-hover:border-primary'}`}>
          <svg className={`w-4 h-4 transition-colors duration-300 ${isOpen ? 'text-primary' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
          </svg>
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <p className="text-gray-400 text-sm leading-relaxed pb-5 pr-12">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const visibleFaqs = showAll ? faqs : faqs.slice(0, 2);

  return (
    <section className="py-8 sm:py-12 bg-dark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8"
        >
          <p className="text-primary text-xs sm:text-sm uppercase tracking-[0.25em] font-medium mb-3">
            Parents Ask Us
          </p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-white mb-3 tracking-wider uppercase">
            Your Questions, Answered
          </h2>
          <p className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed font-light">
            The real concerns parents have before buying — and honest answers from 25 years of experience
          </p>
        </motion.div>

        {/* FAQ List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-dark-light rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/[0.06]"
        >
          {visibleFaqs.map((faq, i) => (
            <FAQItem
              key={i}
              faq={faq}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}

          {faqs.length > 2 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full flex items-center justify-center gap-2 pt-3 text-primary hover:text-primary/80 font-medium text-sm transition-colors"
            >
              {showAll ? 'Show Less' : `View All ${faqs.length} Questions`}
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </motion.div>

        {/* Still have questions CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6"
        >
          <p className="text-gray-500 text-sm mb-3">Still have questions?</p>
          <a
            href="https://wa.me/918892031480?text=Hi%2C%20I%20have%20a%20question%20about%20your%20bicycles"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#25D366] hover:text-[#20BD5A] font-medium text-sm transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Ask us on WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  );
}
