import { motion } from 'framer-motion';

const testimonials = [
    {
      name: "Rahul Sharma",
      location: "Whitefield, Bangalore",
      text: "The home test ride service was amazing! I got to try 5 different bikes at my doorstep. The expert helped me choose the perfect one for my daily commute. Best ₹99 I ever spent!",
      rating: 5,
      avatar: "RS",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&auto=format",
      verified: true
    },
    {
      name: "Priya Menon",
      location: "Koramangala, Bangalore",
      text: "As a first-time buyer, I was confused about which cycle to get for my son. The expert was so patient and knowledgeable. Highly recommend this service to all parents!",
      rating: 5,
      avatar: "PM",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&auto=format",
      verified: true
    },
    {
      name: "Arun Kumar",
      location: "HSR Layout, Bangalore",
      text: "No more visiting multiple shops! They brought the bikes home, and my kids could try them comfortably. The booking fee was adjusted in the final price. Great experience!",
      rating: 5,
      avatar: "AK",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&auto=format",
      verified: true
    }
];

export default function Testimonials() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-normal text-dark mb-4 tracking-wider uppercase">
            WHAT OUR CUSTOMERS SAY
          </h2>
          <p className="text-lg sm:text-xl text-gray-text max-w-2xl mx-auto">
            Join thousands of happy families who found their perfect bicycle with us
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="flex flex-col p-8 rounded-[20px] bg-white border-2 border-gray-200 hover:border-primary hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
            >
              {/* Decorative quote icon */}
              <div className="absolute top-4 right-4 text-primary/10">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>

              {/* Rating stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Testimonial text */}
              <p className="text-gray-text text-base leading-relaxed mb-6 flex-grow relative z-10">
                "{testimonial.text}"
              </p>

              {/* Customer info */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <div className="relative">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-14 h-14 rounded-full bg-primary hidden items-center justify-center text-white font-bold text-sm">
                    {testimonial.avatar}
                  </div>
                  {testimonial.verified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-white">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-bold text-dark text-base flex items-center gap-2">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-text flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {testimonial.location}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/20">
            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-bold text-dark uppercase tracking-wide">
              10,000+ Happy Customers in Bangalore
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
