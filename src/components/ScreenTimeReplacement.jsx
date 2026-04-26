
import { motion } from 'framer-motion';

export default function ScreenTimeReplacement() {
    return (
        <section className="py-8 sm:py-16 px-4 sm:px-6 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Content Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="order-2 lg:order-1"
                    >
                        <div className="inline-block px-4 py-2 rounded-full bg-red-50 text-red-600 font-bold text-sm uppercase mb-6 tracking-wide">
                            The Real Problem
                        </div>

                        <h2 className="font-display text-4xl sm:text-5xl font-normal text-dark mb-6 leading-tight">
                            Replace Screen Time <br />
                            <span className="text-primary">With Green Time</span>
                        </h2>

                        <p className="text-lg text-gray-text mb-8 leading-relaxed">
                            Kids today spend an average of <span className="font-bold text-dark">6+ hours</span> on phones and tablets. An E-Cycle isn't just a toy—it's a lifestyle change that gets them outdoors, active, and socializing with friends.
                        </p>

                        <div className="space-y-6">
                            {[
                                {
                                    title: "Physical Activity",
                                    desc: "Pedal assist encourages longer rides, burning calories without exhaustion.",
                                    icon: "💪"
                                },
                                {
                                    title: "Mental Wellbeing",
                                    desc: "Outdoor exploration reduces stress and improves focus.",
                                    icon: "🧠"
                                },
                                {
                                    title: "Social Connection",
                                    desc: "Joining riding groups helps build real-world friendships.",
                                    icon: "🤝"
                                }
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-lg transition-all"
                                >
                                    <div className="text-2xl">{item.icon}</div>
                                    <div>
                                        <h4 className="font-bold text-dark text-lg">{item.title}</h4>
                                        <p className="text-sm text-gray-500">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Visual Side */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative order-1 lg:order-2"
                    >
                        {/* Split Image Effect */}
                        <div className="relative h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl">
                            {/* "Before" Half */}
                            <div className="absolute inset-0 w-1/2 overflow-hidden">
                                <img
                                    src="/usephone.png"
                                    alt="Child on Phone"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                                    Before: Indoors
                                </div>
                            </div>

                            {/* "After" Half */}
                            <div className="absolute inset-0 left-1/2 w-1/2 overflow-hidden">
                                <img
                                    src="/happy.png"
                                    alt="Child Cycling"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                                    After: Outdoors
                                </div>
                            </div>

                            {/* Divider Line */}
                            <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-white shadow-[0_0_20px_rgba(0,0,0,0.5)] z-10 transform -translate-x-1/2 flex items-center justify-center">
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg transform rotate-90 sm:rotate-0">
                                    <svg className="w-4 h-4 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Statistic Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="absolute -bottom-6 -left-6 bg-black p-6 rounded-2xl shadow-xl border border-gray-800 max-w-xs z-20 hidden sm:block"
                        >
                            <div className="flex items-end gap-2 mb-1">
                                <span className="text-4xl font-bold text-primary">93%</span>
                            </div>
                            <p className="text-sm text-gray-300 font-medium">
                                Parents reported reduced screen time within 2 weeks of buying an E-Cycle.
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
