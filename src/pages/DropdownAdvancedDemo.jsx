import { useState } from 'react';
import { motion } from 'framer-motion';
import DropdownAdvanced from '../components/DropdownAdvanced';

export default function DropdownAdvancedDemo() {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [selectedBike, setSelectedBike] = useState('');

  const cityOptions = [
    { value: 'jayanagar', label: 'Jayanagar', description: '15 min delivery', icon: '📍' },
    { value: 'koramangala', label: 'Koramangala', description: '20 min delivery', icon: '📍' },
    { value: 'whitefield', label: 'Whitefield', description: '30 min delivery', icon: '📍' },
    { value: 'indiranagar', label: 'Indiranagar', description: '15 min delivery', icon: '📍' },
    { value: 'yelahanka', label: 'Yelahanka', description: '25 min delivery', icon: '📍' },
    { value: 'malleshwaram', label: 'Malleshwaram', description: '18 min delivery', icon: '📍' },
    { value: 'btm', label: 'BTM Layout', description: '22 min delivery', icon: '📍' },
    { value: 'hsr', label: 'HSR Layout', description: '20 min delivery', icon: '📍' }
  ];

  const accessoryOptions = [
    { value: 'helmet', label: 'Helmet', description: '₹499 - Safety first', icon: '🪖' },
    { value: 'lock', label: 'U-Lock', description: '₹799 - Maximum security', icon: '🔒' },
    { value: 'lights', label: 'LED Lights', description: '₹399 - Front & rear', icon: '💡' },
    { value: 'bottle', label: 'Water Bottle', description: '₹199 - Stay hydrated', icon: '💧' },
    { value: 'pump', label: 'Air Pump', description: '₹299 - Portable mini', icon: '🔧' },
    { value: 'bell', label: 'Bell', description: '₹99 - Classic ring', icon: '🔔' },
    { value: 'basket', label: 'Front Basket', description: '₹599 - Extra storage', icon: '🧺' },
    { value: 'mudguard', label: 'Mudguards', description: '₹349 - Stay clean', icon: '🛡️' },
    { value: 'mirror', label: 'Rear Mirror', description: '₹249 - Enhanced safety', icon: '🪞' },
    { value: 'phone', label: 'Phone Mount', description: '₹399 - GPS ready', icon: '📱' }
  ];

  const bikeOptions = [
    {
      value: 'emx',
      label: 'Emotorad EMX',
      description: '₹19,400 - Electric mountain bike',
      icon: '🚴'
    },
    {
      value: 't-rex',
      label: 'Emotorad T-Rex',
      description: '₹25,999 - Premium electric',
      icon: '⚡'
    },
    {
      value: 'firefox',
      label: 'Firefox Road Runner',
      description: '₹12,999 - 21-speed road bike',
      icon: '🏁'
    },
    {
      value: 'hero-sprint',
      label: 'Hero Sprint',
      description: '₹8,499 - City commuter',
      icon: '🌆'
    },
    {
      value: 'btwin',
      label: 'Btwin Riverside',
      description: '₹15,999 - Hybrid comfort',
      icon: '🌳'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-light to-dark py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-block mb-4"
          >
            <span className="text-6xl">🚀</span>
          </motion.div>
          <h1 className="font-display text-5xl sm:text-7xl mb-4 tracking-wider uppercase text-white">
            Advanced Dropdown
          </h1>
          <p className="text-gray-light text-lg">
            Premium UIverse-inspired components with search, multi-select & icons
          </p>
        </motion.div>

        {/* Demo Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Searchable with Icons */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-lg rounded-[25px] p-8 border border-white/10 shadow-2xl"
          >
            <div className="mb-6">
              <h3 className="font-display text-3xl mb-2 tracking-wide text-white flex items-center gap-3">
                <span>🔍</span> SEARCHABLE
              </h3>
              <p className="text-gray-light text-sm">
                Type to filter through locations instantly
              </p>
            </div>

            <DropdownAdvanced
              label="Select Delivery Location"
              options={cityOptions}
              value={selectedCity}
              onChange={setSelectedCity}
              placeholder="Search your area..."
              searchable={true}
              showIcons={true}
            />

            {selectedCity && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-5 bg-primary/20 backdrop-blur-sm rounded-[20px] border-l-4 border-primary"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">
                    {cityOptions.find(opt => opt.value === selectedCity)?.icon}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white uppercase tracking-wide mb-1">
                      Delivering to
                    </p>
                    <p className="text-lg font-bold text-white">
                      {cityOptions.find(opt => opt.value === selectedCity)?.label}
                    </p>
                    <p className="text-sm text-white/70">
                      {cityOptions.find(opt => opt.value === selectedCity)?.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Multi-Select */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-lg rounded-[25px] p-8 border border-white/10 shadow-2xl"
          >
            <div className="mb-6">
              <h3 className="font-display text-3xl mb-2 tracking-wide text-white flex items-center gap-3">
                <span>✅</span> MULTI-SELECT
              </h3>
              <p className="text-gray-light text-sm">
                Choose multiple accessories for your bike
              </p>
            </div>

            <DropdownAdvanced
              label="Select Accessories"
              options={accessoryOptions}
              value={selectedAccessories}
              onChange={setSelectedAccessories}
              placeholder="Add accessories..."
              searchable={true}
              showIcons={true}
              multiSelect={true}
            />

            {selectedAccessories.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-5 bg-gradient-to-br from-primary/20 to-primary/30 backdrop-blur-sm rounded-[20px] border border-primary/30"
              >
                <p className="text-sm font-bold text-white uppercase tracking-wide mb-3">
                  Selected Items ({selectedAccessories.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedAccessories.map(accId => {
                    const acc = accessoryOptions.find(opt => opt.value === accId);
                    return (
                      <motion.span
                        key={accId}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold text-white border border-white/20"
                      >
                        <span>{acc?.icon}</span>
                        <span>{acc?.label}</span>
                        <button
                          onClick={() => setSelectedAccessories(selectedAccessories.filter(id => id !== accId))}
                          className="ml-1 hover:text-primary transition-colors"
                        >
                          ×
                        </button>
                      </motion.span>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-white font-bold">
                    Total: ₹{selectedAccessories.reduce((sum, accId) => {
                      const acc = accessoryOptions.find(opt => opt.value === accId);
                      const price = parseInt(acc?.description.match(/₹(\d+)/)?.[1] || 0);
                      return sum + price;
                    }, 0)}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Full Width Premium Example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-lg rounded-[25px] p-10 border-2 border-primary/30 shadow-2xl"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-display text-4xl mb-3 tracking-wide text-white flex items-center gap-3">
                <span>🚲</span> CHOOSE YOUR RIDE
              </h3>
              <p className="text-gray-light mb-6">
                Select from our premium collection of bicycles with detailed pricing and specifications
              </p>

              <DropdownAdvanced
                label="Select Bicycle Model"
                options={bikeOptions}
                value={selectedBike}
                onChange={setSelectedBike}
                placeholder="Browse our collection..."
                searchable={true}
                showIcons={true}
              />

              {selectedBike && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-8"
                >
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-primary text-white font-bold py-4 rounded-full uppercase tracking-wide shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <span>Book Test Ride</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </motion.button>
                </motion.div>
              )}
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-[20px] p-6 border border-white/10">
              <h4 className="font-bold text-white mb-4 uppercase tracking-wide text-sm">Your Build</h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-gray-light text-sm">Bicycle</span>
                  <span className="text-white font-bold">
                    {selectedBike ? bikeOptions.find(opt => opt.value === selectedBike)?.label : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-gray-light text-sm">Location</span>
                  <span className="text-white font-bold">
                    {selectedCity ? cityOptions.find(opt => opt.value === selectedCity)?.label : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-light text-sm">Accessories</span>
                  <span className="text-white font-bold">
                    {selectedAccessories.length || '—'}
                  </span>
                </div>
              </div>

              {selectedBike && selectedCity && selectedAccessories.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 pt-4 border-t border-white/20"
                >
                  <div className="flex items-center gap-2 text-neon-green">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-bold text-sm">Ready to checkout!</span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { icon: '🔍', title: 'Searchable', desc: 'Type to filter' },
            { icon: '✅', title: 'Multi-Select', desc: 'Choose multiple' },
            { icon: '🎨', title: 'Customizable', desc: 'Full control' },
            { icon: '⚡', title: 'Smooth Animations', desc: 'Framer Motion' }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white/5 backdrop-blur-sm rounded-[20px] p-6 border border-white/10 text-center"
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h4 className="font-bold text-white mb-1">{feature.title}</h4>
              <p className="text-sm text-gray-light">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
