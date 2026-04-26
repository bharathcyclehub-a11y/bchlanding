import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { serviceCenters } from '../../data/accessories';

export default function WarrantyServiceSection({ warranty, category }) {
  const [selectedCity, setSelectedCity] = useState('');
  const [showAllCenters, setShowAllCenters] = useState(false);

  // Use product warranty or fall back to category defaults
  const warrantyData = warranty || getDefaultWarranty(category);

  // Get unique cities
  const cities = useMemo(() => {
    return [...new Set(serviceCenters.map(sc => sc.city))].sort();
  }, []);

  // Filter service centers by city
  const filteredCenters = useMemo(() => {
    if (!selectedCity) {
      return serviceCenters.slice(0, 3);
    }
    return serviceCenters.filter(sc => sc.city === selectedCity);
  }, [selectedCity]);

  const displayedCenters = showAllCenters
    ? filteredCenters
    : filteredCenters.slice(0, 2);

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mt-12 sm:mt-16"
    >
      <h2 className="font-display text-xl sm:text-2xl font-bold text-dark uppercase tracking-wider mb-6">
        Warranty & <span className="text-primary">Service</span>
      </h2>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">

          {/* Column 1: Warranty Coverage */}
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-dark">Warranty Coverage</h3>
                <p className="text-xs text-gray-text">
                  Frame: {warrantyData.frame} | Parts: {warrantyData.parts}
                  {warrantyData.battery && ` | Battery: ${warrantyData.battery}`}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-bold text-dark mb-2 flex items-center gap-1">
                  <span className="text-green-600">✓</span> Covers:
                </h4>
                <ul className="space-y-1.5">
                  {warrantyData.coverage.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex gap-2 text-sm text-gray-700"
                    >
                      <span className="text-green-600 font-bold">•</span>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-bold text-dark mb-2 flex items-center gap-1">
                  <span className="text-gray-400">✗</span> Excludes:
                </h4>
                <ul className="space-y-1.5">
                  {warrantyData.exclusions.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (warrantyData.coverage.length + i) * 0.05 }}
                      className="flex gap-2 text-sm text-gray-500"
                    >
                      <span className="text-gray-400">•</span>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Column 2: Free Services */}
          <div className="p-5 sm:p-6 bg-green-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-dark">Free Services Included</h3>
            </div>

            <ul className="space-y-3">
              {warrantyData.freeServices.map((service, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-3 items-start"
                >
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    {i + 1}
                  </div>
                  <span className="text-sm text-gray-700 leading-relaxed">{service}</span>
                </motion.li>
              ))}
            </ul>

            <div className="mt-4 p-3 bg-white rounded-xl text-xs text-gray-600 border border-green-200">
              <div className="flex gap-2">
                <span className="text-base">💡</span>
                <div>
                  <strong className="text-dark">Pro Tip:</strong> Schedule your first free service within 30 days for optimal performance and to maintain warranty validity.
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Service Center Locator */}
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-dark">Find Service Center</h3>
            </div>

            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setShowAllCenters(false);
              }}
              className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
            >
              <option value="">All Cities (Showing {serviceCenters.length})</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {displayedCenters.map((center, i) => (
                <motion.div
                  key={center.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gray-50 rounded-xl p-3 text-sm hover:shadow-md transition-shadow"
                >
                  <p className="font-bold text-dark flex items-start gap-2">
                    <span className="text-primary">📍</span>
                    <span>{center.area}, {center.city}</span>
                  </p>
                  <p className="text-xs text-gray-600 mt-1 ml-6">{center.address}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 ml-6 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <span>📞</span>
                      <a href={`tel:${center.phone}`} className="hover:text-primary transition-colors">
                        {center.phone}
                      </a>
                    </span>
                    <span className="flex items-center gap-1">
                      <span>🕒</span>
                      {center.timings}
                    </span>
                  </div>
                </motion.div>
              ))}

              {!selectedCity && serviceCenters.length > 3 && !showAllCenters && (
                <p className="text-xs text-gray-500 italic text-center py-2">
                  Select a city to see more locations
                </p>
              )}

              {selectedCity && filteredCenters.length > 2 && (
                <button
                  onClick={() => setShowAllCenters(!showAllCenters)}
                  className="w-full text-sm text-primary font-bold py-2 hover:underline transition-all"
                >
                  {showAllCenters
                    ? 'Show Less'
                    : `View ${filteredCenters.length - 2} More Center${filteredCenters.length - 2 > 1 ? 's' : ''}`}
                </button>
              )}

              {selectedCity && filteredCenters.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <p className="text-sm">No service centers found in {selectedCity}</p>
                  <p className="text-xs mt-1">We're expanding soon!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Claim Process Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 text-sm flex items-start gap-3"
      >
        <span className="text-2xl flex-shrink-0">⚠️</span>
        <div className="text-gray-700">
          <strong className="text-yellow-900">How to Claim Warranty:</strong> Visit any authorized service center with your original invoice and warranty card. Most claims are processed within 48 hours. Keep your bike clean and well-maintained to ensure warranty validity.
        </div>
      </motion.div>
    </motion.section>
  );
}

// Default warranty by category
function getDefaultWarranty(category) {
  const defaults = {
    kids: {
      frame: "2 years",
      parts: "6 months",
      coverage: [
        "Manufacturing defects",
        "Frame cracks under normal use",
        "Paint peeling (first 6 months)"
      ],
      exclusions: [
        "Normal wear and tear",
        "Accidental damage",
        "Improper assembly or modifications"
      ],
      freeServices: [
        "First tune-up (within 30 days)",
        "Brake adjustment (first 3 months)",
        "Chain lubrication (first service)"
      ]
    },
    geared: {
      frame: "3 years",
      parts: "1 year",
      coverage: [
        "Manufacturing defects",
        "Frame cracks under normal use",
        "Welding defects",
        "Paint peeling (first year)"
      ],
      exclusions: [
        "Normal wear and tear",
        "Accidental damage",
        "Modifications or improper maintenance"
      ],
      freeServices: [
        "First 3 tune-ups (within 6 months)",
        "Brake & gear adjustment (first year)",
        "Frame inspection (6 months)"
      ]
    },
    mountain: {
      frame: "5 years",
      parts: "1 year",
      coverage: [
        "Manufacturing defects",
        "Frame cracks under normal use",
        "Welding defects",
        "Suspension seals (first year)"
      ],
      exclusions: [
        "Normal wear and tear",
        "Crash damage",
        "Modifications or racing use"
      ],
      freeServices: [
        "First 3 tune-ups (within 6 months)",
        "Suspension service (first year)",
        "Brake bleed (if needed within 6 months)"
      ]
    },
    city: {
      frame: "3 years",
      parts: "1 year",
      coverage: [
        "Manufacturing defects",
        "Frame cracks under normal use",
        "Welding defects"
      ],
      exclusions: [
        "Normal wear and tear",
        "Rust from improper storage",
        "Modifications"
      ],
      freeServices: [
        "First tune-up (within 30 days)",
        "Brake adjustment (first 6 months)",
        "Carrier rack tightening (first 3 months)"
      ]
    },
    electric: {
      frame: "3 years",
      parts: "1 year",
      battery: "2 years",
      motor: "2 years",
      coverage: [
        "Manufacturing defects",
        "Frame cracks under normal use",
        "Battery capacity degradation beyond 20%",
        "Motor malfunction"
      ],
      exclusions: [
        "Normal wear and tear",
        "Water damage",
        "Overcharging or improper charging",
        "Modifications"
      ],
      freeServices: [
        "First 3 services (within 1 year)",
        "Battery health check (every 6 months for 2 years)",
        "Motor inspection (first year)"
      ]
    }
  };

  return defaults[category] || defaults.city;
}
