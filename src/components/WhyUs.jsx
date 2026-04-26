import { motion } from 'framer-motion';
import { useState } from 'react';

export default function WhyUs() {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      title: "Safe & Certified Bikes",
      description: "Every cycle is manufacturer-certified with full warranty — safe for your kid",
      hoverText: "We only stock certified bicycles with authentic components. Your child's safety is our priority — every bike passes quality checks before delivery."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      title: "We Come to You",
      description: "5 bikes delivered to your door — your kid test rides all of them at home",
      hoverText: "No showroom trips needed. Our team brings curated options to your neighbourhood so your child can test ride and pick their favourite."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Easy on Your Budget",
      description: "0% EMI from ₹999/month + exchange old cycle for up to ₹10,000 off",
      hoverText: "Flexible payments so the right bike fits your budget. Trade in your kid's outgrown cycle and upgrade without the full upfront cost."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: "Always Rideable",
      description: "8 Shimano-certified mechanics — doorstep service across Bangalore",
      hoverText: "Your kid's bike will never sit idle. Our technicians come to your area for repairs and maintenance so it's always ready to ride."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "5-Year Warranty",
      description: "Frame, motor & components covered — ride worry-free for years",
      hoverText: "Unlike other brands, we stand behind every sale. 5-year warranty on frame and motor plus free 1st year servicing gives parents real peace of mind."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: "Free Delivery & Setup",
      description: "We deliver, assemble & teach your kid to ride — anywhere in Bangalore",
      hoverText: "From Whitefield to Yelahanka, we deliver free. Our team assembles the bike at your home and gives your child a complete riding orientation."
    }
  ];

  return (
    <section id="why-us" className="py-8 sm:py-16 px-4 sm:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left side - Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-[32px] overflow-hidden shadow-2xl">
              <img
                src="/store-hq.png"
                alt="Bharath Cycle Hub Showroom"
                className="w-full h-[400px] sm:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

              {/* Floating badge */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Bharath+Cycle+Hub+Main+Road+Chikka+Bommasandra+Yelahanka+Bengaluru+Karnataka+560064"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4"
                >
                  <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center group-hover:bg-primary-dark transition-colors">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-dark group-hover:text-primary transition-colors">Visit Our Showroom</h4>
                    <p className="text-sm text-gray-text">Yelahanka, Bengaluru · 300+ bikes on display</p>
                    <p className="text-xs text-primary font-semibold mt-1">Open 7 Days · Visited by 500+ families</p>
                  </div>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right side - Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-10"
            >
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-normal text-dark mb-4 tracking-wider uppercase">
                THE BHARATH CYCLE HUB COMMITMENT
              </h2>
              <p className="text-lg text-gray-text max-w-xl">
                Providing specialized guidance for <span className="text-primary font-bold">10,000+ families</span> in Bengaluru. We are dedicated to ensuring your family's cycling safety and satisfaction.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="flex gap-4 group relative cursor-pointer"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-dark mb-1 group-hover:text-primary transition-colors">{feature.title}</h3>
                    <p className="text-sm text-gray-text leading-relaxed">{feature.description}</p>

                    {/* Hover tooltip */}
                    {hoveredIndex === index && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute z-10 left-0 right-0 top-full mt-2 p-4 bg-dark text-white text-sm rounded-xl shadow-xl border border-white/10"
                      >
                        <div className="absolute -top-2 left-8 w-4 h-4 bg-dark transform rotate-45 border-l border-t border-white/10"></div>
                        {feature.hoverText}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
