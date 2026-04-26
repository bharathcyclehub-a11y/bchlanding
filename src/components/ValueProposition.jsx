import { motion } from 'framer-motion';
import { useState } from 'react';

export default function ValueProposition() {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const benefits = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "PRIORITIZES EXPERT GUIDANCE",
      description: "Ensures dedicated attention for discerning parents",
      hoverText: "The nominal ₹99 consultation fee allows our specialists to dedicate focused time to your requirements, ensuring a professional and tailored experience for your family."
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      title: "SAFETY & QUALITY ASSURED",
      description: "A professional session with curated safety-first options",
      hoverText: "Your consultation guarantees a structured session where our experts present 5 bicycles specifically vetted for safety, ergonomics, and reliability."
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      ),
      title: "₹99 CAN BE ADJUSTED ON PURCHASE",
      description: "Applied toward your final decision",
      hoverText: "When you purchase any cycle from us after your test ride, the ₹99 booking fee is fully adjusted against your purchase price. It's practically a free test ride!"
    }
  ];

  return (
    <section className="py-8 sm:py-16 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-normal text-dark mb-4 tracking-wider uppercase">
            PROFESSIONAL CONSULTATION
          </h2>
          <p className="text-lg sm:text-xl text-gray-text max-w-2xl mx-auto">
            Our ₹99 fee is a professional commitment to ensure you receive the highest level of expert guidance and safety assessment.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10, borderTopColor: '#DC2626' }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative flex flex-col items-center text-center p-8 rounded-[20px] bg-white border-t-6 border-transparent hover:border-primary transition-all duration-300 shadow-lg cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-full bg-primary group-hover:scale-110 flex items-center justify-center text-white mb-4 transition-transform duration-300">
                {benefit.icon}
              </div>
              <h3 className="text-lg font-bold text-dark mb-3 tracking-wide">
                {benefit.title}
              </h3>
              <p className="text-gray-text text-sm leading-relaxed">
                {benefit.description}
              </p>

              {/* Hover tooltip */}
              {hoveredIndex === index && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute z-10 left-1/2 -translate-x-1/2 top-full mt-4 w-64 p-4 bg-dark text-white text-sm rounded-xl shadow-2xl border border-white/10"
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-dark transform rotate-45 border-l border-t border-white/10"></div>
                  {benefit.hoverText}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>


      </div>
    </section>
  );
}
