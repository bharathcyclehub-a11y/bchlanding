import { motion } from 'framer-motion';
import { useState, useRef } from 'react';

export default function VideoTestimonials({ onCTAClick }) {
  const [activeVideo, setActiveVideo] = useState(null);
  const scrollContainerRef = useRef(null);

  // Replace these with actual BCH YouTube video IDs from your channels
  const videos = [
    {
      id: "dQw4w9WgXcQ", // Replace with actual BCH video ID
      title: "Father's Joy - Auto Driver Buys Dream E-Cycle for His Son",
      channel: "BCH Main",
      views: "2.5M",
      likes: "85K",
      thumbnail: "https://images.unsplash.com/photo-1612833609963-0e62e1f5d9c3?auto=format&fit=crop&w=600&q=80",
      description: "Emotional moment when Ramesh, an auto driver, surprises his 14-year-old son with his dream e-cycle using our EMI option."
    },
    {
      id: "dQw4w9WgXcQ", // Replace with actual video ID
      title: "14-Year-Old's Reaction to BCH Doodle E-Cycle",
      channel: "EM Doodle BCH",
      views: "1.8M",
      likes: "62K",
      thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80",
      description: "Watch Arjun's priceless reaction when he test rides the EM Doodle for the first time at his home."
    },
    {
      id: "dQw4w9WgXcQ", // Replace with actual video ID
      title: "From Mobile Games to E-Cycle Adventures",
      channel: "Wattson Wheelz",
      views: "3.2M",
      likes: "95K",
      thumbnail: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=600&q=80",
      description: "Mother shares how her son stopped gaming 6 hours daily and now rides his BCH e-cycle for 2 hours every evening."
    },
    {
      id: "dQw4w9WgXcQ", // Replace with actual video ID
      title: "Bangalore to Nandi Hills - Umesh's E-Cycle Journey",
      channel: "Wattson Wheelz",
      views: "4.1M",
      likes: "125K",
      thumbnail: "https://images.unsplash.com/photo-1571333250630-f0230c320b6d?auto=format&fit=crop&w=600&q=80",
      description: "Watch Umesh explore Karnataka on his BCH e-cycle. He owns 6 e-cycles and 6 hybrids - all from BCH!"
    },
    {
      id: "dQw4w9WgXcQ", // Replace with actual video ID
      title: "30 Kids Group Ride - BCH Champions Community",
      channel: "BCH Main",
      views: "1.5M",
      likes: "48K",
      thumbnail: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=600&q=80",
      description: "Sunday group ride with 30+ BCH kids from Yelahanka. Join the coolest e-cycle community in Bangalore!"
    },
    {
      id: "dQw4w9WgXcQ", // Replace with actual video ID
      title: "Why We Chose BCH Over Decathlon - Parent's Honest Review",
      channel: "BCH Main",
      views: "2.9M",
      likes: "78K",
      thumbnail: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80",
      description: "IT professional explains why he chose BCH's home test ride service for his daughter's first e-cycle."
    }
  ];

  const handleVideoClick = (videoId) => {
    setActiveVideo(videoId);
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 mb-3">
                <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Real Stories</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-normal text-dark tracking-wider uppercase">
                See Why 10,000+ Families Trust BCH
              </h2>
            </div>

            {/* Social Proof Stats - Compact */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-xl font-bold text-dark">750K</div>
                <div className="text-xs text-gray-text">Followers</div>
              </div>
              <div className="w-px bg-gray-200"></div>
              <div className="text-center">
                <div className="text-xl font-bold text-dark">250K</div>
                <div className="text-xs text-gray-text">Subscribers</div>
              </div>
              <div className="w-px bg-gray-200"></div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-xl font-bold text-dark">
                  4.7 <span className="text-yellow-400 text-lg">★</span>
                </div>
                <div className="text-xs text-gray-text">Rating</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Horizontal Scroll Container */}
        <div className="relative">
          {/* Navigation Buttons - Desktop Only */}
          <button
            onClick={() => scroll('left')}
            className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full bg-white shadow-xl border-2 border-primary items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300"
            aria-label="Scroll left"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => scroll('right')}
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full bg-white shadow-xl border-2 border-primary items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300"
            aria-label="Scroll right"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Videos Horizontal Scroll */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {videos.map((video, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-white rounded-[20px] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-primary flex-shrink-0 w-[320px] sm:w-[360px] snap-center"
                onClick={() => handleVideoClick(video.id)}
              >
                {/* Video Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-gray-900">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300 flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-2xl"
                    >
                      <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </motion.div>
                  </div>

                  {/* Stats Badge */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <div className="px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-sm text-white text-xs font-bold flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      {video.views}
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-sm text-white text-xs font-bold flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      {video.likes}
                    </div>
                  </div>
                </div>

                {/* Video Details */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-gray-text">{video.channel}</span>
                  </div>

                  <h3 className="text-lg font-bold text-dark mb-2 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-text leading-relaxed line-clamp-2">
                    {video.description}
                  </p>
                </div>

                {/* Verified Badge */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </motion.div>
            ))}
          </div>
        </div>




      </div>

      {/* Video Modal (Optional - for embedded playback) */}
      {activeVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setActiveVideo(null)}
        >
          <div className="relative w-full max-w-5xl aspect-video">
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute -top-12 right-0 text-white hover:text-primary transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <iframe
              className="w-full h-full rounded-xl"
              src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </motion.div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
