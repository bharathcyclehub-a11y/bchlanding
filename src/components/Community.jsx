
import { motion } from 'framer-motion';
import CTAButton from './CTAButton';

export default function Community({ onCTAClick }) {
    const posts = [
        "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=600&q=60",
        "https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=600&q=60",
        "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=600&q=60",
        "https://images.unsplash.com/photo-1496147539180-13929f8aa03a?auto=format&fit=crop&w=600&q=60",
        "https://images.unsplash.com/photo-1505705694340-019e1e335916?auto=format&fit=crop&w=600&q=60"
    ];

    return (
        <section className="py-6 sm:py-10 px-4 sm:px-6 bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-6">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="font-display text-4xl sm:text-5xl font-normal text-dark mb-4"
                    >
                        Not Just A Cycle. <br />
                        <span className="text-primary">It's A Community.</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-sm sm:text-base text-gray-text max-w-4xl mx-auto"
                    >
                        Connect with 5,000+ parents and kids. Weekend group rides, safety workshops, and lifelong friendships await.
                    </motion.p>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-4">
                    {posts.map((img, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className="relative group rounded-xl overflow-hidden shadow-md cursor-pointer aspect-square"
                        >
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                                <div className="text-white text-center p-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    <p className="font-bold text-xs sm:text-sm">Sunday Ride @ Cubbon Park</p>
                                    <p className="text-xs opacity-80">2 days ago</p>
                                </div>
                            </div>
                            <img
                                src={img}
                                alt="Community Ride"
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Community Stats Strip */}
                <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100 grid grid-cols-3 gap-4 text-center max-w-4xl mx-auto">
                    <div>
                        <div className="text-xl sm:text-2xl font-bold text-primary mb-0.5">5,200+</div>
                        <div className="text-gray-500 text-[10px] sm:text-xs font-medium uppercase tracking-wide">Community Members</div>
                    </div>
                    <div className="border-l border-gray-200">
                        <div className="text-xl sm:text-2xl font-bold text-primary mb-0.5">128</div>
                        <div className="text-gray-500 text-[10px] sm:text-xs font-medium uppercase tracking-wide">Weekend Rides</div>
                    </div>
                    <div className="border-l border-gray-200">
                        <div className="text-xl sm:text-2xl font-bold text-primary mb-0.5">540K</div>
                        <div className="text-gray-500 text-[10px] sm:text-xs font-medium uppercase tracking-wide">Km Ridden Together</div>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center mt-8">
                    <CTAButton onClick={onCTAClick}>
                        Join the Community - Book Test Ride
                    </CTAButton>
                </div>
            </div>
        </section>
    );
}
