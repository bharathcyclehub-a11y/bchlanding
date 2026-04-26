import { useState } from 'react';
import { motion } from 'framer-motion';
import Dropdown from '../components/Dropdown';

export default function DropdownDemo() {
  const [selectedCycle, setSelectedCycle] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedService, setSelectedService] = useState('');

  const cycleOptions = [
    {
      value: 'mountain',
      label: 'Mountain Bike',
      description: 'Perfect for off-road trails and rugged terrain'
    },
    {
      value: 'road',
      label: 'Road Bike',
      description: 'Lightweight and fast for smooth pavements'
    },
    {
      value: 'hybrid',
      label: 'Hybrid Bike',
      description: 'Best of both worlds for city and trails'
    },
    {
      value: 'electric',
      label: 'E-Bike',
      description: 'Pedal-assist for effortless riding'
    },
    {
      value: 'folding',
      label: 'Folding Bike',
      description: 'Compact and portable for commuters'
    }
  ];

  const brandOptions = [
    { value: 'emotorad', label: 'Emotorad', description: 'Premium electric bikes' },
    { value: 'firefox', label: 'Firefox', description: 'Trusted Indian brand' },
    { value: 'hero', label: 'Hero', description: 'Affordable and reliable' },
    { value: 'btwin', label: 'Btwin', description: 'Decathlon\'s cycling range' },
    { value: 'trek', label: 'Trek', description: 'Global performance leader' }
  ];

  const serviceOptions = [
    { value: 'basic', label: 'Basic Service - ₹99', description: 'Essential maintenance & tune-up' },
    { value: 'advanced', label: 'Advanced Service - ₹299', description: 'Complete overhaul & deep cleaning' },
    { value: 'doorstep', label: 'Doorstep Service - ₹349', description: 'We come to your home' },
    { value: 'premium', label: 'Premium Care - ₹599', description: 'Full restoration & warranty' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-bg via-white to-primary/5 py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="font-display text-5xl sm:text-6xl mb-4 tracking-wider uppercase">
            Premium Dropdown UI
          </h1>
          <p className="text-gray-text text-lg">
            UIverse-inspired dropdown components with smooth animations
          </p>
        </motion.div>

        {/* Demo Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Default Variant */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[20px] p-8 shadow-xl"
          >
            <div className="mb-4">
              <h3 className="font-display text-2xl mb-2 tracking-wide">DEFAULT VARIANT</h3>
              <p className="text-gray-text text-sm">Clean and simple design</p>
            </div>

            <Dropdown
              label="Choose Your Cycle Type"
              options={cycleOptions}
              value={selectedCycle}
              onChange={setSelectedCycle}
              placeholder="Select a cycle type..."
              variant="default"
            />

            {selectedCycle && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 bg-primary/5 rounded-[15px] border-l-4 border-primary"
              >
                <p className="text-sm font-bold text-dark">
                  Selected: {cycleOptions.find(opt => opt.value === selectedCycle)?.label}
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Premium Variant */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[20px] p-8 shadow-xl"
          >
            <div className="mb-4">
              <h3 className="font-display text-2xl mb-2 tracking-wide">PREMIUM VARIANT</h3>
              <p className="text-gray-text text-sm">Gradient effects and enhanced shadows</p>
            </div>

            <Dropdown
              label="Select Your Brand"
              options={brandOptions}
              value={selectedBrand}
              onChange={setSelectedBrand}
              placeholder="Choose a brand..."
              variant="premium"
            />

            {selectedBrand && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-[15px] border-l-4 border-primary"
              >
                <p className="text-sm font-bold text-dark">
                  Selected: {brandOptions.find(opt => opt.value === selectedBrand)?.label}
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Glass Variant */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-primary/20 to-primary/40 rounded-[20px] p-8 shadow-xl backdrop-blur-sm"
          >
            <div className="mb-4">
              <h3 className="font-display text-2xl mb-2 tracking-wide text-white">GLASS VARIANT</h3>
              <p className="text-white/80 text-sm">Glassmorphism with backdrop blur</p>
            </div>

            <Dropdown
              label="Service Type"
              options={serviceOptions}
              value={selectedService}
              onChange={setSelectedService}
              placeholder="Select service..."
              variant="glass"
            />

            {selectedService && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 bg-white/20 backdrop-blur-md rounded-[15px] border-l-4 border-white"
              >
                <p className="text-sm font-bold text-white">
                  Selected: {serviceOptions.find(opt => opt.value === selectedService)?.label}
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* All Together */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-[20px] p-8 shadow-xl"
          >
            <div className="mb-4">
              <h3 className="font-display text-2xl mb-2 tracking-wide">USAGE EXAMPLE</h3>
              <p className="text-gray-text text-sm">Quick selection summary</p>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-gray-bg rounded-[15px]">
                <h4 className="font-bold text-dark mb-2">Your Selection:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span className="text-gray-text">Cycle Type:</span>
                    <span className="font-bold text-dark">
                      {selectedCycle ? cycleOptions.find(opt => opt.value === selectedCycle)?.label : 'Not selected'}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span className="text-gray-text">Brand:</span>
                    <span className="font-bold text-dark">
                      {selectedBrand ? brandOptions.find(opt => opt.value === selectedBrand)?.label : 'Not selected'}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span className="text-gray-text">Service:</span>
                    <span className="font-bold text-dark">
                      {selectedService ? serviceOptions.find(opt => opt.value === selectedService)?.label : 'Not selected'}
                    </span>
                  </li>
                </ul>
              </div>

              {selectedCycle && selectedBrand && selectedService && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-primary text-white font-bold py-4 rounded-full uppercase tracking-wide shadow-lg hover:shadow-xl transition-all"
                >
                  Continue with Selection
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Code Example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-dark rounded-[20px] p-8 shadow-2xl"
        >
          <h3 className="font-display text-2xl mb-4 tracking-wide text-white">USAGE CODE</h3>
          <pre className="text-neon-green text-sm overflow-x-auto">
{`import Dropdown from './components/Dropdown';

const options = [
  {
    value: 'mountain',
    label: 'Mountain Bike',
    description: 'Perfect for off-road trails'
  },
  // ... more options
];

<Dropdown
  label="Choose Your Cycle Type"
  options={options}
  value={selectedValue}
  onChange={setSelectedValue}
  placeholder="Select..."
  variant="premium" // "default", "premium", "glass"
/>`}
          </pre>
        </motion.div>
      </div>
    </div>
  );
}
