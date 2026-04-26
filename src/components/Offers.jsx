import { motion } from 'framer-motion';

export default function Offers({ onCTAClick }) {
  const offers = [
    {
      tag: "HOT DEAL",
      title: "Emotorad E-Bike",
      price: "₹19,400",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80",
      features: [
        "Get 15 FREE Accessories (Worth ₹3,000)",
        "All Over Bengaluru Free Delivery",
        "5 Years Warranty",
        "0% EMI Available",
        "Home Service Available"
      ],
      buttonText: "BOOK TEST RIDE"
    },
    {
      tag: "EXCHANGE MELA",
      title: "Exchange Offer",
      price: "Up to ₹10,000 OFF",
      image: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=600&q=80",
      features: [
        "Exchange Your Old Cycle",
        "We Accept All Brands & Conditions",
        "Instant Valuation",
        "Home Pickup & Drop Available",
        "Gear Cycles Start @ ₹8,499"
      ],
      buttonText: "GET VALUATION"
    },
    {
      tag: "SERVICE SPECIAL",
      title: "Expert Cycle Service",
      price: "Starting ₹99",
      image: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=600&q=80",
      features: [
        "Doorstep Service @ ₹349",
        "Free In-Store Service Across Bengaluru",
        "5 Years Guarantee + Warranty",
        "Shimano Authorized Technicians",
        "Quick 60-Min Service"
      ],
      buttonText: "BOOK SERVICE"
    }
  ];

  return (
    <section id="offers" className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-bg">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-normal text-dark mb-4 tracking-wider uppercase">
            EXCLUSIVE OFFERS
          </h2>
          <p className="text-lg sm:text-xl text-gray-text max-w-2xl mx-auto">
            Special deals just for you - Limited time only!
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {offers.map((offer, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-[24px] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                  {offer.tag}
                </span>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-display text-2xl text-dark mb-2 tracking-wide">
                  {offer.title}
                </h3>
                <div className="text-3xl font-bold text-primary mb-4">
                  {offer.price}
                </div>

                <ul className="space-y-2 mb-6">
                  {offer.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-text">
                      <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={onCTAClick}
                  className="w-full bg-dark text-white font-bold py-3.5 rounded-full hover:bg-primary transition-colors duration-300 uppercase tracking-wide text-sm"
                >
                  {offer.buttonText}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <button
            onClick={onCTAClick}
            className="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-4 rounded-full hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl uppercase tracking-wide"
          >
            <span>VIEW ALL BIKES</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
