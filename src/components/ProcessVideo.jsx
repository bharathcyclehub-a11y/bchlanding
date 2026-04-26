import CTAButton from './CTAButton';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function ProcessVideo({ onCTAClick }) {
    const [isPlaying, setIsPlaying] = useState(false);

    const steps = [
        {
            number: "01",
            title: "Book Online",
            desc: "Pay just ₹99 to schedule your expert visit slot."
        },
        {
            number: "02",
            title: "We Come to You",
            desc: "Our technician arrives at your doorstep with 5 e-cycles."
        },
        {
            number: "03",
            title: "Test Ride",
            desc: "Your child tries all models to find the perfect fit."
        },
        {
            number: "04",
            title: "Purchase",
            desc: "Zero-cost EMI and instant delivery available."
        }
    ];

    return (
        <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="font-display text-4xl sm:text-5xl font-normal text-dark mb-6"
                    >
                        How <span className="text-primary">Home Test Ride</span> Works
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-text text-lg max-w-2xl mx-auto"
                    >
                        We've simplified the process to save you time. No traffic, no store visits—just convenience.
                    </motion.p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Video Mockup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative rounded-[32px] overflow-hidden shadow-2xl bg-gray-900 border border-gray-800 aspect-video group cursor-pointer"
                        onClick={() => setIsPlaying(true)}
                    >
                        {!isPlaying ? (
                            <>
                                <img
                                    src="/Home Test ride.jpeg"
                                    alt="Test Ride Process"
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-opacity duration-300"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300">
                                        <svg className="w-8 h-8 text-primary ml-1" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="absolute bottom-6 left-6">
                                    <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                        Watch Video
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full bg-black">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src="https://www.youtube.com/embed/E9_4DMMunJc?autoplay=1&rel=0"
                                    title="How Home Test Ride Works"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full"
                                ></iframe>
                            </div>
                        )}
                    </motion.div>

                    {/* Steps */}
                    <div className="space-y-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="flex gap-6"
                            >
                                <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-primary/30 flex items-center justify-center font-bold text-lg text-primary bg-primary/5">
                                    {step.number}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-dark mb-2">{step.title}</h3>
                                    <p className="text-gray-text leading-relaxed">{step.desc}</p>
                                </div>
                            </motion.div>
                        ))}

                        <div className="mt-8 text-center">
                            <CTAButton onClick={onCTAClick}>
                                Book Test Ride - ₹99
                            </CTAButton>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
