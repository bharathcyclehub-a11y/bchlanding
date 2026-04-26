import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { electricFreebies } from '../../data/electricFreebies';
import LazyImage from '../LazyImage';

const specLabels = {
  wheelSize: 'Wheel Size',
  frameType: 'Frame',
  gearCount: 'Gears',
  brakeType: 'Brakes',
  weight: 'Weight',
  ageRange: 'Age Range',
  suspension: 'Suspension',
  motor: 'Motor',
  battery: 'Battery',
  range: 'Range',
};

export default function ProductTabs({ product, allProducts = [] }) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'whats-in-box', label: "What's in the Box" },
    { id: 'assembly', label: 'Assembly & Care' },
    ...(product.category === 'electric' ? [{ id: 'accessories-bch', label: 'Accessories by BCH' }] : []),
  ];

  // Build specs array from product
  const specsArray = Object.entries(product.specs)
    .map(([key, value]) => ({
      label: specLabels[key] || key,
      value,
      key,
    }))
    .filter((s) => s.value);

  return (
    <div className="mt-6 sm:mt-8">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex overflow-x-auto scrollbar-hide -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-semibold whitespace-nowrap transition-colors border-b-2 ${activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* About This Product */}
              <section>
                <h3 className="text-lg sm:text-xl font-bold text-dark mb-3">About this Product</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {product.shortDescription}
                </p>

                {/* Who is this for */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <h4 className="font-semibold text-dark mb-3">Perfect For:</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {product.specs.ageRange && (
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span><strong>Age:</strong> {product.specs.ageRange}</span>
                      </li>
                    )}
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span><strong>Riding Style:</strong> {getCategoryDescription(product.category)}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span><strong>Skill Level:</strong> Beginner to Intermediate</span>
                    </li>
                  </ul>
                </div>

                {/* Key Benefits */}
                <div>
                  <h4 className="font-semibold text-dark mb-3">Key Benefits:</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {getKeyBenefits(product).map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Compare Bikes */}
              {allProducts.length > 0 && (
                <CompareBikes currentProduct={product} allProducts={allProducts} />
              )}
            </div>
          )}

          {activeTab === 'specifications' && (
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-dark mb-4">Technical Specifications</h3>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {specsArray.map((spec, i) => (
                    <motion.div
                      key={spec.key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      className="flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-gray-600 font-medium">{spec.label}</span>
                      <span className="font-semibold text-dark text-right">{spec.value}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'whats-in-box' && (
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-dark mb-4">Package Contents</h3>
              <div className="space-y-3">
                <BoxItem
                  icon="🚲"
                  title="Bicycle (80% Pre-assembled)"
                  description="Front wheel, handlebars, and pedals need attachment"
                />
                <BoxItem
                  icon="📖"
                  title="User Manual & Warranty Card"
                  description="Step-by-step assembly guide with illustrations"
                />
                <BoxItem
                  icon="🔧"
                  title="Basic Toolkit"
                  description="All tools needed for assembly included"
                />
                <BoxItem
                  icon="🔔"
                  title="Safety Accessories"
                  description="Reflectors and bell included"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mt-6 text-sm text-blue-800">
                <strong>Note:</strong> Some models may include additional accessories like basket, water bottle holder, or kickstand. Check product specifications above.
              </div>
            </div>
          )}

          {activeTab === 'assembly' && (
            <div className="space-y-6">
              <section>
                <h3 className="text-lg sm:text-xl font-bold text-dark mb-4">Assembly Instructions</h3>
                <div className="space-y-4">
                  <AssemblyStep
                    number="1"
                    title="Unpack carefully"
                    description="Remove all packaging materials and check contents against box list"
                    time="2 minutes"
                  />
                  <AssemblyStep
                    number="2"
                    title="Attach front wheel"
                    description="Align the fork and secure with quick-release or nuts provided"
                    time="5 minutes"
                  />
                  <AssemblyStep
                    number="3"
                    title="Install handlebars"
                    description="Insert stem into frame, align, and tighten securely"
                    time="3 minutes"
                  />
                  <AssemblyStep
                    number="4"
                    title="Attach pedals"
                    description="Right pedal (R) turns clockwise, left pedal (L) turns counter-clockwise"
                    time="3 minutes"
                  />
                  <AssemblyStep
                    number="5"
                    title="Adjust seat height"
                    description="Set appropriate height and tighten seat post clamp"
                    time="2 minutes"
                  />
                </div>

                <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl mt-6">
                  <div className="flex items-center gap-3">
                    <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-purple-900">Need Assembly Help?</p>
                      <p className="text-sm text-purple-700">Book a free video call with our assembly expert</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg sm:text-xl font-bold text-dark mb-4">Maintenance & Care</h3>
                <div className="space-y-4">
                  <MaintenanceTip
                    icon="🔧"
                    title="Regular Checks (Weekly)"
                    items={[
                      'Check tire pressure (PSI marked on tire sidewall)',
                      'Test brakes for responsiveness',
                      'Ensure all bolts are tight',
                      'Lubricate chain if dry'
                    ]}
                  />
                  <MaintenanceTip
                    icon="🛠️"
                    title="First Service (After 1 month)"
                    items={[
                      'Professional tune-up recommended',
                      'Free at any BCH service center',
                      'Covers brake adjustment, gear tuning, wheel truing'
                    ]}
                  />
                  <MaintenanceTip
                    icon="🧼"
                    title="Cleaning"
                    items={[
                      'Wipe down with damp cloth after rides',
                      'Use mild soap for stubborn dirt',
                      'Avoid high-pressure water jets',
                      'Dry thoroughly to prevent rust'
                    ]}
                  />
                </div>
              </section>

            </div>
          )}

          {activeTab === 'accessories-bch' && (
            <div className="space-y-6">
              {/* Green banner */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-5 py-3 sm:py-4 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-bold text-sm sm:text-base">FREE with every Electric Cycle</p>
                  <p className="text-white/80 text-xs sm:text-sm">All these accessories & services included at no extra cost</p>
                </div>
              </div>

              {/* Accessories Grid */}
              <section>
                <h3 className="text-lg sm:text-xl font-bold text-dark mb-4">Free Accessories</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {electricFreebies.accessories.map((item, i) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 24 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100"
                    >
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 text-green-600 shadow-sm">
                        {bchAccessoryIcons[item.icon]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-dark truncate">{item.name}</p>
                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">FREE</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Warranty & Services */}
              <section>
                <h3 className="text-lg sm:text-xl font-bold text-dark mb-4">Warranty & Services</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {electricFreebies.warranty.map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 24 }}
                      className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-amber-50 border border-amber-100"
                    >
                      <div className="text-amber-600 mb-2">
                        {bchWarrantyIcons[item.icon]}
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-dark leading-tight">{item.value}</p>
                      <p className="text-[10px] sm:text-xs text-gray-text mt-0.5">{item.label}</p>
                    </motion.div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// BCH Accessory Icons
const bchAccessoryIcons = {
  bell: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  lock: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  mudguard: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>,
  'bottle-holder': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3h6v2H9V3zm0 2v2a3 3 0 00-3 3v8a3 3 0 003 3h6a3 3 0 003-3v-8a3 3 0 00-3-3V5" /></svg>,
  bottle: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 3h4v3h-4V3zm-1 3v1.5A3.5 3.5 0 005.5 11v7A2.5 2.5 0 008 20.5h8a2.5 2.5 0 002.5-2.5v-7A3.5 3.5 0 0015 7.5V6H9z" /></svg>,
  pump: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v18m0-18l-3 3m3-3l3 3M8 12h8M6 18h12" /></svg>,
  helmet: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4C8 4 4 8 4 12v2a2 2 0 002 2h1a1 1 0 001-1v-1a4 4 0 018 0v1a1 1 0 001 1h1a2 2 0 002-2v-2c0-4-4-8-8-8z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 16v2a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>,
  glasses: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2 12c0-2 2-5 5.5-5s4.5 3 4.5 5m0 0c0-2 1-5 4.5-5s5.5 3 5.5 5M12 12c0 0-1 0-2 0m4 0c1 0 2 0 2 0" /></svg>,
  light: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  'seat-cover': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 17l2-8h10l2 8M7 17h10M9 9V6a3 3 0 016 0v3" /></svg>,
  gift: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>,
};

// BCH Warranty Icons
const bchWarrantyIcons = {
  shield: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  battery: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7h14a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2zm18 4v2M7 11v2m3-2v2m3-2v2" /></svg>,
  motor: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  wrench: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  truck: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>,
};

// Helper Components
function BoxItem({ icon, title, description }) {
  return (
    <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
      <span className="text-3xl">{icon}</span>
      <div>
        <h4 className="font-semibold text-dark mb-1">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function AssemblyStep({ number, title, description, time }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
        {number}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-dark mb-1">{title}</h4>
        <p className="text-sm text-gray-600 mb-2">{description}</p>
        <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
          ⏱️ Time: {time}
        </span>
      </div>
    </div>
  );
}

function MaintenanceTip({ icon, title, items }) {
  return (
    <div className="bg-gray-50 p-4 rounded-xl">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <h4 className="font-semibold text-dark">{title}</h4>
      </div>
      <ul className="space-y-1.5 ml-11">
        {items.map((item, index) => (
          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Helper Functions
function getCategoryDescription(category) {
  const descriptions = {
    kids: 'Casual riding, learning to cycle, park activities',
    geared: 'Multi-terrain riding, fitness, daily commute',
    mountain: 'Off-road trails, rough terrain, adventure cycling',
    city: 'Urban commute, errands, leisure rides',
    electric: 'Eco-friendly commute, long distances, pedal-assist'
  };
  return descriptions[category] || 'Versatile everyday cycling';
}

function getKeyBenefits(product) {
  const benefits = [
    `Durable ${product.specs.frameType} frame built to last`,
    'Designed for Indian road conditions'
  ];

  if (product.specs.brakeType) {
    benefits.push(`Reliable ${product.specs.brakeType} braking system`);
  }

  if (product.specs.gearCount && product.specs.gearCount !== 'Single Speed') {
    benefits.push(`${product.specs.gearCount} for versatile riding`);
  }

  if (product.specs.suspension) {
    benefits.push('Suspension for comfortable rides on rough roads');
  }

  if (product.category === 'kids') {
    benefits.push('Safety features perfect for young riders');
  }

  if (product.category === 'electric') {
    benefits.push('Eco-friendly electric motor for effortless riding');
  }

  benefits.push('Easy assembly with included tools');
  benefits.push('Backed by 1-year warranty');

  return benefits;
}

// ────────────────────────────────────────
// Compare Bikes (inside Overview tab)
// ────────────────────────────────────────

const compareSpecKeys = [
  'wheelSize', 'frameType', 'gearCount', 'brakeType', 'weight',
  'ageRange', 'suspension', 'motor', 'battery', 'range',
];

function CompareBikes({ currentProduct, allProducts = [] }) {
  const [bikeA, setBikeA] = useState(currentProduct.id);
  const [bikeB, setBikeB] = useState('');
  const [isOpenA, setIsOpenA] = useState(false);
  const [isOpenB, setIsOpenB] = useState(false);
  const [searchA, setSearchA] = useState('');
  const [searchB, setSearchB] = useState('');

  useEffect(() => {
    setBikeA(currentProduct.id);
    setBikeB('');
  }, [currentProduct.id]);

  const productA = allProducts.find((p) => p.id === bikeA) || currentProduct;
  const productB = bikeB ? allProducts.find((p) => p.id === bikeB) : null;

  const activeSpecKeys = compareSpecKeys.filter(
    (key) => productA.specs?.[key] || (productB && productB.specs?.[key])
  );

  const discountA = productA.mrp > productA.price ? Math.round(((productA.mrp - productA.price) / productA.mrp) * 100) : 0;
  const discountB = productB && productB.mrp > productB.price ? Math.round(((productB.mrp - productB.price) / productB.mrp) * 100) : 0;

  return (
    <section className="mt-6">
      <h3 className="text-lg sm:text-xl font-bold text-dark mb-4">
        Compare <span className="text-primary">Bikes</span>
      </h3>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Bike Selectors + Images */}
        <div className="grid grid-cols-[1fr_1fr] sm:grid-cols-[120px_1fr_1fr] gap-0 min-w-0">
          <div className="hidden sm:block" />

          {/* Bike A Selector */}
          <div className="border-r border-b border-gray-100 p-2.5 sm:p-4 min-w-0">
            <div className="relative">
              <button
                onClick={() => { setIsOpenA(!isOpenA); setIsOpenB(false); setSearchA(''); }}
                className="w-full flex items-center justify-between gap-1 sm:gap-2 px-2.5 sm:px-3 py-2.5 sm:py-2.5 bg-dark text-white rounded-xl text-[11px] sm:text-sm font-bold min-h-[40px]"
              >
                <span className="truncate">{productA.name}</span>
                <svg className={`w-4 h-4 flex-shrink-0 transition-transform ${isOpenA ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {isOpenA && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-hidden flex flex-col"
                  >
                    <div className="sticky top-0 p-1.5 bg-white border-b border-gray-100">
                      <input
                        type="text"
                        value={searchA}
                        onChange={(e) => setSearchA(e.target.value)}
                        placeholder="Search bike..."
                        className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-primary text-dark placeholder:text-gray-400"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="overflow-y-auto">
                    {allProducts.filter((p) => !searchA || p.name.toLowerCase().includes(searchA.toLowerCase())).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => { setBikeA(p.id); setIsOpenA(false); }}
                        className={`w-full text-left px-3 py-2 text-xs sm:text-sm hover:bg-gray-bg transition-colors ${p.id === bikeA ? 'bg-primary/10 text-primary font-bold' : 'text-dark'}`}
                      >
                        {p.name}
                      </button>
                    ))}
                    {allProducts.filter((p) => !searchA || p.name.toLowerCase().includes(searchA.toLowerCase())).length === 0 && (
                      <p className="px-3 py-2 text-xs text-gray-400 text-center">No bikes found</p>
                    )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="mt-3 aspect-[4/3] rounded-xl overflow-hidden bg-gray-bg">
              <LazyImage src={productA.image} alt={productA.name} className="w-full h-full" />
            </div>
          </div>

          {/* Bike B Selector */}
          <div className="border-b border-gray-100 p-2.5 sm:p-4 min-w-0">
            <div className="relative">
              <button
                onClick={() => { setIsOpenB(!isOpenB); setIsOpenA(false); setSearchB(''); }}
                className={`w-full flex items-center justify-between gap-1 sm:gap-2 px-2.5 sm:px-3 py-2.5 sm:py-2.5 rounded-xl text-[11px] sm:text-sm font-bold min-h-[40px] ${productB ? 'bg-primary text-white' : 'bg-gray-200 text-gray-text'}`}
              >
                <span className="truncate">{productB ? productB.name : 'Select a bike'}</span>
                <svg className={`w-4 h-4 flex-shrink-0 transition-transform ${isOpenB ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {isOpenB && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-hidden flex flex-col"
                  >
                    <div className="sticky top-0 p-1.5 bg-white border-b border-gray-100">
                      <input
                        type="text"
                        value={searchB}
                        onChange={(e) => setSearchB(e.target.value)}
                        placeholder="Search bike..."
                        className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-primary text-dark placeholder:text-gray-400"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="overflow-y-auto">
                    {allProducts.filter((p) => p.id !== bikeA).filter((p) => !searchB || p.name.toLowerCase().includes(searchB.toLowerCase())).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => { setBikeB(p.id); setIsOpenB(false); }}
                        className={`w-full text-left px-3 py-2 text-xs sm:text-sm hover:bg-gray-bg transition-colors ${p.id === bikeB ? 'bg-primary/10 text-primary font-bold' : 'text-dark'}`}
                      >
                        {p.name}
                      </button>
                    ))}
                    {allProducts.filter((p) => p.id !== bikeA).filter((p) => !searchB || p.name.toLowerCase().includes(searchB.toLowerCase())).length === 0 && (
                      <p className="px-3 py-2 text-xs text-gray-400 text-center">No bikes found</p>
                    )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {productB ? (
              <div className="mt-3 aspect-[4/3] rounded-xl overflow-hidden bg-gray-bg">
                <LazyImage src={productB.image} alt={productB.name} className="w-full h-full" />
              </div>
            ) : (
              <div className="mt-3 aspect-[4/3] rounded-xl bg-gray-bg flex items-center justify-center">
                <div className="text-center text-gray-text">
                  <svg className="w-10 h-10 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <p className="text-xs font-medium">Pick a bike to compare</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Price Row */}
        <div className="grid grid-cols-[1fr_1fr] sm:grid-cols-[120px_1fr_1fr] border-b border-gray-100">
          <div className="hidden sm:flex items-center px-4 py-3 bg-gray-bg">
            <span className="text-xs font-bold text-dark uppercase tracking-wide">Price</span>
          </div>
          <div className="flex flex-col items-center justify-center px-2 sm:px-3 py-2.5 sm:py-4 border-r border-gray-100">
            <span className="text-sm sm:text-2xl font-bold text-primary">₹{productA.price.toLocaleString('en-IN')}</span>
            {discountA > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-text line-through">₹{productA.mrp.toLocaleString('en-IN')}</span>
                <span className="text-xs font-bold text-green-600">{discountA}% off</span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center justify-center px-2 sm:px-3 py-2.5 sm:py-4">
            {productB ? (
              <>
                <span className="text-sm sm:text-2xl font-bold text-primary">₹{productB.price.toLocaleString('en-IN')}</span>
                {discountB > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-text line-through">₹{productB.mrp.toLocaleString('en-IN')}</span>
                    <span className="text-xs font-bold text-green-600">{discountB}% off</span>
                  </div>
                )}
              </>
            ) : (
              <span className="text-sm text-gray-300">—</span>
            )}
          </div>
        </div>

        {/* Spec Rows */}
        {activeSpecKeys.map((key) => {
          const valA = productA.specs?.[key] || '—';
          const valB = productB ? (productB.specs?.[key] || '—') : null;
          return (
            <div key={key} className="grid grid-cols-[1fr_1fr] sm:grid-cols-[120px_1fr_1fr] border-b border-gray-100 last:border-b-0">
              <div className="hidden sm:flex items-center px-4 py-3 bg-gray-bg">
                <span className="text-xs font-bold text-dark uppercase tracking-wide">{specLabels[key]}</span>
              </div>
              <div className="flex flex-col items-center justify-center px-2 sm:px-3 py-2.5 sm:py-3 border-r border-gray-100 text-center">
                <span className="text-[10px] font-bold text-gray-text uppercase tracking-wide sm:hidden mb-0.5">{specLabels[key]}</span>
                <span className="text-[11px] sm:text-sm font-semibold text-dark">{valA}</span>
              </div>
              <div className="flex flex-col items-center justify-center px-2 sm:px-3 py-2.5 sm:py-3 text-center">
                {productB ? (
                  <>
                    <span className="text-[10px] font-bold text-gray-text uppercase tracking-wide sm:hidden mb-0.5">{specLabels[key]}</span>
                    <span className="text-[11px] sm:text-sm font-semibold text-dark">{valB}</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-300">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
