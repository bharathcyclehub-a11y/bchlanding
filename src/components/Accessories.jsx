import CTAButton from './CTAButton';
import { motion } from 'framer-motion';

export default function Accessories({ onCTAClick }) {
    const accessoryItems = [
        {
            title: "Rider Essentials",
            description: "Premium helmets, knee pads, and gloves for maximum safety and comfort.",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            )
        },
        {
            title: "Cycle Add-ons",
            description: "Essential gear like mudguards, phone holders, and bottle cages.",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
            )
        },
        {
            title: "Smart Security",
            description: "Heavy-duty locks and GPS trackers to keep your ride secure.",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            )
        }
    ];

    return (
        <section className="py-8 sm:py-16 px-4 sm:px-6 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="order-2 lg:order-2"
                    >
                        <div className="inline-block px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-bold text-sm uppercase mb-6 tracking-wide">
                            Complete Riding Gear
                        </div>

                        <h2 className="font-display text-4xl sm:text-5xl font-normal text-dark mb-6 leading-tight">
                            Premium Accessories <br />
                            <span className="text-primary">For Rider & Machine</span>
                        </h2>

                        <p className="text-lg text-gray-text mb-8 leading-relaxed">
                            Enhance your riding experience with our curated collection of high-quality accessories. From personal safety gear to essential cycle add-ons, we've got you covered.
                        </p>

                        <div className="space-y-6">
                            {accessoryItems.map((item, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-dark text-lg mb-1">{item.title}</h4>
                                        <p className="text-sm text-gray-500">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10">
                            <CTAButton onClick={onCTAClick}>
                                View All Accessories
                            </CTAButton>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="order-1 lg:order-1 relative"
                    >
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gray-100 h-[500px]">
                            <img
                                src="/acc.jpeg"
                                alt="Cycling Accessories"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                            <div className="absolute bottom-6 left-6 right-auto">
                                <div className="bg-black/90 backdrop-blur-md p-3 rounded-lg border border-white/10 min-w-[200px]">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                        <span className="text-[10px] font-bold uppercase text-gray-300 tracking-wider">In Stock Now</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-[10px] text-gray-400">Premium Kit</div>
                                            <div className="text-xl font-bold text-white">Full Set</div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Badge */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="absolute -top-4 -right-4 bg-black p-3 rounded-xl shadow-xl border border-gray-800 max-w-[160px] hidden sm:block"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xl">✨</span>
                                <span className="font-bold text-white leading-tight text-sm">Genuine Parts</span>
                            </div>
                            <p className="text-[10px] text-gray-300">100% Authentic Brands</p>
                        </motion.div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
