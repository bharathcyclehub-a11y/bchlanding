import CTAButton from './CTAButton';
import { motion } from 'framer-motion';

export default function SafetyFeatures({ onCTAClick }) {
    const safetyItems = [
        {
            title: "Parent-Controlled Speed",
            description: "Set max speed limits via app to ensure your child rides safely.",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            title: "GPS Tracking",
            description: "Live location tracking so you always know where they are.",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        },
        {
            title: "Complimentary Safety Gear",
            description: "Free Helmet, Knee Pads & Gloves with every Test Ride booking.",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            )
        }
    ];

    return (
        <section className="py-8 sm:py-16 px-4 sm:px-6 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="order-2 lg:order-1"
                    >
                        <div className="inline-block px-4 py-2 rounded-full bg-green-50 text-green-600 font-bold text-sm uppercase mb-6 tracking-wide">
                            Safety First Priority
                        </div>

                        <h2 className="font-display text-4xl sm:text-5xl font-normal text-dark mb-6 leading-tight">
                            We Take Safety <br />
                            <span className="text-primary">More Seriously Than You Do</span>
                        </h2>

                        <p className="text-lg text-gray-text mb-8 leading-relaxed">
                            Every BCH e-cycle is engineered for maximum safety. From restricted speed modes for beginners to real-time tracking, we give parents complete peace of mind.
                        </p>

                        <div className="space-y-6">
                            {safetyItems.map((item, index) => (
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
                                Check Safety Features
                            </CTAButton>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="order-1 lg:order-2 relative"
                    >
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gray-100 h-[500px]">
                            <img
                                src="https://images.unsplash.com/photo-1595180630733-47027b46d042?auto=format&fit=crop&q=80"
                                alt="Kid wearing helmet"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                            <div className="absolute bottom-8 left-8 right-8">
                                <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl border border-white/20">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">Live Tracking Active</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-xs text-gray-500">Current Speed</div>
                                            <div className="text-2xl font-bold text-dark">12 km/h</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500">Battery</div>
                                            <div className="text-lg font-bold text-green-600">85%</div>
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
                            className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-xl border border-gray-100 max-w-[200px] hidden sm:block"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">⛑️</span>
                                <span className="font-bold text-dark leading-tight">ISI Certified Helmet</span>
                            </div>
                            <p className="text-xs text-gray-500">Included free with every purchase</p>
                        </motion.div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
