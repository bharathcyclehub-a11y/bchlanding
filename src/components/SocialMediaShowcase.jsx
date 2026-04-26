import { motion } from 'framer-motion';

export default function SocialMediaShowcase() {
  const socialStats = [
    {
      platform: 'Instagram',
      handle: '@bharathcyclehub',
      followers: '340K+',
      icon: '📸',
      color: 'from-purple-500 to-pink-500',
      link: 'https://www.instagram.com/bharathcyclehub/',
      verified: true
    },
    {
      platform: 'Facebook',
      handle: 'Bharath Cycle Hub',
      followers: '500K+',
      icon: '👍',
      color: 'from-blue-600 to-blue-700',
      link: '#',
      verified: true
    },
    {
      platform: 'YouTube',
      handle: 'Bharath Cycle Hub',
      followers: '150K+',
      icon: '▶️',
      color: 'from-red-600 to-red-700',
      link: '#',
      verified: false
    },
    {
      platform: 'WhatsApp',
      handle: 'Community',
      followers: '10K+',
      icon: '💬',
      color: 'from-green-500 to-green-600',
      link: '#',
      verified: false
    }
  ];

  const testimonialImages = [
    'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=400&h=400&fit=crop'
  ];

  return (
    <section className="py-10 sm:py-24 px-4 sm:px-6 bg-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 50px, rgba(220, 38, 38, 0.1) 50px, rgba(220, 38, 38, 0.1) 52px)`
        }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-2xl">🌟</span>
            <span className="text-sm font-bold text-primary uppercase tracking-wide">Trusted by 1M+ Followers</span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl mb-3 sm:mb-4 tracking-wider uppercase">
            Join Our <span className="text-primary">Growing Community</span>
          </h2>
          <p className="text-gray-text text-sm sm:text-lg max-w-2xl mx-auto">
            Over 1 million cycling enthusiasts trust us across social media platforms. See what makes us Bangalore's favorite cycle destination.
          </p>
        </motion.div>

        {/* Social Media Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
          {socialStats.map((social, index) => (
            <motion.a
              key={index}
              href={social.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="relative bg-white rounded-2xl sm:rounded-[20px] p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 overflow-hidden group"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${social.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <span className="text-2xl sm:text-4xl">{social.icon}</span>
                  {social.verified && (
                    <span className="bg-blue-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-0.5 sm:gap-1">
                      ✓ <span className="hidden sm:inline">Verified</span>
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm sm:text-lg mb-0.5 sm:mb-1">{social.platform}</h3>
                <p className="text-gray-text text-xs sm:text-sm mb-2 sm:mb-3 truncate">{social.handle}</p>
                <div className="font-display text-xl sm:text-3xl text-primary tracking-wider">
                  {social.followers}
                </div>
                <p className="text-xs text-gray-text uppercase tracking-wide mt-1">Followers</p>
              </div>

              {/* Shine effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:animate-shine" />
              </div>
            </motion.a>
          ))}
        </div>

        {/* Instagram Feed Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl sm:rounded-[30px] p-4 sm:p-8 md:p-12"
        >
          <div className="text-center mb-8">
            <h3 className="font-display text-xl sm:text-3xl mb-2 tracking-wider uppercase">
              Follow Us on Instagram
            </h3>
            <p className="text-gray-text">
              Get daily cycling tips, offers, and inspiration from our community
            </p>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {testimonialImages.map((img, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="relative aspect-square rounded-xl sm:rounded-[20px] overflow-hidden shadow-lg cursor-pointer"
              >
                <img
                  src={img}
                  alt={`Customer ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                  <div className="text-white text-center">
                    <span className="text-2xl">❤️</span>
                    <p className="text-xs mt-1">{Math.floor(Math.random() * 500 + 100)}+ Likes</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <motion.a
              href="https://www.instagram.com/bharathcyclehub/"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm sm:text-base px-5 sm:px-8 py-3 sm:py-4 rounded-full shadow-xl hover:shadow-2xl transition-all"
            >
              <span className="text-2xl">📸</span>
              <span>FOLLOW @BHARATHCYCLEHUB</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </motion.a>
            <p className="text-sm text-gray-text mt-4">
              Join 340,000+ cycling enthusiasts who trust us daily
            </p>
          </div>
        </motion.div>

        {/* Trust Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 sm:mt-12 bg-dark text-white rounded-2xl sm:rounded-[30px] p-4 sm:p-8 md:p-12 text-center"
        >
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            <div>
              <div className="font-display text-2xl sm:text-4xl md:text-5xl text-primary mb-1 sm:mb-2 tracking-wider">1M+</div>
              <p className="text-white/80 text-xs sm:text-base">Social Media Followers</p>
            </div>
            <div>
              <div className="font-display text-2xl sm:text-4xl md:text-5xl text-primary mb-1 sm:mb-2 tracking-wider">50K+</div>
              <p className="text-white/80 text-xs sm:text-base">Monthly Engagement</p>
            </div>
            <div>
              <div className="font-display text-2xl sm:text-4xl md:text-5xl text-primary mb-1 sm:mb-2 tracking-wider">4.7★</div>
              <p className="text-white/80 text-xs sm:text-base">Average Rating</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
