
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function CustomerProfiles() {
    const [activeFilter, setActiveFilter] = useState('All');

    const filters = ['All', '8-12 Years', '13-16 Years', 'Teens'];

    const profiles = [
        {
            name: "Arjun K.",
            age: "10 Years",
            model: "EM Doodle",
            category: "8-12 Years",
            quote: "I used to play video games all day. Now I wait for evening to ride my cycle!",
            image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80"
        },
        {
            name: "Sneha R.",
            age: "14 Years",
            model: "EM Ranger",
            category: "13-16 Years",
            quote: "Going to tuition is so fun now. My friends are jealous of my e-cycle!",
            image: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?auto=format&fit=crop&q=80"
        },
        {
            name: "Rohan M.",
            age: "16 Years",
            model: "Wattson Wheelz",
            category: "Teens",
            quote: "The battery life is amazing. I charge it only twice a week for my college commute.",
            image: "https://images.unsplash.com/photo-1488161628813-99c974fc5bcd?auto=format&fit=crop&q=80"
        },
        {
            name: "Priya S.",
            age: "11 Years",
            model: "EM Doodle",
            category: "8-12 Years",
            quote: "My dad promised me this for scoring 90%. Best gift ever!",
            image: "https://images.unsplash.com/photo-1616874535244-73aea5daadb9?auto=format&fit=crop&q=80"
        }
    ];

    const filteredProfiles = activeFilter === 'All'
        ? profiles
        : profiles.filter(p => p.category === activeFilter);

    return (
        <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="font-display text-4xl sm:text-5xl font-normal text-dark mb-4">
                        Meet Our <span className="text-primary">Happy Riders</span>
                    </h2>
                    <p className="text-lg text-gray-text max-w-2xl mx-auto mb-8">
                        See who's riding BCH e-cycles in your neighborhood.
                    </p>

                    {/* Filters */}
                    <div className="flex flex-wrap justify-center gap-3">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-6 py-2 rounded-full font-bold text-sm transition-all duration-300 ${activeFilter === filter
                                        ? 'bg-primary text-white shadow-lg scale-105'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredProfiles.map((profile, index) => (
                        <motion.div
                            key={index}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-lg hover:shadow-xl transition-shadow"
                        >
                            <div className="h-48 overflow-hidden relative">
                                <img
                                    src={profile.image}
                                    alt={profile.name}
                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                    <h3 className="text-white font-bold text-lg">{profile.name}</h3>
                                    <p className="text-white/80 text-xs">{profile.age}</p>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="mb-4">
                                    <div className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Rides</div>
                                    <div className="text-primary font-bold">{profile.model}</div>
                                </div>

                                <div className="relative">
                                    <svg className="absolute -top-2 -left-2 w-6 h-6 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M14.017 21L14.017 18C14.017 16.0547 15.4375 15.1152 16.7188 15.1152L17.75 15.1152C17.75 15.1152 17.75 11.0859 13.9219 9.38086L14.4844 6.88086C14.4844 6.88086 21.0312 8.4375 21.0312 16.6367L21 21L14.017 21ZM5.01562 21L5.01562 18C5.01562 16.0547 6.43555 15.1152 7.71875 15.1152L8.75 15.1152C8.75 15.1152 8.75 11.0859 4.92188 9.38086L5.48438 6.88086C5.48438 6.88086 12.0312 8.4375 12.0312 16.6367L12 21L5.01562 21Z" />
                                    </svg>
                                    <p className="text-gray-600 text-sm italic relative z-10 pl-4">{profile.quote}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
